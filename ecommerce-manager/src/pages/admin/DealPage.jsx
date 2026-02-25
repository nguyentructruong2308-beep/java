import React, { useEffect, useState } from "react";
import API from "../../api/api";
import { confirmSwal, successSwal, errorSwal } from "../../utils/swal";
import {
    Table,
    Button,
    Modal,
    Form,
    Alert,
    Card,
    Container,
    Spinner,
    Badge,
    Row,
    Col,
    Tabs,
    Tab
} from "react-bootstrap";
import {
    FaPlus,
    FaEdit,
    FaTrash,
    FaSyncAlt,
    FaTag,
    FaFireAlt
} from "react-icons/fa";

export default function DealPage() {
    // --- STATE FOR DEALS TAB ---
    const [discounts, setDiscounts] = useState([]);
    const [loadingDeals, setLoadingDeals] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editDiscount, setEditDiscount] = useState(null);
    const [formData, setFormData] = useState({
        code: "",
        name: "",
        description: "",
        discountType: "PERCENTAGE",
        discountValue: "",
        minOrderValue: "",
        maxDiscountAmount: "",
        startDate: "",
        endDate: "",
        isActive: true,
        buyQuantity: "",
        getQuantity: "",
        giftProductId: null
    });
    const [giftSearch, setGiftSearch] = useState("");
    const [giftSearchResults, setGiftSearchResults] = useState([]);
    const [selectedGiftProduct, setSelectedGiftProduct] = useState(null);
    const [isSearchingGift, setIsSearchingGift] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [selectedIds, setSelectedIds] = useState([]);
    const [activeTab, setActiveTab] = useState("suggestions"); // Default to suggestions as requested

    // --- STATE FOR PRODUCT A SEARCH (MỚI) ---
    const [productASearch, setProductASearch] = useState("");
    const [productAResults, setProductAResults] = useState([]);
    const [selectedProductA, setSelectedProductA] = useState(null);
    const [isSearchingProductA, setIsSearchingProductA] = useState(false);

    // --- STATE FOR SUGGESTIONS TAB ---
    const [products, setProducts] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [filters, setFilters] = useState({
        minStock: 50,
        maxSold: 10,
        maxViews: 1000
    });

    // --- STATE FOR CREATE DEAL FROM SUGGESTION ---
    const [selectedProduct, setSelectedProduct] = useState(null);

    // ==========================================
    // 1. FETCH DATA
    // ==========================================
    const fetchDiscounts = async () => {
        setLoadingDeals(true);
        try {
            const res = await API.get("/discounts");
            // Filter ONLY deals (where buyQuantity > 0)
            const deals = res.data.filter(d => d.buyQuantity > 0);
            setDiscounts(deals);
        } catch (err) {
            setError("Không thể tải danh sách ưu đãi");
        } finally {
            setLoadingDeals(false);
        }
    };

    const fetchSuggestions = async () => {
        setLoadingSuggestions(true);
        try {
            const params = new URLSearchParams(filters);
            const res = await API.get(`/products/suggestions/clearance?${params.toString()}`);
            setProducts(res.data.content || []);
        } catch (err) {
            setError("Không thể tải danh sách gợi ý xả kho.");
        } finally {
            setLoadingSuggestions(false);
        }
    };

    useEffect(() => {
        if (activeTab === "deals") {
            fetchDiscounts();
        } else {
            fetchSuggestions();
        }
    }, [activeTab]);

    useEffect(() => {
        const searchProductA = async () => {
            if (productASearch.trim().length < 2) {
                setProductAResults([]);
                return;
            }
            setIsSearchingProductA(true);
            try {
                const res = await API.get("/products/search", { params: { name: productASearch } });
                setProductAResults(res.data.content || []);
            } catch (err) {
                console.error("Product A search error:", err);
            } finally {
                setIsSearchingProductA(false);
            }
        };
        const timer = setTimeout(searchProductA, 500);
        return () => clearTimeout(timer);
    }, [productASearch]);

    useEffect(() => {
        const searchGiftProduct = async () => {
            if (giftSearch.trim().length < 2) {
                setGiftSearchResults([]);
                return;
            }
            setIsSearchingGift(true);
            try {
                const res = await API.get("/products/search", { params: { name: giftSearch } });
                setGiftSearchResults(res.data.content || []);
            } catch (err) {
                console.error("Gift search error:", err);
            } finally {
                setIsSearchingGift(false);
            }
        };

        const timer = setTimeout(searchGiftProduct, 500);
        return () => clearTimeout(timer);
    }, [giftSearch]);

    // ==========================================
    // 2. HANDLERS FOR DEALS
    // ==========================================
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(discounts.map(d => d.id));
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
            `Xóa ${selectedIds.length} ưu đãi?`,
            "Hành động này sẽ xóa vĩnh viễn các ưu đãi đã chọn. Bạn có chắc không?"
        );
        if (!result.isConfirmed) return;

        try {
            setLoadingDeals(true);
            await Promise.all(selectedIds.map(id => API.delete(`/discounts/${id}`)));
            setSuccess(`Đã xóa ${selectedIds.length} ưu đãi.`);
            setSelectedIds([]);
            fetchDiscounts();
        } catch (err) {
            setError("Có lỗi xảy ra khi xóa hàng loạt.");
        } finally {
            setLoadingDeals(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await confirmSwal("Xóa ưu đãi?", "Bạn có chắc chắn muốn xóa ưu đãi này không?");
        if (!result.isConfirmed) return;
        try {
            await API.delete(`/discounts/${id}`);
            setSuccess("Xoá ưu đãi thành công");
            fetchDiscounts();
        } catch (err) {
            setError(err.response?.data?.message || "Lỗi khi xoá ưu đãi");
        }
    };


    // ==========================================
    // 3. HANDLERS FOR MODAL (SHARED)
    // ==========================================
    const formatDateTimeForInput = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
    };

    const handleShowModal = (discount = null) => {
        setSelectedProduct(null); // Reset suggestion product
        if (discount) {
            setEditDiscount(discount);
            setFormData({
                code: discount.code || "",
                name: discount.name || "",
                description: discount.description || "",
                discountType: discount.discountType || "PERCENTAGE",
                discountValue: discount.discountValue || "",
                minOrderValue: discount.minOrderValue || "",
                maxDiscountAmount: discount.maxDiscountAmount || "",
                startDate: formatDateTimeForInput(discount.startDate),
                endDate: formatDateTimeForInput(discount.endDate),
                isActive: discount.isActive ?? true,
                buyQuantity: discount.buyQuantity || "",
                getQuantity: discount.getQuantity || "",
                giftProductId: discount.giftProductId || null
            });
            setSelectedGiftProduct(discount.giftProductId ? {
                id: discount.giftProductId,
                name: discount.giftProductName,
                imageUrl: discount.giftProductImage
            } : null);
            // Link products handling
            if (discount.productIds && discount.productIds.length > 0) {
                // We only handle one product A for this simplified UI
                setSelectedProductA({
                    id: discount.productIds[0],
                    name: discount.productNames?.[0] || "Sản phẩm A",
                    imageUrl: discount.productImages?.[0]
                });
            } else {
                setSelectedProductA(null);
            }
        } else {
            setEditDiscount(null);
            setFormData({
                code: `DEAL_${Date.now()}`,
                name: "",
                description: "",
                discountType: "PERCENTAGE",
                discountValue: "0",
                minOrderValue: "",
                maxDiscountAmount: "",
                startDate: new Date().toISOString().slice(0, 16),
                endDate: "2099-12-31T23:59",
                isActive: true,
                buyQuantity: "",
                getQuantity: "",
                giftProductId: null
            });
            setSelectedGiftProduct(null);
            setSelectedProductA(null);
        }
        setGiftSearch("");
        setGiftSearchResults([]);
        setProductASearch("");
        setProductAResults([]);
        setShowModal(true);
        setError("");
        setSuccess("");
    };

    // Called from Suggestions Tab
    const handleCreateDealFromSuggestion = (product) => {
        setSelectedProduct(product);
        setEditDiscount(null);
        const skuPart = product.variants && product.variants.length > 0 ? product.variants[0].sku : `PROD${product.id}`;
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);

        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);

        setFormData({
            code: `CLEARANCE_${skuPart}_${randomSuffix}`.toUpperCase(),
            name: `Xả kho: ${product.name}`,
            description: `Ưu đãi xả kho cho sản phẩm ${product.name}`,
            discountType: "PERCENTAGE",
            discountValue: "0",
            minOrderValue: "",
            maxDiscountAmount: "",
            startDate: today.toISOString().slice(0, 16),
            endDate: "2099-12-31T23:59",
            isActive: true,
            buyQuantity: "5", // Default
            getQuantity: "1",  // Default
            giftProductId: null
        });
        setSelectedProductA(product);
        setSelectedGiftProduct(null);
        setGiftSearch("");
        setGiftSearchResults([]);
        setProductASearch("");
        setProductAResults([]);
        setShowModal(true);
    };


    const handleCloseModal = () => setShowModal(false);

    const handleSave = async () => {
        try {
            if (!formData.code.trim()) {
                setError("Mã ưu đãi không được để trống");
                return;
            }
            if (!formData.name.trim()) {
                setError("Tên không được để trống");
                return;
            }
            if ((!formData.discountValue || formData.discountValue < 0) && (!formData.buyQuantity)) {
                setError("Cần nhập giá trị giảm hoặc số lượng mua/tặng");
                return;
            }

            const payload = {
                ...formData,
                code: formData.code.toUpperCase(),
                discountValue: parseFloat(formData.discountValue || 0),
                minOrderValue: formData.minOrderValue ? parseFloat(formData.minOrderValue) : null,
                maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null,
                buyQuantity: formData.buyQuantity ? parseInt(formData.buyQuantity) : null,
                getQuantity: formData.getQuantity ? parseInt(formData.getQuantity) : null,
                productIds: selectedProductA ? [selectedProductA.id] : null,
                giftProductId: selectedGiftProduct ? selectedGiftProduct.id : null
            };

            if (editDiscount) {
                await API.put(`/discounts/${editDiscount.id}`, payload);
                successSwal("Thành công", "Cập nhật ưu đãi thành công");
            } else {
                await API.post("/discounts", payload);
                successSwal("Thành công", "Tạo ưu đãi thành công");
            }

            handleCloseModal();

            // If created from suggestion, switch to deals tab to show it
            if (selectedProduct) {
                setActiveTab("deals");
            } else {
                fetchDiscounts();
            }

        } catch (err) {
            setError(err.response?.data?.message || "Lỗi khi lưu ưu đãi");
        }
    };

    // Helper
    const formatCurrency = (value) => {
        if (!value) return "-";
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleString("vi-VN");
    };

    const getDiscountStatus = (discount) => {
        const now = new Date();
        const start = new Date(discount.startDate);
        const end = new Date(discount.endDate);

        if (!discount.isActive) return { label: "Tắt", variant: "secondary" };
        if (now < start) return { label: "Chưa bắt đầu", variant: "info" };
        if (now > end) return { label: "Hết hạn", variant: "danger" };
        return { label: "Đang hoạt động", variant: "success" };
    };


    return (
        <div style={{ backgroundColor: "#f4f6f9", minHeight: "100vh" }} className="pb-5 text-dark">
            <Container fluid="lg" className="py-4">
                {/* HEADER SECTION */}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
                    <div>
                        <h4 className="fw-bolder mb-1">Quản lý Ưu đãi / Deal Xả kho</h4>
                        <p className="text-muted mb-0 small">
                            Quản lý các chương trình Mua X Tặng Y và các gợi ý xả kho từ hệ thống
                        </p>
                    </div>
                    <div className="d-flex gap-2 mt-3 mt-md-0 align-items-center">
                        {activeTab === "deals" && (
                            <Button
                                variant="primary"
                                className="fw-bold px-3 shadow-sm"
                                onClick={() => handleShowModal()}
                            >
                                <FaPlus className="me-2" /> Thêm Deal Mới
                            </Button>
                        )}
                    </div>
                </div>

                {/* ALERTS */}
                {error && (
                    <Alert variant="danger" className="border-0 shadow-sm" onClose={() => setError("")} dismissible>
                        {error}
                    </Alert>
                )}
                {success && (
                    <Alert variant="success" className="border-0 shadow-sm" onClose={() => setSuccess("")} dismissible>
                        {success}
                    </Alert>
                )}

                <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4 border-bottom-0 custom-tabs">
                    <Tab eventKey="suggestions" title={<span><FaFireAlt className="me-2" />Gợi ý Xả kho</span>}>

                        {/* SUGGESTIONS FILTER */}
                        <Card className="border-0 shadow-sm mb-4 px-3 py-3">
                            <Row className="g-3 align-items-end">
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label className="small fw-bold">Tồn kho tối thiểu</Form.Label>
                                        <Form.Control type="number" value={filters.minStock} onChange={e => setFilters({ ...filters, minStock: e.target.value })} />
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label className="small fw-bold">Đã bán tối đa</Form.Label>
                                        <Form.Control type="number" value={filters.maxSold} onChange={e => setFilters({ ...filters, maxSold: e.target.value })} />
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label className="small fw-bold">Lượt xem tối đa</Form.Label>
                                        <Form.Control type="number" value={filters.maxViews} onChange={e => setFilters({ ...filters, maxViews: e.target.value })} />
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Button variant="primary" className="w-100 fw-bold" onClick={fetchSuggestions}>
                                        <FaSyncAlt className={loadingSuggestions ? 'fa-spin me-2' : 'me-2'} />
                                        Tìm kiếm
                                    </Button>
                                </Col>
                            </Row>
                        </Card>

                        {/* SUGGESTIONS TABLE */}
                        <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                            <Table hover responsive className="mb-0 align-middle">
                                <thead className="bg-light text-secondary text-uppercase small fw-bold">
                                    <tr>
                                        <th className="px-4 py-3 border-0">Sản phẩm</th>
                                        <th className="border-0 text-center">Tồn kho</th>
                                        <th className="border-0 text-center">Đã bán</th>
                                        <th className="border-0 text-center">Lượt xem</th>
                                        <th className="border-0 text-end px-4">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadingSuggestions ? (
                                        <tr><td colSpan="5" className="text-center py-5"><Spinner animation="border" size="sm" /></td></tr>
                                    ) : products.length === 0 ? (
                                        <tr><td colSpan="5" className="text-center py-5 text-muted">Không có sản phẩm nào phù hợp tiêu chí xả kho.</td></tr>
                                    ) : (
                                        products.map(p => (
                                            <tr key={p.id}>
                                                <td className="px-4">
                                                    <div className="d-flex align-items-center">
                                                        <img
                                                            src={p.imageUrl || "https://placehold.co/40"}
                                                            alt=""
                                                            className="rounded me-3 object-fit-cover"
                                                            width="40" height="40"
                                                        />
                                                        <div>
                                                            <div className="fw-bold text-dark">{p.name}</div>
                                                            <div className="small text-muted">ID: {p.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="text-center fw-bold text-warning">{p.stockQuantity}</td>
                                                <td className="text-center">{p.soldCount || 0}</td>
                                                <td className="text-center">{p.viewCount || 0}</td>
                                                <td className="text-end px-4">
                                                    <Button variant="danger" size="sm" className="fw-bold shadow-sm" onClick={() => handleCreateDealFromSuggestion(p)}>
                                                        <FaTag className="me-2" /> Tạo ưu đãi
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </Table>
                        </Card>
                    </Tab>

                    <Tab eventKey="deals" title="Danh sách Ưu đãi">
                        {/* DEALS TABLE */}
                        <Card className="border-0 shadow-sm" style={{ borderRadius: "12px", overflow: "hidden" }}>
                            <Card.Body className="p-0">
                                <div className="p-2 border-bottom d-flex justify-content-end">
                                    {selectedIds.length > 0 && (
                                        <Button variant="danger" size="sm" className="fw-bold px-3 shadow-sm me-2" onClick={handleBulkDelete}>
                                            <FaTrash className="me-2" /> Xóa {selectedIds.length} mục
                                        </Button>
                                    )}
                                    <Button variant="white" size="sm" onClick={fetchDiscounts}><FaSyncAlt /></Button>
                                </div>
                                <Table hover responsive className="align-middle mb-0">
                                    <thead className="bg-light text-muted uppercase small fw-bold">
                                        <tr>
                                            <th className="px-4 py-3 border-0" style={{ width: '40px' }}>
                                                <Form.Check type="checkbox" checked={discounts.length > 0 && selectedIds.length === discounts.length} onChange={handleSelectAll} />
                                            </th>
                                            <th className="border-0">Sản phẩm A (Mua)</th>
                                            <th className="border-0 text-center">Mua X Tặng Y</th>
                                            <th className="border-0">Quà tặng B</th>
                                            <th className="border-0 text-end px-4">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loadingDeals ? (
                                            <tr><td colSpan="8" className="text-center py-5"><Spinner animation="border" variant="primary" size="sm" className="me-2" />Đang tải dữ liệu...</td></tr>
                                        ) : discounts.length === 0 ? (
                                            <tr><td colSpan="8" className="text-center py-5 text-muted">Chưa có chương trình ưu đãi nào</td></tr>
                                        ) : (
                                            discounts.map((d) => {
                                                const status = getDiscountStatus(d);
                                                return (
                                                    <tr key={d.id} className={selectedIds.includes(d.id) ? "bg-light-primary" : ""}>
                                                        <td className="ps-4"><Form.Check type="checkbox" checked={selectedIds.includes(d.id)} onChange={() => handleSelectOne(d.id)} /></td>
                                                        <td>
                                                            {d.productIds && d.productIds.length > 0 ? (
                                                                <div className="d-flex align-items-center">
                                                                    <img src={d.productImages?.[0] || "https://placehold.co/30"} width="30" height="30" className="rounded me-2" alt="" />
                                                                    <span className="small fw-semibold text-truncate" style={{ maxWidth: '150px' }}>{d.productNames?.[0]}</span>
                                                                </div>
                                                            ) : (
                                                                <div className="d-flex align-items-center">
                                                                    <span className="fw-semibold text-dark">{d.name}</span>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="text-center">
                                                            {d.buyQuantity ? (
                                                                <Badge bg="warning" className="text-dark px-2 py-1">Mua {d.buyQuantity} Tặng {d.getQuantity}</Badge>
                                                            ) : <span className="text-muted">-</span>}
                                                        </td>
                                                        <td>
                                                            {d.giftProductId ? (
                                                                <div className="d-flex align-items-center">
                                                                    <img src={d.giftProductImage || "https://placehold.co/30"} width="30" height="30" className="rounded me-2" alt="" />
                                                                    <span className="small fw-semibold text-truncate" style={{ maxWidth: '150px' }}>{d.giftProductName}</span>
                                                                </div>
                                                            ) : <span className="text-muted">Tại chỗ</span>}
                                                        </td>
                                                        <td className="text-end px-4">
                                                            <Button variant="light" size="sm" className="me-2 text-primary shadow-sm" onClick={() => handleShowModal(d)}><FaEdit /></Button>
                                                            <Button variant="light" size="sm" className="text-danger shadow-sm" onClick={() => handleDelete(d.id)}><FaTrash /></Button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    </Tab>
                </Tabs>

                {/* MODAL SECTION */}
                <Modal show={showModal} onHide={handleCloseModal} centered backdrop="static" size="lg">
                    <Form>
                        <Modal.Header closeButton className="border-0 px-4 pt-4">
                            <Modal.Title className="fw-bold">
                                {editDiscount ? "Sửa chương trình ưu đãi" : "Thêm Deal Mới"}
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="px-4 pb-4">
                            {/* Configuration Product A Search */}
                            <div className="bg-light p-3 rounded mb-3 border">
                                <Form.Label className="small fw-bold">1. Chọn sản phẩm Mua (Sản phẩm A) *</Form.Label>
                                <div className="position-relative">
                                    <Form.Control
                                        type="text"
                                        placeholder="Tìm sản phẩm khách mua..."
                                        className="border-0 shadow-none bg-white mb-2"
                                        value={productASearch}
                                        onChange={(e) => setProductASearch(e.target.value)}
                                        disabled={!!selectedProduct} // Disable if from suggestion
                                    />
                                    {isSearchingProductA && (
                                        <div className="position-absolute end-0 top-0 mt-2 me-2">
                                            <Spinner animation="border" size="sm" variant="primary" />
                                        </div>
                                    )}
                                    {productAResults.length > 0 && (
                                        <div className="position-absolute w-100 shadow-sm rounded bg-white mt-1 border" style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}>
                                            {productAResults.map(p => (
                                                <div
                                                    key={p.id}
                                                    className="p-2 dropdown-item d-flex align-items-center cursor-pointer"
                                                    onClick={() => {
                                                        setSelectedProductA(p);
                                                        setProductASearch("");
                                                        setProductAResults([]);
                                                        if (!formData.name) {
                                                            setFormData({ ...formData, name: `Ưu đãi: ${p.name}` });
                                                        }
                                                    }}
                                                >
                                                    <img src={p.imageUrl || "https://placehold.co/30"} width="30" height="30" className="rounded me-2" alt="" />
                                                    <span className="small">{p.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {selectedProductA ? (
                                    <div className="d-flex align-items-center p-2 bg-white rounded border border-success border-opacity-25 mt-1 shadow-sm">
                                        <img src={selectedProductA.imageUrl || "https://placehold.co/40"} width="40" height="40" className="rounded me-3" alt="" />
                                        <div className="flex-grow-1">
                                            <div className="fw-bold small">{selectedProductA.name}</div>
                                            <div className="text-muted smaller">Khách mua sản phẩm này để nhận quà.</div>
                                        </div>
                                        {!selectedProduct && (
                                            <Button variant="link" size="sm" className="text-danger p-0 fw-bold text-decoration-none" onClick={() => setSelectedProductA(null)}>Thay đổi</Button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-danger small italic mt-1">Vui lòng tìm và chọn sản phẩm A.</div>
                                )}
                            </div>

                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold">2. Tên chương trình / Ghi chú</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="VD: Mua 5 tặng 1..."
                                    className="bg-light border-0 shadow-none fw-bold"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </Form.Group>

                            {/* Configuration Buy X Get Y */}
                            <div className="bg-warning bg-opacity-10 p-3 rounded mb-3 border border-warning shadow-sm">
                                <h6 className="fw-bold mb-3 text-warning-emphasis">3. Cấu hình Mua X Tặng Y</h6>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3 mb-md-0">
                                            <Form.Label className="small fw-bold">Mua số lượng (X)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                min="1"
                                                placeholder="VD: 5"
                                                className="border-0 shadow-none bg-white py-2 fw-bold"
                                                value={formData.buyQuantity || ""}
                                                onChange={(e) => setFormData({ ...formData, buyQuantity: e.target.value ? parseInt(e.target.value) : null })}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold">Tặng số lượng (Y)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                min="1"
                                                placeholder="VD: 1"
                                                className="border-0 shadow-none bg-white py-2 fw-bold"
                                                value={formData.getQuantity || ""}
                                                onChange={(e) => setFormData({ ...formData, getQuantity: e.target.value ? parseInt(e.target.value) : null })}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <div className="mt-3 pt-3 border-top border-warning border-opacity-25">
                                    <Form.Label className="small fw-bold">Chọn Quà tặng (Sản phẩm B)</Form.Label>
                                    <div className="position-relative">
                                        <Form.Control
                                            type="text"
                                            placeholder="Tìm sản phẩm quà tặng..."
                                            className="border-0 shadow-none bg-white mb-2"
                                            value={giftSearch}
                                            onChange={(e) => setGiftSearch(e.target.value)}
                                        />
                                        {isSearchingGift && (
                                            <div className="position-absolute end-0 top-0 mt-2 me-2">
                                                <Spinner animation="border" size="sm" variant="primary" />
                                            </div>
                                        )}
                                        {giftSearchResults.length > 0 && (
                                            <div className="position-absolute w-100 shadow-sm rounded bg-white mt-1 border" style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}>
                                                {giftSearchResults.map(p => (
                                                    <div
                                                        key={p.id}
                                                        className="p-2 dropdown-item d-flex align-items-center cursor-pointer"
                                                        onClick={() => {
                                                            setSelectedGiftProduct(p);
                                                            setGiftSearch("");
                                                            setGiftSearchResults([]);
                                                        }}
                                                    >
                                                        <img src={p.imageUrl || "https://placehold.co/30"} width="30" height="30" className="rounded me-2" alt="" />
                                                        <span className="small">{p.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {selectedGiftProduct ? (
                                        <div className="d-flex align-items-center p-2 bg-white rounded border border-primary border-opacity-25 mt-1 shadow-sm">
                                            <img src={selectedGiftProduct.imageUrl || "https://placehold.co/40"} width="40" height="40" className="rounded me-3" alt="" />
                                            <div className="flex-grow-1">
                                                <div className="fw-bold small">{selectedGiftProduct.name}</div>
                                                <div className="text-muted smaller">Sản phẩm này sẽ được tặng.</div>
                                            </div>
                                            <Button variant="link" size="sm" className="text-danger p-0 fw-bold text-decoration-none" onClick={() => setSelectedGiftProduct(null)}>Thay đổi</Button>
                                        </div>
                                    ) : (
                                        <div className="text-muted small italic mt-1 bg-white p-2 rounded border border-dashed text-center">
                                            Chưa chọn quà tặng riêng. Hệ thống sẽ mặc định tặng cùng sản phẩm mua (A).
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold">Mô tả thêm (Tùy chọn)</Form.Label>
                                <Form.Control as="textarea" rows={2} placeholder="Mô tả..." className="bg-light border-0 shadow-none" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                            </Form.Group>

                            <Form.Group className="mb-0">
                                <Form.Check type="switch" id="isActive" label="Kích hoạt ngay" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />
                            </Form.Group>
                        </Modal.Body>
                        <Modal.Footer className="border-0 px-4 pb-4">
                            <Button variant="light" className="fw-bold px-4 shadow-sm" onClick={handleCloseModal}>Huỷ</Button>
                            <Button variant="primary" className="fw-bold px-4 shadow-sm" onClick={handleSave}>{editDiscount ? "Cập nhật" : "Tạo mới"}</Button>
                        </Modal.Footer>
                    </Form >
                </Modal >
            </Container>
        </div >
    );
}
