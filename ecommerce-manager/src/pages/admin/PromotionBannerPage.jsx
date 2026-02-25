import React, { useEffect, useState } from 'react';
import API from '../../api/api';
import { Table, Button, Modal, Form, Spinner, Alert, Badge, Image, Card, Container, Row, Col, InputGroup } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSyncAlt, FaCloudUploadAlt, FaLink, FaImage } from 'react-icons/fa';
import imageService from "../../api/imageService"; 
import { confirmSwal, toastSwal, successSwal, errorSwal } from '../../utils/swal';

export default function PromotionBannerPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  
  // Thêm state xử lý upload
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    targetUrl: '',
    isActive: true,
  });

  const fetchBanners = async () => {
    try {
      setLoading(true);
      setError('');
      // Giữ nguyên URL /promotions
      const res = await API.get('/promotions');
      setBanners(res.data);
    } catch (err) {
      setError('Không thể tải danh sách banner.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // --- SELECTION HANDLERS ---
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(banners.map(b => b.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    const result = await confirmSwal(
      `Xóa ${selectedIds.length} banner?`, 
      "Hành động này sẽ xóa vĩnh viễn các banner đã chọn. Bạn có chắc không?"
    );
    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      await Promise.all(selectedIds.map(id => API.delete(`/promotions/${id}`)));
      successSwal("Thành công!", `Đã xóa ${selectedIds.length} banner.`);
      setSelectedIds([]);
      fetchBanners();
    } catch (err) {
      errorSwal("Lỗi!", "Có lỗi xảy ra khi xóa hàng loạt.");
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (banner = null) => {
    if (banner) {
      setIsEditing(true);
      setSelectedBanner(banner);
      setFormData({
        title: banner.title,
        imageUrl: banner.imageUrl,
        targetUrl: banner.targetUrl,
        isActive: banner.isActive,
      });
    } else {
      setIsEditing(false);
      setSelectedBanner(null);
      setFormData({ title: '', imageUrl: '', targetUrl: '', isActive: true });
    }
    setImageFile(null); // Reset file khi mở modal
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (isSubmitting) return;
    setShowModal(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Thêm hàm xử lý khi chọn file
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      let finalData = { ...formData };

      // Nếu có chọn file ảnh mới, thực hiện upload lên Cloudinary trước
      if (imageFile) {
        const uploadedUrl = await imageService.uploadImageToCloudinary(imageFile);
        finalData.imageUrl = uploadedUrl;
      }

      if (isEditing) {
        await API.put(`/promotions/${selectedBanner.id}`, finalData);
      } else {
        await API.post('/promotions', finalData);
      }
      fetchBanners();
      successSwal("Thành công!", isEditing ? 'Banner đã được cập nhật.' : 'Banner mới đã được thêm vào hệ thống.');
    } catch (err) {
      errorSwal("Thất bại!", err.response?.data?.message || 'Có lỗi xảy ra trong quá trình xử lý.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await confirmSwal('Bạn có chắc chắn?', 'Hành động này sẽ xóa vĩnh viễn banner này!');
    if (result.isConfirmed) {
      try {
        await API.delete(`/promotions/${id}`);
        fetchBanners();
        successSwal("Đã xóa!", "Banner đã được gỡ bỏ khỏi website.");
      } catch (err) {
        errorSwal("Lỗi!", "Không thể xóa banner này vào lúc này.");
      }
    }
  };

  return (
    <div style={{ backgroundColor: '#f4f6f9', minHeight: '100vh' }} className="pb-5">
      <Container fluid="lg" className="py-4">
        
        {/* HEADER ĐỒNG BỘ GIAO DIỆN PRO */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
          <div>
            <h4 className="fw-bolder text-dark mb-1">Thiết lập Banner quảng cáo</h4>
            <p className="text-muted mb-0 small">Cập nhật hình ảnh khuyến mãi cho website</p>
          </div>
          <div className="d-flex gap-2 mt-3 mt-md-0 align-items-center">
            {selectedIds.length > 0 && (
              <Button variant="danger" className="fw-bold px-3 shadow-sm" onClick={handleBulkDelete}>
                <FaTrash className="me-2" /> Xóa {selectedIds.length} mục
              </Button>
            )}
            <Button variant="white" className="shadow-sm bg-white border-0 text-primary fw-bold" onClick={fetchBanners}>
              <FaSyncAlt className={`me-2 ${loading ? 'fa-spin' : ''}`} /> Làm mới
            </Button>
            <Button variant="primary" className="fw-bold px-3 shadow-sm" onClick={() => handleShowModal()}>
              <FaPlus className="me-2" /> Thêm Banner
            </Button>
          </div>
        </div>

        {error && <Alert variant="danger" className="border-0 shadow-sm">{error}</Alert>}

        {/* BẢNG DANH SÁCH BANNER */}
        <Card className="border-0 shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden' }}>
          <Card.Body className="p-0">
            <Table hover responsive className="align-middle mb-0">
              <thead className="bg-light text-muted uppercase small fw-bold">
                <tr>
                  <th className="px-4 py-3 border-0" style={{ width: '40px' }}>
                    <Form.Check 
                      type="checkbox"
                      checked={banners.length > 0 && selectedIds.length === banners.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="border-0">ID</th>
                  <th className="border-0">Ảnh Banner</th>
                  <th className="border-0">Tiêu đề & Liên kết</th>
                  <th className="border-0 text-center">Trạng thái</th>
                  <th className="border-0 text-end px-4">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <Spinner animation="border" variant="primary" size="sm" />
                    </td>
                  </tr>
                ) : banners.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">Chưa có banner nào</td>
                  </tr>
                ) : (
                  banners.map((banner) => (
                    <tr key={banner.id} className={selectedIds.includes(banner.id) ? "bg-light-primary" : ""}>
                      <td className="px-4">
                        <Form.Check 
                          type="checkbox"
                          checked={selectedIds.includes(banner.id)}
                          onChange={() => handleSelectOne(banner.id)}
                        />
                      </td>
                      <td className="text-muted">#{banner.id}</td>
                      <td>
                        <Image 
                          src={banner.imageUrl || "https://placehold.co/150x50?text=No+Image"} 
                          className="rounded shadow-sm border" 
                          style={{ width: '150px', height: '50px', objectFit: 'cover' }} 
                        />
                      </td>
                      <td>
                        <div className="fw-bold text-dark">{banner.title}</div>
                        <div className="text-muted small text-truncate" style={{ maxWidth: '200px' }}>
                          <FaLink className="me-1" size={10}/> {banner.targetUrl}
                        </div>
                      </td>
                      <td className="text-center">
                        <Badge bg={banner.isActive ? 'success' : 'secondary'} className="bg-opacity-10 text-dark fw-normal border px-3">
                          {banner.isActive ? 'Hoạt động' : 'Tạm dừng'}
                        </Badge>
                      </td>
                      <td className="text-end px-4">
                        <Button variant="light" size="sm" className="me-2 text-primary shadow-sm border" onClick={() => handleShowModal(banner)}>
                          <FaEdit />
                        </Button>
                        <Button variant="light" size="sm" className="text-danger shadow-sm border" onClick={() => handleDelete(banner.id)}>
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Container>

      {/* MODAL THÊM/SỬA - TÍCH HỢP CHỌN FILE */}
      <Modal show={showModal} onHide={handleCloseModal} centered backdrop="static">
        <Form>
          <Modal.Header closeButton className="border-0 px-4 pt-4">
            <Modal.Title className="fw-bold">
              {isEditing ? 'Cập nhật Banner' : 'Thêm Banner mới'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="px-4 pb-4">
            
            {/* VÙNG PREVIEW VÀ CHỌN ẢNH */}
            <div className="text-center mb-4 p-3 bg-light rounded-3 border shadow-sm position-relative">
              <Image 
                src={imageFile ? URL.createObjectURL(imageFile) : (formData.imageUrl || "https://placehold.co/600x200?text=No+Image")} 
                className="img-fluid rounded border mb-2" 
                style={{ maxHeight: '120px', width: '100%', objectFit: 'cover' }} 
              />
              <Form.Label htmlFor="banner-upload" className="btn btn-sm btn-primary position-absolute bottom-0 end-0 m-3 shadow-sm">
                <FaCloudUploadAlt className="me-1" /> Chọn ảnh từ máy
              </Form.Label>
              <input type="file" id="banner-upload" hidden accept="image/*" onChange={handleFileChange} />
            </div>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold text-uppercase">Tiêu đề Banner</Form.Label>
              <Form.Control 
                type="text" 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                placeholder="VD: Khuyến mãi Tết 2024"
                className="bg-light border-0 py-2 shadow-none"
                required 
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold text-uppercase">Đường dẫn khi click (URL)</Form.Label>
              <InputGroup>
                <InputGroup.Text className="bg-light border-0"><FaLink size={12}/></InputGroup.Text>
                <Form.Control 
                  type="text" 
                  name="targetUrl" 
                  value={formData.targetUrl} 
                  onChange={handleChange} 
                  placeholder="/collections/sale-off"
                  className="bg-light border-0 py-2 shadow-none"
                  required 
                />
              </InputGroup>
            </Form.Group>

            <div className="p-3 bg-light rounded-3 shadow-sm border mt-3">
              <Form.Check
                type="switch"
                id="is-active-switch"
                label="Kích hoạt hiển thị trên trang chủ"
                className="fw-bold small"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
            </div>
          </Modal.Body>
          <Modal.Footer className="border-0 px-4 pb-4 mt-2">
            <Button variant="light" className="fw-bold px-4 shadow-sm" onClick={handleCloseModal}>Huỷ bỏ</Button>
            <Button variant="primary" className="fw-bold px-4 shadow-sm" onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? <><Spinner size="sm" animation="border" className="me-2" /> Đang lưu...</> : "Lưu Banner"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}