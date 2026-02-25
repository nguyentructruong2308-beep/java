import React, { useEffect, useState } from "react";
import API from "../../api/api";
import { confirmSwal, successSwal, errorSwal } from "../../utils/swal";
import { Modal, Button, Form, Table, Card, Badge, Container, Row, Col, Spinner, InputGroup } from "react-bootstrap";
import { FaUserPlus, FaUserEdit, FaTrash, FaSyncAlt, FaUserShield, FaSearch, FaEnvelope, FaPhone } from "react-icons/fa";

export default function UserPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("CUSTOMER");
  const [isActive, setIsActive] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get("/users");
      setUsers(res.data);
    } catch {
      errorSwal("Lỗi!", "Không thể tải danh sách người dùng từ hệ thống.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await confirmSwal("Xóa người dùng?", "Hành động này sẽ loại bỏ người dùng vĩnh viễn khỏi hệ thống. Bạn có chắc không?");
    if (!result.isConfirmed) return;
    try {
        await API.delete(`/users/${id}`);
        setUsers(users.filter((u) => u.id !== id));
        successSwal("Đã xóa!", "Tài khoản người dùng đã được gỡ bỏ.");
      } catch {
        errorSwal("Thất bại!", "Không thể xóa người dùng vào lúc này.");
      }
  };

  // --- SELECTION HANDLERS ---
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(users.map(u => u.id));
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
      `Xóa ${selectedIds.length} người dùng?`, 
      "Hành động này sẽ xóa vĩnh viễn các tài khoản được chọn. Bạn có chắc không?"
    );
    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      await Promise.all(selectedIds.map(id => API.delete(`/users/${id}`)));
      successSwal("Thành công!", `Đã xóa ${selectedIds.length} tài khoản.`);
      setSelectedIds([]);
      fetchUsers();
    } catch (err) {
      errorSwal("Lỗi!", "Có lỗi xảy ra khi xóa hàng loạt.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setEmail(user.email);
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setPhone(user.phone || "");
    setRole(user.role);
    setIsActive(user.isActive);
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const payload = { email, firstName, lastName, phone, role, isActive };
      if (editUser) {
        await API.put(`/users/${editUser.id}`, payload);
      } else {
        await API.post("/users", payload);
      }
      setShowModal(false);
      setEditUser(null);
      fetchUsers();
      successSwal("Thành công!", editUser ? "Thông tin người dùng đã được cập nhật." : "Tài khoản mới đã được tạo thành công.");
    } catch (err) {
      errorSwal("Lỗi!", "Không thể lưu thông tin người dùng.");
    }
  };

  const handleAdd = () => {
    setEditUser(null);
    setEmail("");
    setFirstName("");
    setLastName("");
    setPhone("");
    setRole("CUSTOMER");
    setIsActive(true);
    setShowModal(true);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div style={{ backgroundColor: '#f4f6f9', minHeight: '100vh' }} className="pb-5">
      <Container fluid="lg" className="py-4 text-dark">
        
        {/* HEADER SECTION */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
          <div>
            <h4 className="fw-bolder mb-1">Quản lý người dùng</h4>
            <p className="text-muted mb-0 small">Quản lý tài khoản khách hàng và nhân viên hệ thống</p>
          </div>
          <div className="d-flex gap-2 mt-3 mt-md-0 align-items-center">
            {selectedIds.length > 0 && (
              <Button variant="danger" className="fw-bold px-3 shadow-sm" onClick={handleBulkDelete}>
                <FaTrash className="me-2" /> Xóa {selectedIds.length} mục
              </Button>
            )}
            <Button variant="white" className="shadow-sm bg-white border-0 text-primary fw-bold" onClick={fetchUsers}>
              <FaSyncAlt className={`me-2 ${loading ? 'fa-spin' : ''}`} /> Làm mới
            </Button>
            <Button variant="primary" className="fw-bold px-3 shadow-sm" onClick={handleAdd}>
              <FaUserPlus className="me-2" /> Thêm người dùng
            </Button>
          </div>
        </div>

        {/* MAIN TABLE CARD */}
        <Card className="border-0 shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden' }}>
          <Card.Body className="p-0">
            <Table hover responsive className="align-middle mb-0">
              <thead className="bg-light text-muted uppercase small fw-bold">
                <tr>
                  <th className="px-4 py-3 border-0" style={{ width: '40px' }}>
                    <Form.Check 
                      type="checkbox"
                      checked={users.length > 0 && selectedIds.length === users.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="border-0">ID</th>
                  <th className="border-0">Người dùng</th>
                  <th className="border-0">Vai trò</th>
                  <th className="border-0 text-center">Trạng thái</th>
                  <th className="border-0 text-end px-4">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <Spinner animation="border" variant="primary" size="sm" className="me-2" />
                      Đang tải dữ liệu người dùng...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">Không có người dùng nào</td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className={selectedIds.includes(u.id) ? "bg-light-primary" : ""}>
                      <td className="px-4">
                        <Form.Check 
                          type="checkbox"
                          checked={selectedIds.includes(u.id)}
                          onChange={() => handleSelectOne(u.id)}
                        />
                      </td>
                      <td className="text-muted">#{u.id}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-3 text-primary d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                            <span className="fw-bold small">{u.firstName[0]}{u.lastName[0]}</span>
                          </div>
                          <div>
                            <div className="fw-bold text-dark">{`${u.firstName} ${u.lastName}`}</div>
                            <div className="text-muted small d-flex align-items-center">
                              <FaEnvelope size={10} className="me-1" /> {u.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge bg={u.role === "ADMIN" ? "danger" : "info"} className="bg-opacity-10 text-dark fw-normal border">
                          <FaUserShield size={10} className="me-1" /> {u.role}
                        </Badge>
                      </td>
                      <td className="text-center">
                        <Badge bg={u.isActive ? "success" : "secondary"} className="bg-opacity-10 text-dark fw-normal border px-3">
                          {u.isActive ? "● Hoạt động" : "○ Đã khoá"}
                        </Badge>
                      </td>
                      <td className="text-end px-4">
                        <Button variant="light" size="sm" className="me-2 text-primary shadow-sm border" onClick={() => handleEdit(u)}>
                          <FaUserEdit />
                        </Button>
                        <Button variant="light" size="sm" className="text-danger shadow-sm border" onClick={() => handleDelete(u.id)}>
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

      {/* MODAL SECTION */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered backdrop="static">
        <Form>
          <Modal.Header closeButton className="border-0 px-4 pt-4">
            <Modal.Title className="fw-bold">
              {editUser ? "Chỉnh sửa tài khoản" : "Thêm tài khoản mới"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="px-4 pb-4">
            <Row className="g-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="small fw-bold text-muted">Địa chỉ Email</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-light border-0"><FaEnvelope className="text-muted" size={12}/></InputGroup.Text>
                    <Form.Control type="email" className="bg-light border-0 shadow-none py-2" value={email} onChange={e => setEmail(e.target.value)} placeholder="example@mail.com" />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold text-muted">Họ</Form.Label>
                  <Form.Control type="text" className="bg-light border-0 shadow-none py-2" value={firstName} onChange={e => setFirstName(e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold text-muted">Tên</Form.Label>
                  <Form.Control type="text" className="bg-light border-0 shadow-none py-2" value={lastName} onChange={e => setLastName(e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="small fw-bold text-muted">Số điện thoại</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-light border-0"><FaPhone className="text-muted" size={12}/></InputGroup.Text>
                    <Form.Control type="text" className="bg-light border-0 shadow-none py-2" value={phone} onChange={e => setPhone(e.target.value)} />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold text-muted">Quyền truy cập</Form.Label>
                  <Form.Select className="bg-light border-0 shadow-none py-2" value={role} onChange={e => setRole(e.target.value)}>
                    <option value="CUSTOMER">CUSTOMER</option>
                    <option value="ADMIN">ADMIN</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              {editUser && (
                <Col md={6} className="d-flex align-items-end">
                   <div className="p-2 bg-light rounded shadow-sm w-100">
                    <Form.Check 
                      type="switch" 
                      label="Kích hoạt" 
                      checked={isActive} 
                      onChange={e => setIsActive(e.target.checked)}
                      className="small fw-bold"
                    />
                   </div>
                </Col>
              )}
            </Row>
          </Modal.Body>
          <Modal.Footer className="border-0 px-4 pb-4">
            <Button variant="light" className="fw-bold px-4 shadow-sm" onClick={() => setShowModal(false)}>Huỷ</Button>
            <Button variant="primary" className="fw-bold px-4 shadow-sm" onClick={handleSave}>Lưu thông tin</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}