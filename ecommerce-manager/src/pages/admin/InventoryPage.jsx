import React, { useEffect, useState } from "react";
import API from "../../api/api";
import { successSwal, errorSwal } from "../../utils/swal";

import { Table, Button, Form, Spinner, Badge, Card, Container, Collapse } from "react-bootstrap";
import { FaBoxOpen, FaSearch, FaSave, FaAngleDown, FaAngleUp, FaSyncAlt, FaWarehouse, FaFileExcel } from "react-icons/fa";

export default function InventoryPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showLowStock, setShowLowStock] = useState(false);

    // State quản lý variant mở rộng
    const [expandedRows, setExpandedRows] = useState({});

    // State tạm thời để edit stock
    const [editingStock, setEditingStock] = useState({}); // { "product-123": 10, "variant-456": 5 }

    const fetchProducts = async () => {
        setLoading(true);
        try {
            let url = "/products?size=100&sortDir=desc";
            if (showLowStock) {
                url = "/products/low-stock?size=100&threshold=10";
            }
            const res = await API.get(url);
            setProducts(res.data.content || []);
        } catch {
            errorSwal("Lỗi!", "Không thể tải danh sách sản phẩm.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [showLowStock]); // Re-fetch when filter changes

    const toggleRow = (productId) => {
        setExpandedRows(prev => ({
            ...prev,
            [productId]: !prev[productId]
        }));
    };

    const handleStockChange = (key, value) => {
        // key header: "product-ID" or "variant-ID"
        setEditingStock(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const saveStock = async (id, isVariant) => {
        const key = isVariant ? `variant-${id}` : `product-${id}`;
        const newQuantity = editingStock[key];

        if (newQuantity === undefined || newQuantity === "") return;
        if (newQuantity < 0) {
            errorSwal("Lỗi", "Số lượng không được âm");
            return;
        }

        try {
            if (isVariant) {
                await API.patch(`/products/variants/${id}/stock?quantity=${newQuantity}`);
                // Cập nhật state local
                setProducts(prev => prev.map(p => {
                    if (p.variants && p.variants.find(v => v.id === id)) {
                        return {
                            ...p,
                            variants: p.variants.map(v => v.id === id ? { ...v, stockQuantity: parseInt(newQuantity) } : v),
                            // Cập nhật lại tổng stock của product luôn cho đồng bộ
                            stockQuantity: p.variants.map(v => v.id === id ? parseInt(newQuantity) : v.stockQuantity).reduce((a, b) => a + b, 0)
                        };
                    }
                    return p;
                }));
            } else {
                await API.patch(`/products/${id}/stock?quantity=${newQuantity}`);
                // Cập nhật state local
                setProducts(prev => prev.map(p => p.id === id ? { ...p, stockQuantity: parseInt(newQuantity) } : p));
            }

            successSwal("Thành công", "Đã cập nhật tồn kho");

            // Clear edit state for this item
            setEditingStock(prev => {
                const newState = { ...prev };
                delete newState[key];
                return newState;
            });

        } catch (err) {
            errorSwal("Lỗi", "Không thể cập nhật tồn kho");
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            setLoading(true);
            await API.post("/products/import-stock", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            successSwal("Thành công", "Đã nhập kho từ Excel thành công!");
            fetchProducts();
        } catch (err) {
            const msg = err.response?.data?.message || "Lỗi nhập file";
            // Check if msg contains semicolons, indicating multiple errors
            if (msg.includes(';')) {
                const errors = msg.split(';').map(e => e.trim()).filter(e => e);
                const errorListHtml = `<ul style="text-align: left; font-size: 0.9em;">${errors.map(e => `<li>${e}</li>`).join('')}</ul>`;
                errorSwal("Lỗi chi tiết", "", errorListHtml); // Using 3rd arg for HTML content if swal supports it, or customizing swal call
            } else {
                errorSwal("Lỗi", msg);
            }
        } finally {
            setLoading(false);
            e.target.value = null; // Reset input
        }
    };

    return (
        <div className="pb-5" style={{ backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
            <Container fluid="lg" className="py-4">

                {/* Header */}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
                    <div>
                        <h4 className="fw-bolder text-dark mb-1"><FaWarehouse className="me-2" />Quản lý tồn kho</h4>
                        <p className="text-muted mb-0 small">Kiểm soát và điều chỉnh số lượng hàng hóa</p>
                    </div>
                    <div className="mt-3 mt-md-0 d-flex gap-2">
                        <div>
                            <input
                                type="file"
                                id="excel-upload"
                                accept=".xlsx, .xls"
                                style={{ display: 'none' }}
                                onChange={handleFileUpload}
                            />
                            <div className="d-flex gap-2">
                                <Button
                                    variant="outline-success"
                                    className="fw-bold d-flex align-items-center shadow-sm"
                                    onClick={async () => {
                                        try {
                                            const res = await API.get("/products/export-stock", { responseType: 'blob' });
                                            const url = window.URL.createObjectURL(new Blob([res.data]));
                                            const link = document.createElement('a');
                                            link.href = url;
                                            link.setAttribute('download', 'DanhSachNhapKho.xlsx');
                                            document.body.appendChild(link);
                                            link.click();
                                            link.remove();
                                        } catch {
                                            errorSwal("Lỗi", "Không thể tải file mẫu");
                                        }
                                    }}
                                >
                                    <FaFileExcel className="me-2" /> Tải File Mẫu
                                </Button>
                                <Button
                                    variant="success"
                                    className="fw-bold d-flex align-items-center shadow-sm text-white"
                                    onClick={() => document.getElementById('excel-upload').click()}
                                >
                                    <FaFileExcel className="me-2" /> Nhập Excel
                                </Button>
                            </div>
                        </div>
                        <Button
                            variant={showLowStock ? "danger" : "outline-danger"}
                            className="fw-bold d-flex align-items-center shadow-sm"
                            onClick={() => setShowLowStock(!showLowStock)}
                        >
                            Cảnh báo sắp hết
                        </Button>
                        <div className="position-relative">
                            <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                            <Form.Control
                                type="text"
                                placeholder="Tìm tên sản phẩm..."
                                className="ps-5 rounded-pill border-0 shadow-sm"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                style={{ minWidth: '300px' }}
                            />
                        </div>
                        <Button variant="white" className="shadow-sm bg-white border-0 text-primary fw-bold" onClick={fetchProducts}>
                            <FaSyncAlt className={loading ? 'fa-spin' : ''} />
                        </Button>
                    </div>
                </div>

                <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                    <Card.Body className="p-0">
                        <Table hover responsive className="mb-0 align-middle">
                            <thead className="bg-light text-secondary text-uppercase small fw-bold">
                                <tr>
                                    <th className="px-4 py-3 border-0">Sản phẩm</th>
                                    <th className="border-0 text-center">Phân loại</th>
                                    <th className="border-0 text-center" style={{ width: '200px' }}>Tồn kho</th>
                                    <th className="border-0 text-end px-4">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="4" className="text-center py-5"><Spinner animation="border" size="sm" /> Đang tải...</td></tr>
                                ) : filteredProducts.length === 0 ? (
                                    <tr><td colSpan="4" className="text-center py-5 text-muted">Không tìm thấy sản phẩm</td></tr>
                                ) : (
                                    filteredProducts.map(product => {
                                        const hasVariants = product.variants && product.variants.length > 0;
                                        const isExpanded = expandedRows[product.id];
                                        const editKey = `product-${product.id}`;
                                        const currentStock = editingStock[editKey] !== undefined ? editingStock[editKey] : product.stockQuantity;
                                        const isLowStock = !hasVariants && product.stockQuantity <= 10;

                                        return (
                                            <React.Fragment key={product.id}>
                                                <tr className={isExpanded ? "bg-light-subtle" : ""}>
                                                    <td className="px-4">
                                                        <div className="d-flex align-items-center">
                                                            <div className="rounded-3 me-3 flex-shrink-0 overflow-hidden border" style={{ width: '40px', height: '40px' }}>
                                                                <img src={product.imageUrl} alt="" className="w-100 h-100 object-fit-cover" />
                                                            </div>
                                                            <div>
                                                                <div className="fw-bold text-dark">{product.name}</div>
                                                                <div className="small text-muted">ID: {product.id}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="text-center">
                                                        {hasVariants ? (
                                                            <Badge bg="info" className="text-dark bg-opacity-10 border border-info px-2 py-1">
                                                                {product.variants.length} Biến thể
                                                            </Badge>
                                                        ) : (
                                                            <Badge bg="secondary" className="bg-opacity-10 text-secondary border px-2 py-1">Đơn thể</Badge>
                                                        )}
                                                    </td>
                                                    <td className="text-center">
                                                        {hasVariants ? (
                                                            <span className="fw-bold text-dark">{product.stockQuantity}</span>
                                                        ) : (
                                                            <div className="d-flex align-items-center justify-content-center gap-2">
                                                                <Form.Control
                                                                    type="number"
                                                                    min="0"
                                                                    size="sm"
                                                                    className={`text-center fw-bold border-0 shadow-none ${isLowStock ? 'text-danger bg-danger bg-opacity-10' : 'text-primary bg-light'}`}
                                                                    style={{ width: '80px', fontSize: '1rem' }}
                                                                    value={currentStock}
                                                                    onChange={(e) => handleStockChange(editKey, e.target.value)}
                                                                />
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="text-end px-4">
                                                        {hasVariants ? (
                                                            <Button
                                                                variant="link"
                                                                className="text-decoration-none p-0 fw-bold text-muted"
                                                                onClick={() => toggleRow(product.id)}
                                                            >
                                                                {isExpanded ? <FaAngleUp /> : <FaAngleDown />} Chi tiết
                                                            </Button>
                                                        ) : (
                                                            editingStock[editKey] !== undefined && editingStock[editKey] != product.stockQuantity && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="primary"
                                                                    onClick={() => saveStock(product.id, false)}
                                                                    className="shadow-sm"
                                                                >
                                                                    <FaSave /> Lưu
                                                                </Button>
                                                            )
                                                        )}
                                                    </td>
                                                </tr>
                                                {/* EXPANDED ROW FOR VARIANTS */}
                                                {
                                                    hasVariants && (
                                                        <tr>
                                                            <td colSpan="4" className="p-0 border-0">
                                                                <Collapse in={isExpanded}>
                                                                    <div className="bg-light border-bottom p-3 ps-5">
                                                                        <Card className="border-0 shadow-sm">
                                                                            <Table size="sm" className="mb-0">
                                                                                <thead className="text-muted small">
                                                                                    <tr>
                                                                                        <th className="ps-4">Biến thể (Màu / Size)</th>
                                                                                        <th>SKU</th>
                                                                                        <th className="text-center" style={{ width: '150px' }}>Tồn kho</th>
                                                                                        <th className="text-end pe-4">Thao tác</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                    {product.variants.map(v => {
                                                                                        const vKey = `variant-${v.id}`;
                                                                                        const vStock = editingStock[vKey] !== undefined ? editingStock[vKey] : v.stockQuantity;
                                                                                        const isVLow = v.stockQuantity <= 10;
                                                                                        return (
                                                                                            <tr key={v.id}>
                                                                                                <td className="ps-4 align-middle">
                                                                                                    <div className="d-flex align-items-center">
                                                                                                        {v.imageUrl ? (
                                                                                                            <img src={v.imageUrl} className="rounded-1 me-2" width="30" height="30" alt="" />
                                                                                                        ) : <div className="rounded-1 me-2 bg-secondary bg-opacity-25" style={{ width: 30, height: 30 }}></div>}
                                                                                                        <span className="fw-medium">{v.color} - {v.productSize}</span>
                                                                                                    </div>
                                                                                                </td>
                                                                                                <td className="align-middle text-muted small">{v.sku}</td>
                                                                                                <td className="text-center align-middle">
                                                                                                    <Form.Control
                                                                                                        type="number"
                                                                                                        min="0"
                                                                                                        size="sm"
                                                                                                        className={`text-center fw-bold border-0 shadow-none mx-auto ${isVLow ? 'text-danger bg-danger bg-opacity-10' : 'text-primary bg-light'}`}
                                                                                                        style={{ width: '80px' }}
                                                                                                        value={vStock}
                                                                                                        onChange={(e) => handleStockChange(vKey, e.target.value)}
                                                                                                    />
                                                                                                </td>
                                                                                                <td className="text-end align-middle pe-4">
                                                                                                    {editingStock[vKey] !== undefined && editingStock[vKey] != v.stockQuantity && (
                                                                                                        <Button
                                                                                                            size="sm"
                                                                                                            variant="outline-primary"
                                                                                                            onClick={() => saveStock(v.id, true)}
                                                                                                            className="py-0"
                                                                                                        >
                                                                                                            Lưu
                                                                                                        </Button>
                                                                                                    )}
                                                                                                </td>
                                                                                            </tr>
                                                                                        );
                                                                                    })}
                                                                                </tbody>
                                                                            </Table>
                                                                        </Card>
                                                                    </div>
                                                                </Collapse>
                                                            </td>
                                                        </tr>
                                                    )
                                                }
                                            </React.Fragment>
                                        );
                                    })
                                )}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            </Container>
        </div >
    );
}
