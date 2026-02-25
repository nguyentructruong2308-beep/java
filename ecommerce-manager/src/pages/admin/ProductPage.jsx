import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import API from "../../api/api";
import { confirmSwal, successSwal, errorSwal } from "../../utils/swal";
import { FaPlus, FaEdit, FaTrash, FaBox, FaStar, FaSearch, FaCloudUploadAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Button, Table, Modal, Form, Badge, Row, Col, Image, Card, Container, Spinner, InputGroup, Pagination } from "react-bootstrap";
import imageService from "../../api/imageService";
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const getImageUrl = (url) => {
    if (!url) return "https://placehold.co/100";
    if (url.startsWith("http")) return url;
    return `${API.defaults.baseURL}/files/download/${url}`;
};

export default function ProductsPage() {

    // --- STATE ---
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProductId, setEditingProductId] = useState(null);
    const [modalKey, setModalKey] = useState(0);

    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [selectedIds, setSelectedIds] = useState([]);

    const getInitialFormState = () => ({
        name: "",
        price: "",
        categoryId: "",
        description: "",
        imageUrl: "",
        isFeatured: false,
        stockQuantity: 0, // Tồn kho cho sản phẩm không có biến thể
        availableSizes: "", // Các size có sẵn (VD: "M,L,XL")
        sizePrices: {}, // [MỚI] Giá theo size
        variants: [],
    });

    const [currentProduct, setCurrentProduct] = useState(getInitialFormState());

    // [MỚI] State quản lý danh sách size (Name + Price) cho giao diện nhập liệu
    const [sizeList, setSizeList] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadingVariantIndex, setUploadingVariantIndex] = useState(null);

    // [MỚI] React Quill ref và state cho image upload
    const quillRef = useRef(null);
    const [uploadingEditorImage, setUploadingEditorImage] = useState(false);

    // [MỚI] Custom image handler - upload ảnh lên Cloudinary thay vì base64
    const imageHandler = useCallback(() => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files[0];
            if (!file) return;

            setUploadingEditorImage(true);
            try {
                // Upload lên Cloudinary
                const url = await imageService.uploadImageToCloudinary(file);

                // Chèn ảnh với URL vào editor
                const quill = quillRef.current?.getEditor();
                if (quill) {
                    const range = quill.getSelection(true);
                    quill.insertEmbed(range.index, 'image', url);
                    quill.setSelection(range.index + 1);
                }
            } catch (error) {
                console.error('Lỗi upload ảnh:', error);
                errorSwal('Lỗi!', 'Không thể tải ảnh lên. Vui lòng thử lại.');
            } finally {
                setUploadingEditorImage(false);
            }
        };
    }, []);

    // [MỚI] Quill modules với custom image handler
    const quillModules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'align': [] }],
                ['link', 'image'],
                ['clean']
            ],
            handlers: {
                image: imageHandler
            }
        }
    }), [imageHandler]);

    // --- API CALLS ---
    const loadProducts = async (page = 0) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page,
                size: pageSize,
            });

            // Use /search endpoint when filters are applied
            let endpoint = '/products';
            if (searchTerm || filterCategory) {
                endpoint = '/products/search';
                if (searchTerm) params.set('name', searchTerm);
                if (filterCategory) params.set('categoryId', filterCategory);
            }

            const res = await API.get(`${endpoint}?${params.toString()}`);
            const data = res.data.content || res.data;
            setProducts(Array.isArray(data) ? data : []);
            setTotalPages(res.data.totalPages || 1);
            setTotalElements(res.data.totalElements || data.length);
        } catch (error) {
            console.error(error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const res = await API.get("/categories");
            setCategories(Array.isArray(res.data) ? res.data : []);
        } catch (error) { console.error(error); }
    };

    useEffect(() => { loadCategories(); }, []);

    // Debounce search and reset page when filters change
    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentPage(0); // Reset to first page when filters change
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, filterCategory]);

    useEffect(() => {
        loadProducts(currentPage);
    }, [currentPage]);

    // Also reload when filters change (after debounce resets page)
    useEffect(() => {
        if (currentPage === 0) {
            loadProducts(0);
        }
    }, [searchTerm, filterCategory]);

    const handlePageChange = (page) => {
        if (page >= 0 && page < totalPages) {
            setCurrentPage(page);
            setSelectedIds([]); // Reset selection on page change
        }
    };


    const formatMoney = (v) => Number(v)?.toLocaleString('vi-VN') + ' ₫';

    // --- SELECTION HANDLERS ---
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(products.map(p => p.id));
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
            `Xóa ${selectedIds.length} sản phẩm?`,
            "Hành động này sẽ xóa vĩnh viễn các sản phẩm đã chọn. Bạn có chắc không?"
        );
        if (!result.isConfirmed) return;

        try {
            setLoading(true);
            await Promise.all(selectedIds.map(id => API.delete(`/products/${id}`)));
            successSwal("Thành công!", `Đã xóa ${selectedIds.length} sản phẩm.`);
            setSelectedIds([]);
            loadProducts(currentPage);
        } catch (error) {
            errorSwal("Lỗi!", "Có lỗi xảy ra khi xóa hàng loạt.");
        } finally {
            setLoading(false);
        }
    };


    // --- HANDLERS ---
    const handleAddNew = () => {
        setEditingProductId(null);
        setCurrentProduct(getInitialFormState());
        setImageFile(null);
        setModalKey(prev => prev + 1);
        setIsModalOpen(true);
    };

    const handleEdit = async (product) => {
        try {
            const res = await API.get(`/products/${product.id}`);
            setEditingProductId(product.id);
            const pData = res.data;
            setCurrentProduct({
                ...pData,
                categoryId: String(pData.categoryId),
                variants: pData.variants || [],
                sizePrices: pData.sizePrices || {},
            });

            // [MỚI] Parse availableSizes và sizePrices thành sizeList
            if (pData.availableSizes) {
                const sizes = pData.availableSizes.split(',').map(s => s.trim()).filter(Boolean);
                const list = sizes.map(s => ({
                    id: Date.now() + Math.random(),
                    name: s,
                    price: (pData.sizePrices && pData.sizePrices[s]) ? pData.sizePrices[s] : "",
                }));
                setSizeList(list);
            } else {
                setSizeList([]);
            }

            setImageFile(null);
            setModalKey(prev => prev + 1);
            setIsModalOpen(true);
        } catch { errorSwal("Lỗi!", "Không thể tải dữ liệu sản phẩm."); }
    };

    const closeModal = () => { if (!isSubmitting) setIsModalOpen(false); };

    // --- VARIANTS ---
    const handleAddVariant = () => {
        setCurrentProduct(prev => ({
            ...prev,
            variants: [...prev.variants, { color: "", colorImageUrl: "", productSize: "", sku: "", stockQuantity: 0, price: "", imageUrl: "" }]
        }));
    };

    const handleRemoveVariant = (index) => {
        setCurrentProduct(prev => ({ ...prev, variants: prev.variants.filter((_, i) => i !== index) }));
    };

    const handleVariantChange = (index, field, value) => {
        const updatedVariants = [...currentProduct.variants];
        updatedVariants[index][field] = value;
        setCurrentProduct(prev => ({ ...prev, variants: updatedVariants }));
    };

    const handleVariantImageUpload = async (index, file, type) => {
        if (!file) return;
        setUploadingVariantIndex(index);
        try {
            const url = await imageService.uploadImageToCloudinary(file);
            handleVariantChange(index, type === 'color' ? "colorImageUrl" : "imageUrl", url);
        } catch { errorSwal("Lỗi tải ảnh!", "Vui lòng kiểm tra lại kết nối mạng."); }
        finally { setUploadingVariantIndex(null); }
    };

    // --- SUBMIT ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentProduct.categoryId) return errorSwal("Thông báo", "Vui lòng chọn danh mục cho sản phẩm!");
        // Chỉ kiểm tra SKU nếu có biến thể
        if (currentProduct.variants.length > 0 && currentProduct.variants.some(v => !v.sku?.trim())) {
            return errorSwal("Thông báo", "Thiếu mã SKU cho các biến thể!");
        }

        setIsSubmitting(true);
        const productData = { ...currentProduct };

        // [MỚI] Convert sizeList về availableSizes và sizePrices
        if (productData.variants.length === 0) {
            const validSizes = sizeList.filter(s => s.name?.trim());
            productData.availableSizes = validSizes.map(s => s.name.trim()).join(",");

            const prices = {};
            validSizes.forEach(s => {
                // Chuyển đổi giá từ string sang number để backend xử lý được
                if (s.price) prices[s.name.trim()] = parseFloat(s.price);
            });
            productData.sizePrices = prices;
        } else {
            productData.availableSizes = "";
            productData.sizePrices = {};
        }

        // Xử lý description rỗng từ React Quill (loại bỏ HTML trống)
        if (productData.description === '<p><br></p>' || productData.description === '<p></p>') {
            productData.description = '';
        }

        try {
            if (imageFile) productData.imageUrl = await imageService.uploadImageToCloudinary(imageFile);

            if (editingProductId) {
                await API.put(`/products/${editingProductId}`, productData);
                successSwal("Thành công!", "Sản phẩm đã được cập nhật.");
            } else {
                await API.post("/products", productData);
                successSwal("Tuyệt vời!", "Sản phẩm mới đã được thêm vào hệ thống.");
            }
            setIsModalOpen(false);
            loadProducts(currentPage);
        } catch (err) { errorSwal("Lỗi!", err.response?.data?.message || "Thao tác thất bại."); }
        finally { setIsSubmitting(false); }
    };

    const handleDelete = async (id) => {
        const product = products.find(p => p.id === id);
        if (!product) return;

        const isRestoring = !product.isActive;
        const title = isRestoring ? "Khôi phục sản phẩm?" : "Xóa sản phẩm?";
        const text = isRestoring
            ? "Sản phẩm này sẽ xuất hiện lại trên cửa hàng."
            : "Sản phẩm này sẽ bị ẩn khỏi cửa hàng. Bạn có chắc không?";

        const result = await confirmSwal(title, text);
        if (!result.isConfirmed) return;

        try {
            if (isRestoring) {
                // Backend dùng PUT để update trạng thái
                await API.put(`/products/${id}`, { ...product, isActive: true });
                successSwal("Đã khôi phục!", "Sản phẩm hiện đã hoạt động trở lại.");
            } else {
                await API.delete(`/products/${id}`);
                successSwal("Đã ẩn!", "Sản phẩm đã được ẩn khỏi hệ thống.");
            }
            loadProducts(currentPage);
        } catch (err) {
            errorSwal("Lỗi!", err.response?.data?.message || "Thao tác thất bại.");
        }
    };

    // --- RENDER ---
    return (
        <div style={{ backgroundColor: '#f4f6f9', minHeight: '100vh' }} className="pb-5">
            <Container fluid="lg" className="py-4">
                <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
                    <Card.Body className="p-4">
                        <Row className="align-items-center">
                            <Col md={4}>
                                <h4 className="fw-bolder mb-1">Quản lý sản phẩm</h4>
                                <p className="text-muted small mb-0">Tổng số: {totalElements} sản phẩm</p>
                            </Col>
                            <Col md={8}>
                                <div className="d-flex gap-2 justify-content-md-end mt-3 mt-md-0 flex-wrap align-items-center">
                                    {selectedIds.length > 0 && (
                                        <Button variant="danger" className="fw-bold shadow-sm px-3 border-0 py-2" onClick={handleBulkDelete}>
                                            <FaTrash className="me-2" /> Xóa {selectedIds.length} mục
                                        </Button>
                                    )}
                                    <InputGroup style={{ maxWidth: '300px' }}>
                                        <InputGroup.Text className="bg-white border-end-0"><FaSearch className="text-muted" /></InputGroup.Text>
                                        <Form.Control placeholder="Tìm tên..." className="border-start-0 shadow-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                    </InputGroup>
                                    <Form.Select style={{ maxWidth: '200px' }} className="shadow-none" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                                        <option value="">Tất cả danh mục</option>
                                        {categories.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
                                    </Form.Select>
                                    <Button variant="primary" className="fw-bold px-3 shadow-sm" onClick={handleAddNew}><FaPlus className="me-2" /> Thêm mới</Button>
                                </div>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                <Card className="border-0 shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                    <Table responsive hover className="align-middle mb-0">
                        <thead className="bg-light">
                            <tr className="text-uppercase small text-muted border-bottom">
                                <th className="px-4 py-3 border-0" style={{ width: '40px' }}>
                                    <Form.Check
                                        type="checkbox"
                                        checked={products.length > 0 && selectedIds.length === products.length}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th className="border-0">Sản phẩm</th>
                                <th className="border-0">Danh mục</th>
                                <th className="text-center border-0">Kho</th>
                                <th className="border-0">Giá gốc</th>
                                <th className="text-center border-0">Trạng thái</th>
                                <th className="text-end px-4 border-0">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" className="text-center py-5"><Spinner animation="border" variant="primary" /></td></tr>
                            ) : products.length === 0 ? (
                                <tr><td colSpan="7" className="text-center py-5 text-muted">Không tìm thấy sản phẩm nào</td></tr>
                            ) : (
                                products.map(p => (
                                    <tr key={p.id} className={selectedIds.includes(p.id) ? "bg-light-primary" : ""}>
                                        <td className="px-4">
                                            <Form.Check
                                                type="checkbox"
                                                checked={selectedIds.includes(p.id)}
                                                onChange={() => handleSelectOne(p.id)}
                                            />
                                        </td>
                                        <td className="py-3">
                                            <div className="d-flex align-items-center">
                                                <Image
                                                    src={getImageUrl(p.imageUrl)}
                                                    className="rounded border me-3"
                                                    style={{ width: "48px", height: "48px", objectFit: "cover" }}
                                                />

                                                <div>
                                                    <div className="fw-bold text-dark">{p.name}</div>
                                                    {p.isFeatured && <Badge bg="warning" text="dark" className="small" style={{ fontSize: '0.65rem' }}><FaStar /> Hot</Badge>}
                                                </div>
                                            </div>
                                        </td>
                                        <td><Badge bg="light" text="dark" className="border fw-normal">{p.categoryName}</Badge></td>
                                        <td className={`text-center fw-bold ${p.stockQuantity === 0 ? "text-danger" : ""}`}>{p.stockQuantity}</td>
                                        <td>{formatMoney(p.price)}</td>
                                        <td className="text-center"><Badge bg={p.isActive ? "success" : "secondary"} className="bg-opacity-10 text-dark fw-normal border">{p.isActive ? "● Hoạt động" : "○ Đã ẩn"}</Badge></td>
                                        <td className="text-end px-4">
                                            <Button variant="light" size="sm" className="me-2 text-primary border shadow-sm" onClick={() => handleEdit(p)}><FaEdit /></Button>
                                            <Button variant="light" size="sm" className={`${p.isActive ? "text-danger" : "text-success"} border shadow-sm`} onClick={() => handleDelete(p.id)}>
                                                {p.isActive ? <FaTrash /> : <FaSyncAlt />}
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="d-flex justify-content-between align-items-center p-3 border-top bg-light">
                            <small className="text-muted">
                                Hiển thị {currentPage * pageSize + 1} - {Math.min((currentPage + 1) * pageSize, totalElements)} / {totalElements} sản phẩm
                            </small>
                            <Pagination className="mb-0">
                                <Pagination.First onClick={() => handlePageChange(0)} disabled={currentPage === 0} />
                                <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0} />

                                {[...Array(totalPages)].map((_, idx) => {
                                    // Show first, last, current and neighbors
                                    if (idx === 0 || idx === totalPages - 1 || (idx >= currentPage - 1 && idx <= currentPage + 1)) {
                                        return (
                                            <Pagination.Item
                                                key={idx}
                                                active={idx === currentPage}
                                                onClick={() => handlePageChange(idx)}
                                            >
                                                {idx + 1}
                                            </Pagination.Item>
                                        );
                                    } else if (idx === currentPage - 2 || idx === currentPage + 2) {
                                        return <Pagination.Ellipsis key={idx} disabled />;
                                    }
                                    return null;
                                })}

                                <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages - 1} />
                                <Pagination.Last onClick={() => handlePageChange(totalPages - 1)} disabled={currentPage === totalPages - 1} />
                            </Pagination>
                        </div>
                    )}
                </Card>
            </Container>

            {/* --- MODAL FIX: BỎ SCROLLABLE CỦA BOOTSTRAP, TỰ CHỈNH CSS --- */}
            <Modal
                key={modalKey}
                show={isModalOpen}
                onHide={closeModal}
                size="xl"
                centered
                backdrop="static"
            // 1. [QUAN TRỌNG] Bỏ scrollable={true} để tránh lỗi flexbox
            >
                <Form onSubmit={handleSubmit}>
                    <Modal.Header closeButton className="px-4 border-bottom">
                        <Modal.Title className="h5 fw-bold">
                            {editingProductId ? "Cập nhật sản phẩm" : "Tạo sản phẩm mới"}
                        </Modal.Title>
                    </Modal.Header>

                    {/* 2. [QUAN TRỌNG] Fix cứng chiều cao tối đa là 70% màn hình, quá thì hiện thanh cuộn */}
                    <Modal.Body className="px-4 py-4 bg-light" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                        <Row className="g-4">
                            <Col lg={8}>
                                <Card className="border-0 shadow-sm mb-4">
                                    <Card.Body>
                                        <h6 className="fw-bold mb-3 text-primary"><FaBox className="me-2" />Thông tin chung</h6>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small fw-bold text-muted">Tên sản phẩm <span className="text-danger">*</span></Form.Label>
                                            <Form.Control required value={currentProduct.name} onChange={e => setCurrentProduct({ ...currentProduct, name: e.target.value })} placeholder="Nhập tên sản phẩm..." />
                                        </Form.Group>
                                        <Form.Group className="mb-0">
                                            <Form.Label className="small fw-bold text-muted">Mô tả chi tiết {uploadingEditorImage && <Spinner animation="border" size="sm" className="ms-2" />}</Form.Label>
                                            <ReactQuill
                                                ref={quillRef}
                                                theme="snow"
                                                value={currentProduct.description || ''}
                                                onChange={(value) => setCurrentProduct({ ...currentProduct, description: value })}
                                                placeholder="Nhập mô tả chi tiết sản phẩm..."
                                                modules={quillModules}
                                                style={{ backgroundColor: 'white', borderRadius: '0.375rem' }}
                                            />
                                            <Form.Text className="text-muted small">Khi chèn ảnh, ảnh sẽ được tự động upload lên Cloudinary.</Form.Text>
                                        </Form.Group>
                                    </Card.Body>
                                </Card>

                                <Card className="border-0 shadow-sm">
                                    <Card.Body>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h6 className="fw-bold mb-0 text-primary">Danh sách biến thể</h6>
                                            <Button variant="outline-primary" size="sm" onClick={handleAddVariant}><FaPlus /> Thêm biến thể</Button>
                                        </div>

                                        <div className="d-flex flex-column gap-3">
                                            {currentProduct.variants.map((v, i) => (
                                                <div key={i} className="p-3 border rounded bg-white position-relative shadow-sm">
                                                    <Button variant="link" className="position-absolute top-0 end-0 text-danger p-2 text-decoration-none" onClick={() => handleRemoveVariant(i)} title="Xóa"><FaTrash /></Button>
                                                    <Row className="g-2">
                                                        <Col md={3}>
                                                            <Form.Label className="small mb-1 fw-bold">Màu sắc *</Form.Label>
                                                            <Form.Control size="sm" value={v.color} onChange={e => handleVariantChange(i, 'color', e.target.value)} required placeholder="Vd: Đỏ" />
                                                        </Col>
                                                        <Col md={3}>
                                                            <Form.Label className="small mb-1 fw-bold">Kích thước</Form.Label>
                                                            <Form.Control size="sm" value={v.productSize} onChange={e => handleVariantChange(i, 'productSize', e.target.value)} placeholder="Vd: XL" />
                                                        </Col>
                                                        <Col md={3}>
                                                            <Form.Label className="small mb-1 fw-bold">Mã SKU *</Form.Label>
                                                            <Form.Control size="sm" value={v.sku} onChange={e => handleVariantChange(i, 'sku', e.target.value)} required placeholder="Mã kho" />
                                                        </Col>
                                                        <Col md={3}>
                                                            <Form.Label className="small mb-1 fw-bold">Tồn kho *</Form.Label>
                                                            <Form.Control size="sm" type="number" value={v.stockQuantity} onChange={e => handleVariantChange(i, 'stockQuantity', e.target.value)} required />
                                                        </Col>
                                                        <Col md={12}>
                                                            <hr className="my-2 text-muted opacity-25" />
                                                            <div className="d-flex gap-3 align-items-end">
                                                                <div className="flex-grow-1">
                                                                    <Form.Label className="small mb-1 fw-bold">Giá bán riêng</Form.Label>
                                                                    <Form.Control size="sm" type="number" value={v.price} onChange={e => handleVariantChange(i, 'price', e.target.value)} placeholder="Để trống nếu giống giá gốc" />
                                                                </div>
                                                                <div>
                                                                    <Form.Label className="small mb-1 text-muted d-block">Ảnh màu</Form.Label>
                                                                    <div className="btn btn-sm btn-light border position-relative p-1" style={{ width: 40, height: 34 }}>
                                                                        {v.colorImageUrl ? <Image src={v.colorImageUrl} width="100%" height="100%" className="object-fit-cover" /> : <FaCloudUploadAlt className="text-muted" />}
                                                                        <Form.Control type="file" size="sm" accept="image/*" className="position-absolute top-0 start-0 opacity-0 w-100 h-100 cursor-pointer" onChange={e => handleVariantImageUpload(i, e.target.files[0], 'color')} />
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <Form.Label className="small mb-1 text-muted d-block">Ảnh chính</Form.Label>
                                                                    <div className="btn btn-sm btn-light border position-relative p-1" style={{ width: 40, height: 34 }}>
                                                                        {v.imageUrl ? <Image src={v.imageUrl} width="100%" height="100%" className="object-fit-cover rounded" /> : <FaCloudUploadAlt className="text-muted" />}
                                                                        <Form.Control type="file" size="sm" accept="image/*" className="position-absolute top-0 start-0 opacity-0 w-100 h-100 cursor-pointer" onChange={e => handleVariantImageUpload(i, e.target.files[0], 'main')} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {uploadingVariantIndex === i && <div className="text-primary small mt-1 text-center"><Spinner size="sm" animation="border" /> Đang tải ảnh...</div>}
                                                        </Col>
                                                    </Row>
                                                </div>
                                            ))}
                                            {currentProduct.variants.length === 0 && <div className="text-center text-muted py-4 border border-dashed rounded bg-white">Chưa có biến thể nào.</div>}
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col lg={4}>
                                <div className="sticky-top" style={{ top: '0px', zIndex: 1 }}>
                                    <Card className="border-0 shadow-sm">
                                        <Card.Body>
                                            <h6 className="fw-bold mb-3 text-primary">Cấu hình & Hình ảnh</h6>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="small fw-bold text-muted">Giá gốc (VNĐ) <span className="text-danger">*</span></Form.Label>
                                                <Form.Control type="number" required value={currentProduct.price} onChange={e => setCurrentProduct({ ...currentProduct, price: e.target.value })} className="fw-bold" placeholder="0" />
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="small fw-bold text-muted">Danh mục <span className="text-danger">*</span></Form.Label>
                                                <Form.Select required value={currentProduct.categoryId} onChange={e => setCurrentProduct({ ...currentProduct, categoryId: e.target.value })}>
                                                    <option value="">-- Chọn danh mục --</option>
                                                    {categories.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
                                                </Form.Select>
                                            </Form.Group>

                                            {/* Chỉ hiển thị tồn kho và sizes khi không có biến thể */}
                                            {currentProduct.variants.length === 0 && (
                                                <>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label className="small fw-bold text-muted">Tồn kho <span className="text-danger">*</span></Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            min="0"
                                                            required
                                                            value={currentProduct.stockQuantity}
                                                            onChange={e => setCurrentProduct({ ...currentProduct, stockQuantity: parseInt(e.target.value) || 0 })}
                                                            placeholder="0"
                                                        />
                                                    </Form.Group>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label className="small fw-bold text-muted">Cấu hình Sizes & Giá</Form.Label>
                                                        <div className="border rounded p-2 bg-white">
                                                            {sizeList.map((item, idx) => (
                                                                <div key={item.id} className="d-flex gap-2 mb-2 align-items-center">
                                                                    <Form.Control
                                                                        type="text"
                                                                        placeholder="Tên Size (VD: M)"
                                                                        size="sm"
                                                                        value={item.name}
                                                                        onChange={e => {
                                                                            const newList = [...sizeList];
                                                                            newList[idx].name = e.target.value;
                                                                            setSizeList(newList);
                                                                        }}
                                                                    />
                                                                    <Form.Control
                                                                        type="number"
                                                                        placeholder="Giá riêng (trống = giá gốc)"
                                                                        size="sm"
                                                                        value={item.price}
                                                                        onChange={e => {
                                                                            const newList = [...sizeList];
                                                                            newList[idx].price = e.target.value;
                                                                            setSizeList(newList);
                                                                        }}
                                                                    />
                                                                    <Button
                                                                        variant="outline-danger"
                                                                        size="sm"
                                                                        onClick={() => setSizeList(sizeList.filter((_, i) => i !== idx))}
                                                                    >
                                                                        <FaTrash />
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                            <Button
                                                                variant="outline-primary"
                                                                size="sm"
                                                                className="w-100"
                                                                onClick={() => setSizeList([...sizeList, { id: Date.now(), name: "", price: "" }])}
                                                            >
                                                                <FaPlus /> Thêm Size
                                                            </Button>
                                                        </div>
                                                        <Form.Text className="text-muted small">Nhập tên size và giá (nếu khác giá gốc). </Form.Text>
                                                    </Form.Group>
                                                </>
                                            )}
                                            <hr className="my-4 text-muted opacity-25" />
                                            <Form.Group className="mb-3 text-center">
                                                <div className="position-relative d-inline-block border rounded bg-light p-2 mb-2">
                                                    {(imageFile || currentProduct.imageUrl) ? (
                                                        <Image src={imageFile ? URL.createObjectURL(imageFile) : currentProduct.imageUrl} style={{ maxHeight: '150px', maxWidth: '100%', objectFit: 'contain' }} />
                                                    ) : (
                                                        <div className="d-flex align-items-center justify-content-center text-muted flex-column" style={{ width: '120px', height: '120px' }}>
                                                            <FaCloudUploadAlt className="fs-1 mb-2 opacity-25" /> <small>Chưa có ảnh</small>
                                                        </div>
                                                    )}
                                                </div>
                                                <Form.Control type="file" accept="image/*" size="sm" onChange={e => setImageFile(e.target.files[0])} />
                                                <Form.Control type="text" placeholder="Hoặc URL ảnh..." size="sm" className="mt-2" value={currentProduct.imageUrl} onChange={e => setCurrentProduct({ ...currentProduct, imageUrl: e.target.value })} />
                                            </Form.Group>
                                            <Form.Check type="switch" label="Đánh dấu nổi bật (Hot)" checked={currentProduct.isFeatured} onChange={e => setCurrentProduct({ ...currentProduct, isFeatured: e.target.checked })} className="mt-3 fw-bold text-warning" />
                                        </Card.Body>
                                    </Card>
                                </div>
                            </Col>
                        </Row>
                    </Modal.Body>

                    <Modal.Footer className="px-4 border-top">
                        <Button variant="light" onClick={closeModal} disabled={isSubmitting}>Hủy bỏ</Button>
                        <Button variant="primary" type="submit" className="px-4 fw-bold" disabled={isSubmitting || uploadingVariantIndex !== null}>
                            {isSubmitting ? <><Spinner size="sm" animation="border" className="me-2" />Đang xử lý...</> : "Lưu sản phẩm"}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
}