import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, message, Card, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getProjects, createProject, updateProject, deleteProject } from '../../services/project';
import type { Project } from '../../types/project';

const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (error) {
      console.error('获取项目列表失败', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSubmit = async (values: any) => {
    try {
      if (editingProject) {
        await updateProject(editingProject.id, values);
        message.success('项目更新成功');
      } else {
        await createProject(values);
        message.success('项目创建成功');
      }
      setIsModalOpen(false);
      setEditingProject(null);
      form.resetFields();
      fetchProjects();
    } catch (error) {
      console.error(editingProject ? '更新项目失败' : '创建项目失败', error);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    form.setFieldsValue(project);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteProject(id);
      message.success('项目删除成功');
      fetchProjects();
    } catch (error) {
      console.error('删除项目失败', error);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingProject(null);
    form.resetFields();
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Project) => (
        <a onClick={() => navigate(`/projects/${record.id}`)}>{text}</a>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Project) => (
        <Space size="middle">
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} title="编辑" />
          <Button type="text" icon={<SettingOutlined />} onClick={() => navigate(`/projects/${record.id}`)} title="环境管理" />
          <Popconfirm
            title="确定要删除这个项目吗？"
            description="删除后无法恢复，且会删除关联的所有环境和用例。"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" danger icon={<DeleteOutlined />} title="删除" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="项目列表"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingProject(null); form.resetFields(); setIsModalOpen(true); }}>
            新建项目
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={projects}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingProject ? "编辑项目" : "新建项目"}
        open={isModalOpen}
        onCancel={handleCancel}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="项目名称"
            rules={[{ required: true, message: '请输入项目名称！' }]}
          >
            <Input placeholder="例如：电商平台API" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={4} placeholder="项目描述..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectList;
