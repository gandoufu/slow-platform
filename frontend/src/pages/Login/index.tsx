import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';

const { Title } = Typography;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // Use URLSearchParams for x-www-form-urlencoded
      const params = new URLSearchParams();
      params.append('username', values.username);
      params.append('password', values.password);

      const response: any = await api.post('/login/access-token', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      // The interceptor now unwraps the response.data.data into response
      // But response.data.data contains { access_token: "..." }
      // So response here IS the { access_token: "..." } object
      if (response && response.access_token) {
        localStorage.setItem('access_token', response.access_token);
        message.success('登录成功');
        navigate('/dashboard');
      } else {
        throw new Error('响应格式无效');
      }
    } catch (error) {
      console.error('登录失败', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
      <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3}>Slow Platform</Title>
          <Typography.Text type="secondary">接口自动化测试平台</Typography.Text>
        </div>
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名！' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码！' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              登录
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            或者 <Link to="/register">立即注册！</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
