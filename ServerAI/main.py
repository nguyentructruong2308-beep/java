from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
from google.genai import types
from PIL import Image
import requests
import io
import json
import sys
import os

# Force unbuffered output and UTF-8 encoding
os.environ['PYTHONUNBUFFERED'] = '1'
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

app = Flask(__name__)
CORS(app)

# Setup file logging
import logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(message)s',
    handlers=[
        logging.FileHandler('debug.log', encoding='utf-8'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

@app.before_request
def log_request():
    logger.info(f"[REQUEST] {request.method} {request.path}")

API_KEY = "AIzaSyDXSKSrjdrqGo2wVkz6CbpsuOpxe7Es7D0"
# Dùng gemini-1.5-flash (vì 2.5-flash bị giới hạn 20 req/ngày)
MODEL_NAME = "gemini-2.5-flash" 

JAVA_API_URL = "http://localhost:8081/api/products"
TOPPING_API_URL = "http://localhost:8081/api/toppings"

client = genai.Client(api_key=API_KEY)

def get_restaurant_data():
    """Lấy dữ liệu sản phẩm và topping"""
    result = {"products": [], "toppings": []}
    
    try:
        # Lấy sản phẩm
        response = requests.get(f"{JAVA_API_URL}?pageNumber=0&pageSize=20", timeout=5)
        print(f"[Products] API status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            items = data.get('content', []) if isinstance(data, dict) else data
            for item in items:
                result["products"].append({
                    "id": item.get('id'),
                    "name": item.get('name'),
                    "price": item.get('price'),
                    "image": item.get('imageUrl')
                })
            print(f"[Products] Loaded: {len(result['products'])} items")
    except Exception as e:
        print(f"[ERROR] Fetching products: {e}")
    
    try:
        # Lấy toppings
        print(f"[Toppings] Fetching from: {TOPPING_API_URL}")
        response = requests.get(TOPPING_API_URL, timeout=5)
        print(f"[Toppings] API status: {response.status_code}")
        if response.status_code == 200:
            toppings = response.json()
            print(f"[Toppings] Raw response: {toppings}")
            for t in toppings:
                result["toppings"].append({
                    "id": t.get('id'),
                    "name": t.get('name'),
                    "price": t.get('price'),
                    "image": t.get('imageUrl')
                })
            print(f"[Toppings] Loaded: {len(result['toppings'])} items")
        else:
            print(f"[Toppings] API returned: {response.text}")
    except Exception as e:
        print(f"[ERROR] Fetching toppings: {e}")
    
    print(f"[Result] {len(result['products'])} products, {len(result['toppings'])} toppings")
    return json.dumps(result, ensure_ascii=False)

@app.route("/chat", methods=["POST"])
def chat_gemini():
    print("[SERVER] === NEW REQUEST RECEIVED ===")
    user_message = request.form.get("message", "").strip()
    image_file = request.files.get("image")
    audio_file = request.files.get("audio")
    user_name = request.form.get("user_name", "Anh/Chị")
    history_json = request.form.get("history", "[]")
    
    try:
        history = json.loads(history_json)
    except:
        history = []

    # 🔍 DEBUG LOG
    print(f"[Chat] Received from {user_name}: {user_message}")
    print(f"[Chat] History: {len(history)} messages")

    if not user_message and not image_file and not audio_file:
        return jsonify({"status": "error", "message": "Rỗng"}), 400

    try:
        menu_json = get_restaurant_data()

        # SYSTEM PROMPT: Thiết lập nhân vật "Đệ anh Trường"
        system_instruction = f"""
Bạn là Đệ anh Trường, trợ lý ảo thân thiện của {user_name} tại ICREAM. 

DỮ LIỆU CỬA HÀNG (JSON): {menu_json}

QUY TẮC BẮT BUỘC (TUYỆT ĐỐI TUÂN THỦ):
1. Xưng "Em/Đệ", gọi khách là "{user_name}". Thân thiện, dùng emoji.
2. LUÔN dựa vào lịch sử chat để biết khách đang chọn món nào.
3. KHÔNG BAO GIỜ thêm citation/trích dẫn như [1], [2], [3] vào câu trả lời.
4. KHÔNG BAO GIỜ viết thừa dấu ngoặc như [[TAG]].

5. QUY TRÌNH ĐẶT HÀNG (QUAN TRỌNG):
   - Khi khách chọn Kem: Khen món và gợi ý 2-3 topping phù hợp.
   - Khi khách chốt đơn (nói "chốt", "đặt", "xong rồi", "ok"): BẠN PHẢI GỬI LỆNH [ADD_TO_CART] Ở CUỐI CÂU TRẢ LỜI.
   - LƯU Ý: Nếu không có thẻ lệnh [ADD_TO_CART], món ăn sẽ KHÔNG được thêm vào giỏ. Đây là lệnh kỹ thuật bắt buộc.

6. CẤU TRÚC LỆNH CHUẨN:
   [ADD_TO_CART:{{"id":ID_KEM,"name":"TÊN_KEM","price":GIÁ,"image":"URL","q":SỐ_LƯỢNG,"toppingIds":[ID1,ID2]}}]
   
   - "toppingIds": Danh sách ID topping (mảng rỗng [] nếu khách không lấy). Nếu khách chọn topping bằng tên, hãy tra cứu ID tương ứng trong danh sách Toppings.
7. XỬ LÝ ÂM THANH:
   - Nếu khách gửi tin nhắn thoại, bạn PHẢI bắt đầu câu trả lời bằng tiền tố [TRANSCRIPT: <nội dung bạn nghe được từ khách>].
   - Sau đó mới đến câu trả lời của bạn.
   - Ví dụ: [TRANSCRIPT: Cho tôi một kem vani] Chào Anh/Chị, em đã nghe rõ rồi ạ...
"""

        contents = [system_instruction]
        
        # Chuẩn bị contents theo cấu trúc chuẩn của Gemini API
        contents = []
        
        # 1. Thêm System Instruction vào tin nhắn đầu tiên (Hoặc dùng system_instruction tham số nếu API hỗ trợ)
        # Ở đây ta giả lập bằng cách đưa vào tin nhắn đầu
        
        # 2. Chuyển đổi lịch sử chat (Giới hạn 10 tin nhắn)
        # 🛡️ Lọc bỏ các tin nhắn lỗi hoặc "không nghe được" trong quá khứ để tránh AI bị lặp lại
        filtered_history = []
        error_keywords = ["gặp sự cố", "chưa nghe được", "thử lại", "lỗi"]
        for msg in history:
            content = str(msg.get("content", ""))
            if not any(kw in content.lower() for kw in error_keywords):
                filtered_history.append(msg)

        for msg in filtered_history[-10:]:
            role = "user" if msg.get("role") == "user" else "model"
            content = msg.get("content", "")
            
            # Xử lý nội dung văn bản (bóc tách từ mảng parsed nếu có)
            text_parts = []
            if isinstance(content, list):
                text_parts.append(" ".join([c.get("content", "") for c in content if c.get("type") == 'text']))
            else:
                text_parts.append(str(content))
                
            contents.append({
                "role": role,
                "parts": [{"text": t} for t in text_parts]
            })

        # Chuẩn bị current_parts (Sẽ gộp text, ảnh, audio vào đây)
        current_parts = []
        if user_message:
            current_parts.append({"text": user_message})
        else:
            current_parts.append({"text": "Khách gửi tệp đa phương tiện (ảnh/âm thanh)"})
        
        # 4. Thêm hình ảnh nếu có
        if image_file:
            import tempfile
            import os
            
            logger.info(f"[Image] Filename: {image_file.filename}")
            
            with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
                image_file.save(tmp.name)
                tmp_path = tmp.name
            
            # Upload file cho Gemini
            image_upload = client.files.upload(file=tmp_path)
            
            # Chờ file xử lý (Ảnh thường rất nhanh)
            import time
            image_upload = client.files.get(name=image_upload.name)
            if image_upload.state.name == "ACTIVE":
                current_parts.append(types.Part.from_uri(
                    file_uri=image_upload.uri,
                    mime_type=image_upload.mime_type
                ))
            
            os.remove(tmp_path)
        
        # 5. Xử lý audio nếu có (Gộp vào current_parts)
        if audio_file:
            import tempfile
            import os
            
            logger.info(f"[Audio] Filename: {audio_file.filename}")
            
            with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
                audio_file.save(tmp.name)
                tmp_path = tmp.name
            
            file_size = os.path.getsize(tmp_path)
            if file_size > 1000:
                with open(tmp_path, "rb") as f:
                    audio_bytes = f.read()
                
                logger.info(f"[Audio] Adding inline bytes, size: {len(audio_bytes)}")
                current_parts.append(types.Part.from_bytes(
                    data=audio_bytes,
                    mime_type="audio/webm;codecs=opus"
                ))
                current_parts.append({"text": "Đây là tin nhắn thoại từ khách. Hãy lắng nghe CỰC KỲ KỸ âm thanh này và thực hiện yêu cầu trong đó."})
            
            os.remove(tmp_path)

        # Gộp tất cả vào contents
        contents.append({
            "role": "user",
            "parts": current_parts
        })
        
        # 🔍 LOG CHI TIẾT CÁC PHẦN GỬI ĐI
        logger.info(f"[Gemini] Final parts counts: {len(current_parts)}")
        for i, p in enumerate(current_parts):
            p_type = "Text" if "text" in str(p).lower() else "Data"
            logger.info(f"  Part {i}: {p_type}")

        # 🛡️ TRUYỀN SYSTEM INSTRUCTION ĐÚNG CẤU TRÚC SDK
        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.7,
        )
        
        # 🛡️ GỌI GEMINI VỚI FALLBACK
        try:
            response = client.models.generate_content(
                model=MODEL_NAME, 
                contents=contents,
                config=config
            )
        except Exception as e:
            if "429" in str(e) or "quota" in str(e).lower():
                logger.warning(f"Model {MODEL_NAME} hết quota! Đang dùng gemini-1.5-flash thay thế...")
                response = client.models.generate_content(
                    model="gemini-1.5-flash", 
                    contents=contents,
                    config=config
                )
            else:
                raise e
        
        # 🔍 PHÂN TÍCH RESPONSE ĐỂ TÁCH TRANSCRIPT
        full_reply = response.text
        user_transcription = ""
        is_voice = False
        
        if audio_file and "[TRANSCRIPT:" in full_reply:
            import re
            match = re.search(r"\[TRANSCRIPT:(.*?)\]", full_reply, re.DOTALL)
            if match:
                user_transcription = match.group(1).strip()
                full_reply = full_reply.replace(match.group(0), "").strip()
                is_voice = True

        logger.info(f"[AI] Transcription: {user_transcription}")
        logger.info(f"[AI] Reply: {full_reply}")

        return jsonify({
            "status": "success",
            "reply": full_reply,
            "user_transcription": user_transcription,
            "is_voice": is_voice
        })

    except Exception as e:
        import traceback
        error_msg = f"[ERROR] Exception: {e}\n{traceback.format_exc()}"
        print(error_msg)
        # Also write to file
        with open("error.log", "a", encoding="utf-8") as f:
            f.write(f"\n{'='*50}\n{error_msg}\n")
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)