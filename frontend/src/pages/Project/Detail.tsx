import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Table, Button, Descriptions, Tag, Space, Modal, Form, Input, message, Popconfirm } from 'antd';
import { ArrowLeftOutlined, PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { getProject, createEnvironment, updateEnvironment, deleteEnvironment } from '../../services/project';
import type { Project, Environment } from '../../types/project';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEnvModalOpen, setIsEnvModalOpen] = useState(false);
  const [editingEnv, setEditingEnv] = useState<Environment | null>(null);
  const [form] = Form.useForm();

  const fetchProject = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getProject(parseInt(id));
      setProject(data);
    } catch (error) {
      console.error('获取项目详情失败', error);
      message.error('加载项目详情失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleEnvSubmit = async (values: any) => {
    if (!project) return;
    try {
      if (editingEnv) {
        await updateEnvironment(project.id, editingEnv.id, values);
        message.success('环境更新成功');
      } else {
        await createEnvironment(project.id, values);
        message.success('环境创建成功');
      }
      setIsEnvModalOpen(false);
      setEditingEnv(null);
      form.resetFields();
      fetchProject();
    } catch (error) {
      console.error(editingEnv ? '更新环境失败' : '创建环境失败', error);
    }
  };

  const handleEditEnv = (env: Environment) => {
    setEditingEnv(env);
    form.setFieldsValue(env);
    setIsEnvModalOpen(true);
  };

  const handleDeleteEnv = async (envId: number) => {
    if (!project) return;
    try {
      await deleteEnvironment(project.id, envId);
      message.success('环境删除成功');
      fetchProject();
    } catch (error) {
      console.error('删除环境失败', error);
    }
  };

  const handleCancelEnv = () => {
    setIsEnvModalOpen(false);
    setEditingEnv(null);
    form.resetFields();
  };

  const envColumns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '标识 (Code)',
      dataIndex: 'code',
      key: 'code',
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '基础 URL',
      dataIndex: 'base_url',
      key: 'base_url',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Environment) => (
        <Space size="middle">
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEditEnv(record)} title="编辑" />
          <Popconfirm
            title="确定要删除这个环境吗？"
            onConfirm={() => handleDeleteEnv(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" danger icon={<DeleteOutlined />} title="删除" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (!project) return <div>加载中...</div>;

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/projects')}>
            返回项目列表
          </Button>
          <Button type="primary" icon={<EditOutlined />} onClick={() => navigate(`/projects/${id}/apis`)}>
            接口管理
          </Button>
        </Space>
      </div>
      
      <Card loading={loading}>
        <Descriptions title={project.name} bordered>
          <Descriptions.Item label="描述" span={3}>{project.description || '-'}</Descriptions.Item>
          <Descriptions.Item label="负责人 ID">{project.owner_id}</Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={project.is_active ? 'green' : 'red'}>
              {project.is_active ? '启用' : '禁用'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">{new Date(project.created_at).toLocaleString()}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card 
        style={{ marginTop: 24 }}
        tabList={[{ key: 'environments', tab: '环境管理' }]}
        activeTabKey="environments"
        tabBarExtraContent={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingEnv(null); form.resetFields(); setIsEnvModalOpen(true); }}>
            新建环境
          </Button>
        }
      >
        <Table 
          columns={envColumns} 
          dataSource={(project as any).environments || []} 
          rowKey="id" 
          pagination={false}
        />
      </Card>

      <Modal
        title={editingEnv ? "编辑环境" : "新建环境"}
        open={isEnvModalOpen}
        onCancel={handleCancelEnv}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleEnvSubmit}>
          <Form.Item
            name="name"
            label="环境名称"
            rules={[{ required: true, message: '请输入环境名称！' }]}
          >
            <Input placeholder="例如：开发环境" />
          </Form.Item>
          <Form.Item
            name="code"
            label="标识 (Code)"
            rules={[{ required: true, message: '请输入环境标识！' }]}
          >
            <Input placeholder="例如：dev, test, prod" />
          </Form.Item>
          <Form.Item
            name="base_url"
            label="基础 URL"
            rules={[{ required: true, message: '请输入基础 URL！' }, { type: 'url', message: '请输入有效的 URL！' }]}
          >
            <Input placeholder="例如：https://api-dev.example.com" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="环境描述..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectDetail;
