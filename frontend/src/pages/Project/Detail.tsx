import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Table, Button, Descriptions, Tag, Space, Modal, Form, Input, message, Tabs, Typography } from 'antd';
import { ArrowLeftOutlined, PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { getProject, createEnvironment } from '../../services/project';
import type { Project, Environment } from '../../types/project';

const { Title } = Typography;

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEnvModalOpen, setIsEnvModalOpen] = useState(false);
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

  const handleCreateEnv = async (values: any) => {
    if (!project) return;
    try {
      await createEnvironment(project.id, values);
      message.success('环境创建成功');
      setIsEnvModalOpen(false);
      form.resetFields();
      fetchProject(); // Refresh to show new environment (assuming backend returns updated project or we fetch envs separately)
    } catch (error) {
      console.error('创建环境失败', error);
    }
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
      render: (_: any) => (
        <Space size="middle">
          <Button type="text" icon={<EditOutlined />} title="编辑" />
          <Button type="text" danger icon={<DeleteOutlined />} title="删除" />
        </Space>
      ),
    },
  ];

  if (!project) return <div>加载中...</div>;

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/projects')}>
          返回项目列表
        </Button>
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
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsEnvModalOpen(true)}>
            新建环境
          </Button>
        }
      >
        {/* We assume project.environments is populated. If not, we might need a separate API call */}
        <Table 
          columns={envColumns} 
          dataSource={(project as any).environments || []} 
          rowKey="id" 
          pagination={false}
        />
      </Card>

      <Modal
        title="新建环境"
        open={isEnvModalOpen}
        onCancel={() => setIsEnvModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateEnv}>
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
