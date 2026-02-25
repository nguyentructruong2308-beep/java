import React, { useEffect, useState } from 'react';
import API from '../../api/api';

import { Row, Col, Card, Spinner, Alert, ProgressBar, Form, Button, Container, Table } from 'react-bootstrap';
import { FaUsers, FaBoxOpen, FaShoppingCart, FaDollarSign, FaArrowUp, FaArrowDown, FaSyncAlt, FaChartLine, FaTrophy, FaPrint } from 'react-icons/fa';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getImageUrl = (url) => {
  if (!url) return 'https://placehold.co/100';
  if (url.startsWith('http')) return url;
  return `${API.defaults.baseURL}/files/download/${url}`;
};

export default function StatisticsPage() {

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const res = await API.get('/statistics');
      setStats(res.data);
    } catch (err) {
      setError('Không thể tải dữ liệu thống kê. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  const exportToCSV = () => {
    if (!stats) return;
    
    // Tạo nội dung báo cáo chi tiết hơn
    const reportHeader = [
      ["BÁO CÁO KINH DOANH ICREAM"],
      [`Ngày xuất: ${new Date().toLocaleString('vi-VN')}`],
      [""],
      ["Tóm tắt chỉ số"],
      ["Tổng doanh thu", `${stats.totalRevenue} ₫`],
      ["Tổng đơn hàng", stats.totalOrders],
      ["Tổng khách hàng", stats.totalUsers],
      [""],
      ["CHI TIẾT DOANH THU 7 NGÀY GẦN NHẤT"],
      ["Ngày", "Doanh thu (₫)", "Số đơn hàng"]
    ];

    const trendRows = Object.entries(stats.revenueTrend).reverse().map(([date, rev]) => [
      new Date(date).toLocaleDateString('vi-VN'), rev, stats.orderTrend[date] || 0
    ]);

    const topProductHeader = [
      [""],
      ["TOP SẢN PHẨM BÁN CHẠY"],
      ["Tên sản phẩm", "Số lượng bán", "Doanh thu (₫)"]
    ];

    const topProductRows = stats.topSellingProducts?.map(p => [
      p.name, p.salesCount, p.totalRevenue
    ]) || [];

    const allRows = [...reportHeader, ...trendRows, ...topProductHeader, ...topProductRows];

    // Chuyển mảng thành chuỗi CSV. 
    // QUAN TRỌNG: BOM (\uFEFF) phải nằm ở VỊ TRÍ ĐẦU TIÊN (byte 0) để Excel nhận diện UTF-8.
    // Loại bỏ "sep=," vì nó làm Excel hiểu lầm byte đầu tiên không phải là BOM.
    const csvContent = "\uFEFF" + allRows.map(e => e.map(item => `"${item}"`).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `bao_cao_kinh_doanh_icream_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printReport = () => {
    if (!stats) return;
    const reportWindow = window.open('', '_blank', 'width=1000,height=800');
    
    const reportHTML = `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <title>Báo cáo kinh doanh ICREAM - ${new Date().toLocaleDateString('vi-VN')}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap" rel="stylesheet">
        <style>
          :root { --primary: #ff758c; --secondary: #ff7eb3; --text: #2d3436; --light: #f8f9fa; }
          * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', sans-serif; }
          body { padding: 40px; background: #fff; color: var(--text); }
          .header { text-align: center; border-bottom: 3px solid var(--primary); padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { font-size: 28px; color: var(--primary); letter-spacing: 1px; }
          
          .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 40px; }
          .stat-card { padding: 20px; border-radius: 15px; background: var(--light); text-align: center; border: 1px solid #eee; }
          .stat-card h4 { font-size: 11px; text-transform: uppercase; color: #888; margin-bottom: 10px; }
          .stat-card p { font-size: 18px; font-weight: 800; color: var(--primary); }

          .section-title { font-size: 16px; font-weight: 700; margin-bottom: 20px; color: var(--text); padding-left: 10px; border-left: 4px solid var(--primary); }
          
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { background: #f1f1f1; padding: 12px; text-align: left; font-size: 12px; font-weight: 700; border-bottom: 2px solid #ddd; }
          td { padding: 12px; border-bottom: 1px solid #eee; font-size: 13px; }

          .footer { text-align: center; margin-top: 50px; font-size: 11px; color: #999; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>ICREAM - BÁO CÁO KINH DOANH</h1>
          <p>Ngày xuất báo cáo: ${new Date().toLocaleString('vi-VN')}</p>
        </div>

        <div class="stats-grid">
          <div class="stat-card"><h4>Tổng Doanh Thu</h4><p>${Number(stats.totalRevenue).toLocaleString('vi-VN')} ₫</p></div>
          <div class="stat-card"><h4>Tổng Đơn Hàng</h4><p>${stats.totalOrders}</p></div>
          <div class="stat-card"><h4>Số Khách Hàng</h4><p>${stats.totalUsers}</p></div>
          <div class="stat-card"><h4>Số Sản Phẩm</h4><p>${stats.totalProducts}</p></div>
        </div>

        <h3 class="section-title">Xu hướng doanh thu 7 ngày gần nhất</h3>
        <table>
          <thead>
            <tr>
              <th>Ngày</th>
              <th style="text-align: right;">Doanh thu (₫)</th>
              <th style="text-align: center;">Số đơn hàng</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(stats.revenueTrend).reverse().map(([date, rev]) => `
              <tr>
                <td>${new Date(date).toLocaleDateString('vi-VN')}</td>
                <td style="text-align: right;">${Number(rev).toLocaleString('vi-VN')} ₫</td>
                <td style="text-align: center;">${stats.orderTrend[date] || 0}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h3 class="section-title">Sản phẩm bán chạy nhất</h3>
        <table>
          <thead>
            <tr>
              <th>Tên sản phẩm</th>
              <th style="text-align: center;">Số lượng bán</th>
              <th style="text-align: right;">Doanh thu (₫)</th>
            </tr>
          </thead>
          <tbody>
            ${stats.topSellingProducts?.map(p => `
              <tr>
                <td><strong>${p.name}</strong></td>
                <td style="text-align: center;">${p.salesCount}</td>
                <td style="text-align: right;">${Number(p.totalRevenue).toLocaleString('vi-VN')} ₫</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Tài liệu lưu hành nội bộ - ICREAM Management System</p>
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;
    reportWindow.document.write(reportHTML);
    reportWindow.document.close();
  };



  const money = (v) => Number(v)?.toLocaleString('vi-VN') + ' ₫';

  // Format data for Recharts
  const trendData = stats?.revenueTrend ? Object.entries(stats.revenueTrend).map(([date, revenue]) => ({
    name: date.split('-').slice(1).reverse().join('/'),
    revenue: revenue,
    orders: stats.orderTrend[date] || 0
  })) : [];

  const pieData = stats?.revenueByCategory ? Object.entries(stats.revenueByCategory).map(([name, value]) => ({
    name, value
  })) : [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
        <p className="text-muted mt-3">Đang phân tích dữ liệu kinh doanh...</p>
      </div>
    );
  }

  if (error) {
    return <Container className="py-4"><Alert variant="danger" className="shadow-sm border-0">{error}</Alert></Container>;
  }

  return (
    <div style={{ backgroundColor: '#f4f6f9', minHeight: '100vh' }} className="pb-5">
      <Container fluid className="py-4">
        
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="fw-bold text-dark mb-1">Tổng quan hoạt động</h4>
            <p className="text-muted mb-0">Theo dõi hiệu quả kinh doanh và tồn kho của bạn.</p>
          </div>
          <div className="d-flex gap-2">
            <Button variant="outline-primary" className="d-flex align-items-center shadow-sm" onClick={exportToCSV}>
              CSV
            </Button>
            <Button variant="outline-success" className="d-flex align-items-center shadow-sm" onClick={() => printReport()}>
              <FaPrint className="me-2" /> In Báo Cáo (Invoices Style)
            </Button>
            <Button variant="primary" className="d-flex align-items-center shadow-sm" onClick={fetchStatistics}>
              <FaSyncAlt className={`me-2 ${loading ? 'fa-spin' : ''}`} /> Làm mới
            </Button>
          </div>
        </div>

        {stats && (
          <>
            {/* OVERVIEW CARDS */}
            <Row>
              <StatCard 
                title="Doanh thu" 
                value={money(stats.totalRevenue)} 
                icon={<FaDollarSign />} 
                variant="success" 
                growth={stats.revenueGrowth} 
              />
              <StatCard 
                title="Đơn hàng" 
                value={stats.totalOrders} 
                icon={<FaShoppingCart />} 
                variant="primary" 
                growth={stats.orderGrowth} 
              />
              <StatCard 
                title="Sản phẩm" 
                value={stats.totalProducts} 
                icon={<FaBoxOpen />} 
                variant="info" 
              />
              <StatCard 
                title="Khách hàng" 
                value={stats.totalUsers} 
                icon={<FaUsers />} 
                variant="warning" 
              />
            </Row>

            <Row className="mt-4">
              {/* REVENUE TREND CHART */}
              <Col lg={8} className="mb-4">
                <Card className="border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                  <Card.Body className="p-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h6 className="fw-bold mb-0">Xu hướng doanh thu (7 ngày qua)</h6>
                      <FaChartLine className="text-muted" />
                    </div>
                    <div style={{ width: '100%', height: 300 }}>
                      <ResponsiveContainer>
                        <AreaChart data={trendData}>
                          <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#0d6efd" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#0d6efd" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#888'}} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#888'}} tickFormatter={(v) => `${v/1000}k`} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}
                            formatter={(value) => [money(value), 'Doanh thu']}
                          />
                          <Area type="monotone" dataKey="revenue" stroke="#0d6efd" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              {/* CATEGORY DISTRIBUTION */}
              <Col lg={4} className="mb-4">
                <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
                  <Card.Body className="p-4">
                    <h6 className="fw-bold mb-4">Cơ cấu doanh thu theo loại</h6>
                    <div style={{ width: '100%', height: 250 }}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={pieData}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => money(value)} />
                          <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Row>
              {/* TOP PRODUCTS */}
              <Col lg={7} className="mb-4">
                <Card className="border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                  <Card.Body className="p-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h6 className="fw-bold mb-0">Sản phẩm bán chạy nhất</h6>
                      <FaTrophy className="text-warning" />
                    </div>
                    <Table borderless hover responsive className="align-middle">
                      <thead className="bg-light text-muted uppercase fs-7">
                        <tr>
                          <th>Sản phẩm</th>
                          <th className="text-center">Số lượng</th>
                          <th className="text-end">Doanh thu</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.topSellingProducts?.map((product, idx) => (
                          <tr key={idx}>
                            <td>
                              <div className="d-flex align-items-center">
                                <img 
                                  src={getImageUrl(product.imageUrl)} 
                                  alt={product.name}
                                  className="rounded-circle me-3"
                                  style={{ width: '35px', height: '35px', objectFit: 'cover' }}
                                />
                                <span className="fw-medium text-dark">{product.name}</span>
                              </div>
                            </td>
                            <td className="text-center fw-bold text-dark">{product.salesCount}</td>
                            <td className="text-end text-success fw-bold">{money(product.totalRevenue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>

              {/* ORDER STATUS PROGRESS */}
              <Col lg={5} className="mb-4">
                <Card className="border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                  <Card.Body className="p-4">
                    <h6 className="fw-bold mb-4">Trạng thái đơn hàng</h6>
                    {Object.entries(stats.ordersByStatus).map(([status, count]) => {
                       const percent = Math.round((count / stats.totalOrders) * 100) || 0;
                       let color = 'primary';
                       if (status === 'CANCELLED') color = 'danger';
                       else if (status === 'DELIVERED') color = 'success';
                       else if (status === 'PENDING') color = 'warning';

                       return (
                         <div className="mb-3" key={status}>
                           <div className="d-flex justify-content-between mb-1">
                             <small className="fw-bold text-uppercase text-muted" style={{ fontSize: '0.65rem' }}>{status}</small>
                             <small className="fw-bold">{count} đơn ({percent}%)</small>
                           </div>
                           <ProgressBar now={percent} variant={color} style={{ height: '6px' }} className="rounded-pill" />
                         </div>
                       );
                    })}
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Row>
              {/* LOW STOCK ALERTS */}
              <Col lg={12} className="mb-4">
                <Card className="border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                  <Card.Body className="p-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <div className="d-flex align-items-center">
                        <h6 className="fw-bold mb-0">Cảnh báo tồn kho thấp</h6>
                        <span className="badge bg-danger ms-2 rounded-pill shadow-sm" style={{ fontSize: '0.7rem' }}>
                          Threshold &lt; 10
                        </span>
                      </div>
                      <FaBoxOpen className="text-danger" />
                    </div>
                    
                    {stats.lowStockItems && stats.lowStockItems.length > 0 ? (
                      <Table borderless hover responsive className="align-middle mb-0">
                        <thead className="bg-light text-muted uppercase fs-7">
                          <tr>
                            <th>Sản phẩm</th>
                            <th>Phân loại / Biến thể</th>
                            <th className="text-center">Tồn kho hiện tại</th>
                            <th className="text-center">Tình trạng</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.lowStockItems.map((item, idx) => (
                            <tr key={idx}>
                              <td className="fw-medium text-dark">{item.name}</td>
                              <td className="text-muted fs-7">{item.variantInfo}</td>
                              <td className="text-center fw-bold text-danger">{item.currentStock}</td>
                              <td className="text-center">
                                <span className={`badge rounded-pill bg-${item.currentStock === 0 ? 'dark' : 'danger'} bg-opacity-10 text-${item.currentStock === 0 ? 'dark' : 'danger'} px-3 py-2 fw-medium`} style={{ fontSize: '0.7rem' }}>
                                  {item.currentStock === 0 ? 'Hết hàng' : 'Sắp hết hàng'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    ) : (
                      <div className="text-center py-5">
                        <div className="text-success fs-1 mb-3">✓</div>
                        <p className="text-muted mb-0">Tất cả sản phẩm đều đủ hàng. Tuyệt vời!</p>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        )}
      </Container>
    </div>
  );
}

function StatCard({ title, value, icon, variant, growth }) {
  return (
    <Col md={6} lg={3} className="mb-4">
      <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
        <Card.Body className="p-3">
          <div className="d-flex justify-content-between mb-2">
            <div className={`rounded-circle bg-${variant} bg-opacity-10 text-${variant} d-flex align-items-center justify-content-center`}
                 style={{ width: '40px', height: '40px' }}>
              {icon}
            </div>
            {growth !== undefined && (
              <span className={`badge rounded-pill bg-${growth >= 0 ? 'success' : 'danger'} bg-opacity-10 text-${growth >= 0 ? 'success' : 'danger'} d-flex align-items-center`}
                    style={{ fontSize: '0.7rem' }}>
                {growth >= 0 ? <FaArrowUp className="me-1" size={8} /> : <FaArrowDown className="me-1" size={8} />}
                {Math.abs(growth).toFixed(1)}%
              </span>
            )}
          </div>
          <p className="text-muted mb-1 fs-7 fw-medium">{title}</p>
          <h4 className="fw-bold text-dark mb-0">{value}</h4>
        </Card.Body>
      </Card>
    </Col>
  );
}
