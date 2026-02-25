import React, { useState, useRef, useEffect } from 'react';
import { FaComments, FaTimes, FaPaperPlane, FaRobot, FaUser, FaMicrophone, FaImage, FaStop, FaShoppingCart } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/api';

const FLASK_API_URL = 'http://localhost:5000';

const money = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

// Floating Ice Cream Particles Component
const FloatingParticles = () => {
  const emojis = ['🍦', '🍨', '🧁', '🍰', '🍩', '🎂', '🍪'];
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'hidden',
      pointerEvents: 'none',
      zIndex: 0
    }}>
      {[...Array(8)].map((_, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            fontSize: 20 + Math.random() * 16,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: 0.3 + Math.random() * 0.3,
            animation: `floatAround ${8 + Math.random() * 6}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`
          }}
        >
          {emojis[Math.floor(Math.random() * emojis.length)]}
        </span>
      ))}
    </div>
  );
};

const FloatingChatWidget = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem('chat_history');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed.map(msg => ({
        ...msg,
        // Important: Image cannot be stored in sessionStorage, so clear it
        image: null,
        timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
      })) : [];
    } catch (e) {
      console.error('Lỗi load chat history:', e);
      return [];
    }
  });
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [cartMessage, setCartMessage] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [flyingItem, setFlyingItem] = useState(null);
  const [isCartBumping, setIsCartBumping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Fetch initial cart count
  useEffect(() => {
    fetchCartCount();

    const handleGlobalAnimate = (e) => {
      const { image, startX, startY } = e.detail;
      const cartEl = document.getElementById('main-header-cart');
      const cartRect = cartEl ? cartEl.getBoundingClientRect() : { left: window.innerWidth - 150, top: 40, width: 40, height: 40 };

      setFlyingItem({
        image,
        startX,
        startY,
        endX: cartRect.left + cartRect.width / 2,
        endY: cartRect.top + cartRect.height / 2
      });

      setTimeout(() => setFlyingItem(null), 1700);
    };

    const handleCartUpdate = () => fetchCartCount();

    window.addEventListener('cartAnimate', handleGlobalAnimate);
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartAnimate', handleGlobalAnimate);
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);
  

  const fetchCartCount = async () => {
    // 🛡️ AUTH CHECK: Không gọi API nếu không có token hoặc đang ở các trang đăng nhập/đăng ký
    const isAdminPath = window.location.pathname.startsWith('/admin');
    const storageKey = isAdminPath ? "admin_user" : "user";
    const token = localStorage.getItem(storageKey);
    const isAuthPage = window.location.pathname.includes('/login') || window.location.pathname.includes('/register');

    if (!token || isAuthPage) {
      if (cartCount !== 0) setCartCount(0);
      return;
    }

    try {
      const res = await API.get('/cart');
      if (res.data) {
        setCartCount(res.data.reduce((total, item) => total + item.quantity, 0));
      }
    } catch (e) { 
      console.error('Lỗi fetch cart:', e);
      // Nếu lỗi 401 thì không làm gì thêm ở đây, interceptor sẽ lo, 
      // nhưng ở đây ta đã chặn trước bằng check token rồi.
    }
  };

  useEffect(() => {
    sessionStorage.setItem('chat_history', JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: '🍦 Xin chào! Em là trợ lý AI của ICREAM.\n\n✨ Em có thể giúp anh/chị:\n• Tìm món ngon\n• Thêm vào giỏ hàng\n• Tư vấn sản phẩm\n\nAnh/chị cần gì ạ? 😊',
        timestamp: new Date().toISOString()
      }]);
    }
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const parseResponse = (text) => {
    if (!text) return [];
    
    // 🛡️ CHIẾN THUẬT AN TOÀN: Chỉ dọn dẹp trích dẫn ở phần TEXT, không đụng vào TAG
    const cleanText = (t) => t.replace(/\[\d+\]/g, '').replace(/\[source\]/gi, '').replace(/\[\]/g, '');

    const parts = [];
    let lastIndex = 0;
    
    // Tag regex cải tiến: Nhận diện cả ngoặc vuông bên trong JSON (như toppingIds: [5]) bằng cách tìm cặp }]
    const tagRegex = /\[+(ADD_TO_CART|PRODUCT_CARD)[\s\S]*?\}\s*\]+|\[+(CHECKOUT_CARD)\]+/gi;
    
    let match;
    while ((match = tagRegex.exec(text)) !== null) {
      // 1. Lưu phần text trước tag (và dọn dẹp trích dẫn ở đây)
      const textBefore = text.substring(lastIndex, match.index).trim();
      if (textBefore) parts.push({ type: 'text', content: cleanText(textBefore) });

      const fullTag = match[0];
      const tagName = (match[1] || match[2]).toUpperCase();

      if (tagName === 'CHECKOUT_CARD') {
        parts.push({ type: 'checkout' });
      } else {
        // 🛡️ EMERGENCY JSON EXTRACTOR: Xử lý triệt để lỗi citation [n] bám dính
        let rawContent = fullTag;
        const startIndex = rawContent.indexOf('{');
        const endIndex = rawContent.lastIndexOf('}');

        if (startIndex !== -1 && endIndex !== -1) {
          try {
            let jsonSubset = rawContent.substring(startIndex, endIndex + 1).trim();
            
            // Dọn dẹp nhẹ nhàng JSON nếu AI lỡ viết citation [n] bên trong giá trị chuỗi
            let cleanJson = jsonSubset.replace(/:\s*"([^"]*)"\[\d+\]/g, ':"$1"').replace(/\s+/g, ' ').trim();

            const data = JSON.parse(cleanJson);
            if (tagName === 'ADD_TO_CART') {
              parts.push({ type: 'add_cart', data: data });
              addToCart(data);
            } else {
              parts.push({ type: 'product_card', data: data });
            }
          } catch (e) {
            console.error('Lỗi Parse JSON trong Tag:', e, fullTag);
            parts.push({ type: 'text', content: fullTag });
          }
        } else {
          parts.push({ type: 'text', content: fullTag });
        }
      }
      lastIndex = tagRegex.lastIndex;
    }

    // 2. Lưu phần text còn lại
    const textAfter = text.substring(lastIndex).trim();
    if (textAfter) parts.push({ type: 'text', content: cleanText(textAfter) });

    return parts;
  };

  const addToCart = async (item) => {
    console.log('🛒 AI Đang thêm vào giỏ hàng:', item);
    
    // 🚀 BẮT ĐẦU HIỆU ỨNG BAY RA GIỎ HÀNG CHÍNH
    const cartEl = document.getElementById('main-header-cart');
    const cartRect = cartEl ? cartEl.getBoundingClientRect() : { left: window.innerWidth - 150, top: 40, width: 40, height: 40 };

    setFlyingItem({
      image: item.image || item.imageUrl,
      startX: window.innerWidth - 300, 
      startY: window.innerHeight - 300,
      endX: cartRect.left + cartRect.width / 2,
      endY: cartRect.top + cartRect.height / 2
    });

    try {
      const params = new URLSearchParams();
      const pId = item.productId || item.id;
      if (!pId) throw new Error('Thiếu ID sản phẩm');

      params.append('productId', pId);
      params.append('quantity', item.q || item.quantity || 1);
      
      if (item.toppingIds && Array.isArray(item.toppingIds)) {
        item.toppingIds.forEach(top => {
          const topId = (typeof top === 'object') ? (top.id || top.toppingId) : top;
          if (topId) params.append('toppingIds', topId);
        });
      }

      const res = await API.post(`/cart/add?${params.toString()}`);
      if (res.status === 201 || res.status === 200) {
        setCartMessage({ success: true, name: item.name });
        
        // 💫 HIỆU ỨNG RUNG GIỎ & CẬP NHẬT SỐ LƯỢNG
        setIsCartBumping(true);
        setTimeout(() => setIsCartBumping(false), 500);
        fetchCartCount();

        // Đồng bộ với Header bằng cách dispatch event (tùy chọn)
        window.dispatchEvent(new Event('cartUpdated'));

        setTimeout(() => {
          setCartMessage(null);
          setFlyingItem(null); 
        }, 1800);
      }
    } catch (error) {
      console.error('Lỗi thêm giỏ hàng:', error);
      const errMsg = error.response?.data?.message || 'Có lỗi xảy ra, vui lòng đăng nhập';
      setCartMessage({ success: false, error: errMsg });
      setFlyingItem(null);
      setTimeout(() => setCartMessage(null), 3000);
    }
  };

  const sendMessage = async (audioBlob = null) => {
    if (!inputValue.trim() && !selectedImage && !audioBlob) return;

    const userMessage = {
      role: 'user',
      content: inputValue.trim() || (audioBlob ? '🎤 Tin nhắn thoại' : '📷 Gửi ảnh'),
      image: selectedImage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => {
      const updated = [...prev, userMessage];
      sessionStorage.setItem('chat_history', JSON.stringify(updated));
      return updated;
    });
    
    // Save references before clearing state
    const imageToSend = selectedImage;
    const messageToSend = inputValue.trim();
    
    setInputValue('');
    setSelectedImage(null);
    setIsTyping(true);

    try {
      const formData = new FormData();
      formData.append('message', messageToSend);
      formData.append('user_name', 'Bạn');
      
      const history = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: Array.isArray(msg.content) 
          ? msg.content.filter(p => p.type === 'text').map(p => p.content).join(' ')
          : msg.content
      }));
      formData.append('history', JSON.stringify(history));

      if (imageToSend) formData.append('image', imageToSend);
      if (audioBlob) formData.append('audio', audioBlob, 'recording.webm');

      const res = await fetch(`${FLASK_API_URL}/chat`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (data.status === 'success') {
        const parsed = parseResponse(data.reply);
        
        setMessages(prev => {
          let newMessages = [...prev];
          
          // 🎤 Cập nhật văn bản đã nghe được từ giọng nói của người dùng
          if (data.user_transcription) {
            const lastUserMsgIndex = newMessages.findLastIndex(m => m.role === 'user');
            if (lastUserMsgIndex !== -1) {
              newMessages[lastUserMsgIndex] = {
                ...newMessages[lastUserMsgIndex],
                content: `🎤 ${data.user_transcription}`
              };
            }
          }

          const updated = [...newMessages, {
            role: 'assistant',
            content: parsed,
            timestamp: new Date().toISOString()
          }];
          sessionStorage.setItem('chat_history', JSON.stringify(updated));
          return updated;
        });

        // 🔊 AI trả lời bằng giọng nói nếu phát hiện input là voice
        if (data.is_voice) {
          speakText(data.reply);
        }
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: [{ type: 'text', content: '😔 Xin lỗi, em gặp sự cố. Vui lòng thử lại!' }],
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return;
    
    const cleanText = text.replace(/\[ADD_TO_CART:.*?\]/g, '').trim();
    if (!cleanText) return;

    window.speechSynthesis.cancel();

    const doSpeak = () => {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      const voices = window.speechSynthesis.getVoices();
      
      const viVoices = voices.filter(v => v.lang.includes('vi'));
      console.log("Vi Voices found:", viVoices.map(v => v.name));

      // � CHIẾN THUẬT: 
      // 1. Tìm giọng có tên nữ (An, Linh, Google, Female)
      // 2. Nếu không có, tìm giọng KHÔNG có chữ "Nam" hoặc "Male"
      // 3. Cuối cùng mới lấy giọng đầu tiên
      let selectedVoice = viVoices.find(v => 
        v.name.includes('An') || v.name.includes('Linh') || v.name.includes('Google') || v.name.includes('Female')
      ) || viVoices.find(v => !v.name.includes('Nam') && !v.name.includes('Male')) 
        || viVoices[0];

      if (selectedVoice) {
        console.log("Selected:", selectedVoice.name);
        utterance.voice = selectedVoice;
        
        // 🛠️ FIX CỨNG: Nếu tên giọng có chữ "Nam" (giọng nam mặc định) -> ÉP PITCH LÊN CAO để nghe như nữ
        if (selectedVoice.name.includes('Nam') || selectedVoice.name.includes('Male')) {
          utterance.pitch = 1.6; // ÉP MẠNH để thành giọng nữ/con nít
          utterance.rate = 1.1;
        } else {
          utterance.pitch = 1.2; // Giọng nữ nhẹ nhàng
          utterance.rate = 1.0;
        }
      }
      
      utterance.lang = 'vi-VN';
      window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        // Chỉ chạy một lần
        window.speechSynthesis.onvoiceschanged = null;
        doSpeak();
      };
    } else {
      doSpeak();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        await sendMessage(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      alert('Không thể truy cập microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const formatMessage = (content) => {
    if (typeof content === 'string') {
      return content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>');
    }
    return content;
  };

  const renderMessageContent = (content) => {
    if (typeof content === 'string') {
      return <div dangerouslySetInnerHTML={{ __html: formatMessage(content) }} />;
    }

    if (Array.isArray(content)) {
      return content.map((part, idx) => {
        if (part.type === 'text') {
          return <div key={idx} dangerouslySetInnerHTML={{ __html: formatMessage(part.content) }} />;
        }
        if (part.type === 'product_card') {
          return (
            <div key={idx} style={{
              marginTop: 12,
              padding: 14,
              background: 'linear-gradient(135deg, #fff5f7 0%, #fdf2f8 100%)',
              borderRadius: 18,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              border: '2px solid #fce7f3',
              boxShadow: '0 4px 20px rgba(236, 72, 153, 0.1)'
            }}>
              {part.data.image && <img src={part.data.image} alt="" style={{ 
                width: 60, height: 60, borderRadius: 14, objectFit: 'cover',
                border: '2px solid white',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }} />}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#1e293b', marginBottom: 4 }}>{part.data.name}</div>
                <div style={{ color: '#ec4899', fontWeight: 800, fontSize: 16 }}>{money(part.data.price)}</div>
              </div>
              <Link to={`/product/${part.data.id}`} style={{
                padding: '10px 18px',
                background: 'linear-gradient(135deg, #ec4899, #db2777)',
                color: 'white',
                borderRadius: 14,
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: 700,
                boxShadow: '0 4px 16px rgba(236, 72, 153, 0.3)',
                transition: 'transform 0.2s'
              }}>Xem</Link>
            </div>
          );
        }
        if (part.type === 'add_cart') {
          return (
            <div key={idx} style={{
              marginTop: 12,
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
              color: '#065f46',
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 14,
              fontWeight: 600,
              border: '2px solid #6ee7b7'
            }}>
              <FaShoppingCart size={18} /> Đã thêm <strong>{part.data.name}</strong> x{part.data.q || 1} vào giỏ! 🎉
            </div>
          );
        }
        if (part.type === 'checkout') {
          return (
            <button key={idx} onClick={() => navigate('/cart')} style={{
              marginTop: 12,
              padding: '14px 24px',
              background: 'linear-gradient(135deg, #ec4899, #db2777)',
              color: 'white',
              border: 'none',
              borderRadius: 16,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontWeight: 700,
              fontSize: 15,
              boxShadow: '0 6px 24px rgba(236, 72, 153, 0.4)',
              transition: 'all 0.3s'
            }}>
              <FaShoppingCart size={18} /> 🛒 Đi đến thanh toán
            </button>
          );
        }
        return null;
      });
    }
    return null;
  };

  return (
    <>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-8px); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 8px #22c55e, 0 0 16px rgba(34, 197, 94, 0.3); }
          50% { box-shadow: 0 0 16px #22c55e, 0 0 32px rgba(34, 197, 94, 0.5); }
        }
        @keyframes floatAround {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(10px, -15px) rotate(5deg); }
          50% { transform: translate(-5px, -25px) rotate(-5deg); }
          75% { transform: translate(-15px, -10px) rotate(3deg); }
        }
        @keyframes iceCreamBounce {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        @keyframes fabPulse {
          0% { box-shadow: 0 8px 32px rgba(236, 72, 153, 0.4), 0 0 0 0 rgba(236, 72, 153, 0.4); }
          70% { box-shadow: 0 8px 32px rgba(236, 72, 153, 0.4), 0 0 0 20px rgba(236, 72, 153, 0); }
          100% { box-shadow: 0 8px 32px rgba(236, 72, 153, 0.4), 0 0 0 0 rgba(236, 72, 153, 0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .chat-messages::-webkit-scrollbar { width: 6px; }
        .chat-messages::-webkit-scrollbar-thumb { background: rgba(236, 72, 153, 0.3); border-radius: 3px; }
        .chat-icon-btn:hover { transform: scale(1.1) !important; }
        @keyframes flyToCart {
          0% { 
            left: var(--startX); 
            top: var(--startY); 
            transform: scale(1) rotate(0deg); 
            opacity: 1; 
            filter: brightness(1);
          }
          50% {
            transform: scale(1.2) rotate(15deg);
            filter: brightness(1.1);
          }
          100% { 
            left: var(--endX); 
            top: var(--endY); 
            transform: scale(0.1) rotate(360deg); 
            opacity: 0; 
            filter: brightness(1.2);
          }
        }
        .flying-img {
          position: fixed;
          width: 100px;
          height: 100px;
          object-fit: cover;
          border-radius: 20px;
          z-index: 99999;
          pointer-events: none;
          /* Cập nhật tốc độ bay xuống 1.7s theo yêu cầu */
          animation: flyToCart 1.7s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          border: 4px solid white;
          box-shadow: 0 15px 45px rgba(0,0,0,0.3);
        }
        @keyframes cartBump {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.4) rotate(-10deg); }
        }
        .cart-bump { animation: cartBump 0.5s ease-out; }
        .chat-badge-red {
          position: absolute;
          top: -6px;
          right: -6px;
          background: #ff4d4d;
          color: white;
          font-size: 10px;
          font-weight: 800;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
      `}</style>

      {/* 🍦 Premium Floating Action Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: isHovered ? 72 : 68,
          height: isHovered ? 72 : 68,
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          zIndex: 10000,
          background: isOpen 
            ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' 
            : 'linear-gradient(135deg, #ec4899 0%, #f43f5e 50%, #fb923c 100%)',
          boxShadow: isHovered 
            ? '0 12px 40px rgba(236, 72, 153, 0.5), 0 0 0 6px rgba(236, 72, 153, 0.15)'
            : '0 8px 32px rgba(236, 72, 153, 0.4)',
          transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          animation: !isOpen ? 'fabPulse 2s infinite' : 'none',
          transform: isHovered ? 'rotate(-10deg)' : 'rotate(0deg)'
        }}
      >
        {isOpen ? (
          <span style={{ fontSize: 26 }}>✕</span>
        ) : (
          <span style={{ 
            fontSize: 32, 
            animation: 'iceCreamBounce 2s ease-in-out infinite',
            textShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}>🍦</span>
        )}
        
        {/* AI Badge */}
        {!isOpen && (
          <span style={{
            position: 'absolute',
            top: -6,
            right: -6,
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white',
            fontSize: 10,
            fontWeight: 800,
            padding: '5px 10px',
            borderRadius: 20,
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
            animation: 'pulse 2s infinite'
          }}>AI</span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: 110,
          right: 24,
          width: 400,
          maxWidth: 'calc(100vw - 48px)',
          height: 580,
          maxHeight: 'calc(100vh - 160px)',
          borderRadius: 28,
          overflow: 'hidden',
          zIndex: 9999,
          background: '#ffffff',
          boxShadow: '0 25px 80px rgba(236, 72, 153, 0.15), 0 0 0 1px rgba(236, 72, 153, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUp 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
        }}>
          
          {/* 🎀 Premium Header */}
          <div style={{
            background: 'linear-gradient(135deg, #ec4899 0%, #db2777 50%, #be185d 100%)',
            padding: '20px 22px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Header Particles */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.3, pointerEvents: 'none' }}>
              {['🍦', '🧁', '🍨'].map((e, i) => (
                <span key={i} style={{
                  position: 'absolute',
                  fontSize: 20,
                  right: 60 + i * 40,
                  top: 10 + i * 15,
                  animation: `floatAround ${6 + i}s ease-in-out infinite`
                }}>{e}</span>
              ))}
            </div>
            
            <div style={{
              width: 54,
              height: 54,
              borderRadius: 18,
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              border: '2px solid rgba(255,255,255,0.3)',
              fontSize: 28
            }}>
              🍦
              <span style={{
                position: 'absolute',
                bottom: -4,
                right: -4,
                width: 16,
                height: 16,
                background: '#22c55e',
                borderRadius: '50%',
                border: '3px solid white',
                animation: 'glow 2s infinite'
              }}></span>
            </div>
            <div style={{ flex: 1, zIndex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 19, textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                ICREAM AI �
              </div>
              <div style={{ fontSize: 13, opacity: 0.9, marginTop: 2 }}>
                {isRecording ? '🎙️ Đang ghi âm...' : isTyping ? '⌛ Đang trả lời...' : '🟢 Sẵn sàng hỗ trợ'}
              </div>
            </div>
            <button 
              onClick={() => navigate('/cart')}
              className={isCartBumping ? 'cart-bump' : ''}
              style={{
                width: 38,
                height: 38,
                borderRadius: '12px',
                border: 'none',
                background: 'rgba(255,255,255,0.15)',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                marginRight: 8,
                position: 'relative',
                padding: 0
              }}
            >
              <FaShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="chat-badge-red">
                  {cartCount}
                </span>
              )}
            </button>
            <button onClick={() => setIsOpen(false)} style={{
              width: 40,
              height: 40,
              borderRadius: 14,
              border: 'none',
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              zIndex: 1,
              fontSize: 20
            }}>
              ✕
            </button>
          </div>

          {/* Cart Notification */}
          {cartMessage && (
            <div style={{
              padding: '14px 18px',
              textAlign: 'center',
              fontWeight: 700,
              fontSize: 14,
              background: cartMessage.success 
                ? 'linear-gradient(135deg, #d1fae5, #a7f3d0)' 
                : 'linear-gradient(135deg, #fee2e2, #fecaca)',
              color: cartMessage.success ? '#065f46' : '#991b1b',
              borderBottom: `2px solid ${cartMessage.success ? '#6ee7b7' : '#fca5a5'}`
            }}>
              {cartMessage.success ? `✅ Đã thêm ${cartMessage.name} vào giỏ! 🛒` : `❌ ${cartMessage.error}`}
            </div>
          )}

          {/* Messages with Floating Particles */}
          <div className="chat-messages" style={{
            flex: 1,
            overflowY: 'auto',
            padding: 18,
            background: 'linear-gradient(180deg, #fdf2f8 0%, #faf5ff 50%, #f8fafc 100%)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            position: 'relative'
          }}>
            <FloatingParticles />
            
            {messages.map((msg, idx) => (
              <div key={idx} style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                gap: 12,
                alignItems: 'flex-end',
                position: 'relative',
                zIndex: 1
              }}>
                {msg.role === 'assistant' && (
                  <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: 14,
                    background: 'linear-gradient(135deg, #ec4899, #db2777)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    flexShrink: 0,
                    fontSize: 18,
                    boxShadow: '0 4px 16px rgba(236, 72, 153, 0.3)'
                  }}>
                    🍦
                  </div>
                )}
                <div style={{
                  maxWidth: '75%',
                  padding: '16px 20px',
                  borderRadius: msg.role === 'user' ? '22px 22px 6px 22px' : '22px 22px 22px 6px',
                  background: msg.role === 'user' 
                    ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' 
                    : 'white',
                  color: msg.role === 'user' ? 'white' : '#1e293b',
                  boxShadow: msg.role === 'user'
                    ? '0 6px 24px rgba(139, 92, 246, 0.3)'
                    : '0 4px 20px rgba(0,0,0,0.08)',
                  fontSize: 14,
                  lineHeight: 1.7,
                  border: msg.role === 'user' ? 'none' : '1px solid rgba(236, 72, 153, 0.1)'
                }}>
                  {msg.image && msg.image instanceof Blob && (
                    <img src={URL.createObjectURL(msg.image)} alt="" style={{
                      maxWidth: '100%',
                      borderRadius: 14,
                      marginBottom: 10
                    }} />
                  )}
                  {renderMessageContent(msg.content)}
                  <div style={{
                    fontSize: 11,
                    opacity: 0.5,
                    marginTop: 8,
                    textAlign: 'right'
                  }}>
                    {(() => {
                      const date = msg.timestamp ? new Date(msg.timestamp) : new Date();
                      if (isNaN(date.getTime())) return '...';
                      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                    })()}
                  </div>
                </div>
                {msg.role === 'user' && (
                  <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: 14,
                    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    flexShrink: 0,
                    boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)'
                  }}>
                    <FaUser size={16} />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', zIndex: 1 }}>
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, #ec4899, #db2777)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18
                }}>
                  🍦
                </div>
                <div style={{
                  padding: '18px 26px',
                  background: 'white',
                  borderRadius: 22,
                  display: 'flex',
                  gap: 8,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{
                      width: 12,
                      height: 12,
                      background: 'linear-gradient(135deg, #ec4899, #db2777)',
                      borderRadius: '50%',
                      animation: 'bounce 1.4s infinite',
                      animationDelay: `${i * 0.2}s`
                    }}></span>
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Image Preview */}
          {selectedImage && (
            <div style={{
              padding: '12px 18px',
              background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              borderTop: '2px solid #fcd34d'
            }}>
              <img src={URL.createObjectURL(selectedImage)} alt="" style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                objectFit: 'cover',
                border: '2px solid white',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }} />
              <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#92400e' }}>{selectedImage.name}</span>
              <button onClick={() => setSelectedImage(null)} style={{
                background: 'rgba(146, 64, 14, 0.1)',
                border: 'none',
                cursor: 'pointer',
                color: '#92400e',
                padding: 8,
                borderRadius: 10
              }}>
                <FaTimes />
              </button>
            </div>
          )}

          {/* 💎 Premium Input Area */}
          <div style={{
            padding: '14px 12px',
            background: 'linear-gradient(180deg, #ffffff, #fdf2f8)',
            borderTop: '1px solid #fce7f3',
            display: 'flex',
            gap: 8,
            alignItems: 'center'
          }}>
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              hidden 
              onChange={(e) => setSelectedImage(e.target.files[0])} 
            />
            
            <button 
              className="chat-icon-btn"
              onClick={() => fileInputRef.current?.click()} 
              style={{
                width: 42,
                height: 42,
                borderRadius: 14,
                border: '2px solid #fce7f3',
                background: 'white',
                color: '#ec4899',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(236, 72, 153, 0.1)'
              }}
            >
              <span style={{ fontWeight: 'bold', fontSize: 22 }}>+</span>
            </button>

            <button 
              className="chat-icon-btn"
              onClick={isRecording ? stopRecording : startRecording}
              style={{
                width: 42,
                height: 42,
                borderRadius: 14,
                border: isRecording ? 'none' : '2px solid #fce7f3',
                background: isRecording ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'white',
                color: isRecording ? 'white' : '#ec4899',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                transition: 'all 0.2s',
                boxShadow: isRecording ? '0 4px 20px rgba(239, 68, 68, 0.4)' : '0 4px 12px rgba(236, 72, 153, 0.1)',
                animation: isRecording ? 'pulse 1s infinite' : 'none'
              }}
            >
              {isRecording ? '■' : '●'}
            </button>

            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Nhập tin nhắn..."
              disabled={isRecording}
              style={{
                flex: 1,
                minWidth: 0,
                padding: '12px 14px',
                borderRadius: 16,
                border: '2px solid #fce7f3',
                fontSize: 14,
                outline: 'none',
                transition: 'all 0.2s',
                background: 'white',
                boxShadow: '0 2px 8px rgba(236, 72, 153, 0.05)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#ec4899';
                e.target.style.boxShadow = '0 0 0 4px rgba(236, 72, 153, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#fce7f3';
                e.target.style.boxShadow = '0 4px 12px rgba(236, 72, 153, 0.05)';
              }}
            />

            <button 
              onClick={() => sendMessage()}
              disabled={(!inputValue.trim() && !selectedImage) || isTyping || isRecording}
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                border: 'none',
                flexShrink: 0,
                background: inputValue.trim() || selectedImage 
                  ? 'linear-gradient(135deg, #ec4899, #db2777)' 
                  : '#fce7f3',
                color: inputValue.trim() || selectedImage ? 'white' : '#f9a8d4',
                cursor: inputValue.trim() || selectedImage ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                transition: 'all 0.3s',
                boxShadow: inputValue.trim() || selectedImage 
                  ? '0 4px 16px rgba(236, 72, 153, 0.35)' 
                  : 'none'
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}
      {/* 🚀 Flying Animation Layer */}
      {flyingItem && (
        <div 
          className="flying-img" 
          style={{ 
            '--startX': `${flyingItem.startX}px`,
            '--startY': `${flyingItem.startY}px`,
            '--endX': `${flyingItem.endX}px`, // Bay ra giỏ hàng chính ở Header
            '--endY': `${flyingItem.endY}px`,
            backgroundImage: `url(${flyingItem.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }} 
        />
      )}
    </>
  );
};

export default FloatingChatWidget;
