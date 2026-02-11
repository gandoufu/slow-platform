import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Layout, Tree, Card, Button, Form, Input, Select, Space, message, Tag, Popconfirm, Tabs } from 'antd';
import { PlusOutlined, DeleteOutlined, SaveOutlined, ReloadOutlined, BugOutlined } from '@ant-design/icons';
import { getApis, createApi, updateApi, deleteApi, getApi } from '../../services/interface';
import { getProject } from '../../services/project';
import DebugRunner from '../../components/DebugRunner';
import type { Api } from '../../types/interface';
import type { Project } from '../../types/project';
import type { DataNode } from 'antd/es/tree';

const { Sider, Content } = Layout;
const { Option } = Select;
const { TextArea } = Input;

const ApiManagement: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const [apis, setApis] = useState<Api[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [selectedApiId, setSelectedApiId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false); // To distinguish between viewing and creating/editing
  const [activeTab, setActiveTab] = useState('design');

  const fetchApis = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const data = await getApis(parseInt(projectId));
      setApis(data);
    } catch (error) {
      console.error('获取接口列表失败', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectDetails = async () => {
    if (!projectId) return;
    try {
      const data = await getProject(parseInt(projectId));
      setProject(data);
    } catch (error) {
      console.error('获取项目详情失败', error);
    }
  };

  useEffect(() => {
    fetchApis();
    fetchProjectDetails();
  }, [projectId]);

  // Convert APIs to Tree Data (Group by module_name)
  const treeData: DataNode[] = React.useMemo(() => {
    const modules: Record<string, Api[]> = {};
    const ungrouped: Api[] = [];

    apis.forEach(api => {
      if (api.module_name) {
        if (!modules[api.module_name]) modules[api.module_name] = [];
        modules[api.module_name].push(api);
      } else {
        ungrouped.push(api);
      }
    });

    const nodes: DataNode[] = Object.keys(modules).map(module => ({
      title: module,
      key: `module-${module}`,
      children: modules[module].map(api => ({
        title: (
          <Space>
            <Tag color={getMethodColor(api.method)}>{api.method}</Tag>
            {api.name}
          </Space>
        ),
        key: api.id,
        isLeaf: true,
      })),
    }));

    if (ungrouped.length > 0) {
      nodes.push({
        title: '未分组',
        key: 'module-ungrouped',
        children: ungrouped.map(api => ({
          title: (
            <Space>
              <Tag color={getMethodColor(api.method)}>{api.method}</Tag>
              {api.name}
            </Space>
          ),
          key: api.id,
          isLeaf: true,
        })),
      });
    }

    return nodes;
  }, [apis]);

  const onSelect = async (selectedKeys: React.Key[]) => {
    if (selectedKeys.length === 0) return;
    const key = selectedKeys[0];
    if (typeof key === 'string' && key.startsWith('module-')) return; // Clicked on folder

    const apiId = Number(key);
    setSelectedApiId(apiId);
    setIsEditing(true);
    
    try {
      if (!projectId) return;
      const api = await getApi(parseInt(projectId), apiId);
      form.setFieldsValue(api);
    } catch (error) {
      console.error('获取接口详情失败', error);
    }
  };

  const handleCreateNew = () => {
    setSelectedApiId(null);
    setIsEditing(true);
    setActiveTab('design');
    form.resetFields();
  };

  const handleSave = async (values: any) => {
    if (!projectId) return;
    try {
      if (selectedApiId) {
        await updateApi(parseInt(projectId), selectedApiId, values);
        message.success('接口更新成功');
      } else {
        await createApi(parseInt(projectId), { ...values, project_id: parseInt(projectId) });
        message.success('接口创建成功');
      }
      fetchApis();
    } catch (error) {
      console.error('保存接口失败', error);
    }
  };

  const handleDelete = async () => {
    if (!projectId || !selectedApiId) return;
    try {
      await deleteApi(parseInt(projectId), selectedApiId);
      message.success('接口删除成功');
      setSelectedApiId(null);
      setIsEditing(false);
      form.resetFields();
      fetchApis();
    } catch (error) {
      console.error('删除接口失败', error);
    }
  };

  return (
    <Layout style={{ background: '#fff', height: '100%' }}>
      <Sider width={300} style={{ background: '#fff', borderRight: '1px solid #f0f0f0', padding: '16px 0' }}>
        <div style={{ padding: '0 16px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold' }}>接口列表</span>
          <Space>
            <Button icon={<ReloadOutlined />} type="text" onClick={fetchApis} />
            <Button type="primary" icon={<PlusOutlined />} size="small" onClick={handleCreateNew} />
          </Space>
        </div>
        <Tree
          treeData={treeData}
          onSelect={onSelect}
          blockNode
          defaultExpandAll
          height={600}
        />
      </Sider>
      <Content style={{ padding: 24 }}>
        {isEditing ? (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Tabs 
              activeKey={activeTab} 
              onChange={setActiveTab}
              style={{ background: '#fff', padding: '0 16px', marginBottom: 16, borderRadius: 8 }}
              items={[
                { key: 'design', label: <span><SaveOutlined /> 接口定义</span> },
                { key: 'debug', label: <span><BugOutlined /> 接口调试</span> },
              ]}
            />
            
            {activeTab === 'design' ? (
              <Card 
                title={selectedApiId ? "编辑接口" : "新建接口"} 
                extra={
                  selectedApiId && (
                    <Popconfirm title="确定删除吗？" onConfirm={handleDelete}>
                      <Button danger icon={<DeleteOutlined />}>删除</Button>
                    </Popconfirm>
                  )
                }
                style={{ flex: 1, overflow: 'auto' }}
              >
                <Form form={form} layout="vertical" onFinish={handleSave}>
                  <Space style={{ width: '100%' }} align="start">
                    <Form.Item name="method" rules={[{ required: true }]} initialValue="GET" style={{ width: 100 }}>
                      <Select>
                        <Option value="GET">GET</Option>
                        <Option value="POST">POST</Option>
                        <Option value="PUT">PUT</Option>
                        <Option value="DELETE">DELETE</Option>
                        <Option value="PATCH">PATCH</Option>
                      </Select>
                    </Form.Item>
                    <Form.Item name="url_path" rules={[{ required: true, message: '请输入接口路径' }]} style={{ flex: 1 }}>
                      <Input placeholder="/api/v1/users/{id}" prefix="/" />
                    </Form.Item>
                  </Space>

                  <Form.Item name="name" label="接口名称" rules={[{ required: true }]}>
                    <Input placeholder="例如：获取用户详情" />
                  </Form.Item>

                  <Form.Item name="module_name" label="所属模块">
                    <Input placeholder="例如：用户管理" />
                  </Form.Item>

                  <Form.Item name="description" label="描述">
                    <TextArea rows={3} />
                  </Form.Item>

                  <Tabs defaultActiveKey="params" items={[
                    {
                      key: 'params',
                      label: 'Query Params',
                      children: <div style={{ color: '#999' }}>暂未实现可视化编辑，请在后续版本中使用</div>
                    },
                    {
                      key: 'body',
                      label: 'Body',
                      children: <div style={{ color: '#999' }}>暂未实现可视化编辑，请在后续版本中使用</div>
                    },
                    {
                      key: 'headers',
                      label: 'Headers',
                      children: <div style={{ color: '#999' }}>暂未实现可视化编辑，请在后续版本中使用</div>
                    }
                  ]} />

                  <Form.Item style={{ marginTop: 24 }}>
                    <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                      保存
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            ) : (
              <div style={{ flex: 1, height: '100%' }}>
                <DebugRunner 
                  projectId={parseInt(projectId || '0')} 
                  environments={project?.environments || []}
                  initialValues={{
                    method: form.getFieldValue('method'),
                    url: form.getFieldValue('url_path'),
                    // TODO: Pass other values
                  }}
                />
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', marginTop: 100, color: '#999' }}>
            请在左侧选择接口或新建接口
          </div>
        )}
      </Content>
    </Layout>
  );
};

function getMethodColor(method: string) {
  switch (method.toUpperCase()) {
    case 'GET': return 'green';
    case 'POST': return 'blue';
    case 'PUT': return 'orange';
    case 'DELETE': return 'red';
    default: return 'default';
  }
}

export default ApiManagement;
