import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Button, Space, Card, Tag, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { getTestCases, deleteTestCase } from '../../services/testCase';
import type { TestCase } from '../../types/testCase';

const TestCaseList: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTestCases = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const data = await getTestCases(parseInt(projectId));
      setTestCases(data);
    } catch (error) {
      console.error('Failed to fetch test cases', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestCases();
  }, [projectId]);

  const handleDelete = async (id: number) => {
    if (!projectId) return;
    try {
      await deleteTestCase(parseInt(projectId), id);
      message.success('用例删除成功');
      fetchTestCases();
    } catch (error) {
      console.error('Failed to delete test case', error);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
    },
    {
      title: '用例名称',
      dataIndex: 'name',
      render: (text: string, record: TestCase) => (
        <a onClick={() => navigate(`/projects/${projectId}/test-cases/${record.id}`)}>{text}</a>
      ),
    },
    {
      title: '方法',
      dataIndex: 'method',
      width: 100,
      render: (method: string) => (
        <Tag color={method === 'GET' ? 'green' : method === 'POST' ? 'blue' : 'orange'}>
          {method}
        </Tag>
      ),
    },
    {
      title: 'URL',
      dataIndex: 'url',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: TestCase) => (
        <Space size="middle">
           <Button 
            type="text" 
            icon={<PlayCircleOutlined />} 
            onClick={() => navigate(`/projects/${projectId}/test-cases/${record.id}?tab=run`)}
            title="执行"
          />
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => navigate(`/projects/${projectId}/test-cases/${record.id}`)}
            title="编辑"
          />
          <Popconfirm
            title="确定删除该用例吗？"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} title="删除" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card 
      title="用例列表" 
      extra={
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => navigate(`/projects/${projectId}/test-cases/new`)}
        >
          新建用例
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={testCases}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
};

export default TestCaseList;
