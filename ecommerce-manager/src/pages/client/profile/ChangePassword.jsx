import React, { useState } from 'react';
import { Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import API from '../../../api/api';

export default function ChangePassword() {
  const [formData, setFormData] = useState({ oldPassword: '', newPassword: '' });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== confirmPassword) {
      setError('Mật khẩu mới không khớp.');
      return;
    }
    if (formData.newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await API.post('/users/me/change-password', formData);
      setSuccess('Đổi mật khẩu thành công!');
      setFormData({ oldPassword: '', newPassword: '' });
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Mật khẩu cũ không đúng hoặc đã có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({...prev, [e.target.name]: e.target.value}));
  }

  return (
    <Card>
      <Card.Body>
        <Card.Title>Đổi mật khẩu</Card.Title>
        <hr />
        {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
        {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Mật khẩu cũ</Form.Label>
            <Form.Control type="password" name="oldPassword" value={formData.oldPassword} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Mật khẩu mới</Form.Label>
            <Form.Control type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Xác nhận mật khẩu mới</Form.Label>
            <Form.Control type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </Form.Group>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? <Spinner as="span" size="sm" /> : 'Lưu thay đổi'}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}