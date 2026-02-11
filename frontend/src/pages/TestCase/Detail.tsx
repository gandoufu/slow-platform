import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Form, Input, Select, Button, Space, Tabs, message, Row, Col, Typography, Divider, Table, Tag } from 'antd';
import { SaveOutlined, ArrowLeftOutlined, PlusOutlined, DeleteOutlined, PlayCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { getTestCase, createTestCase, updateTestCase, runTestCase } from '../../services/testCase';
import { getProject } from '../../services/project';
import type { TestCase, Assertion, TestRunResult } from '../../types/testCase';
import type { Project } from '../../types/project';

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

const TestCaseDetail: React.FC = () => {
  const { id: projectId, caseId } = useParams<{ id: string; caseId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'design');
  
  // Execution state
  const [selectedEnv, setSelectedEnv] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState<TestRunResult | null>(null);

  const isNew = caseId === 'new';

  useEffect(() => {
    if (projectId) {
      getProject(parseInt(projectId)).then(setProject).catch(console.error);
    }
  }, [projectId]);

  useEffect(() => {
    if (!isNew && projectId && caseId) {
      setLoading(true);
      getTestCase(parseInt(projectId), parseInt(caseId))
        .then(data => {
            // Convert JSON objects to string for editing if needed, or keep as object if using JSON input
            // For simple text areas, stringify
            const formData = {
                ...data,
                headers: data.headers ? JSON.stringify(data.headers, null, 2) : '',
                params: data.params ? JSON.stringify(data.params, null, 2) : '',
                body: data.body ? JSON.stringify(data.body, null, 2) : '',
            };
            form.setFieldsValue(formData);
        })
        .catch(error => {
            console.error(error);
            message.error('加载用例失败');
        })
        .finally(() => setLoading(false));
    }
  }, [isNew, projectId, caseId]);

  const handleSave = async (values: any) => {
    if (!projectId) return;
    
    // Parse JSON fields
    try {
        const payload = {
            ...values,
            project_id: parseInt(projectId),
            headers: values.headers ? JSON.parse(values.headers) : undefined,
            params: values.params ? JSON.parse(values.params) : undefined,
            body: values.body ? JSON.parse(values.body) : undefined,
        };

        if (isNew) {
            const newCase = await createTestCase(parseInt(projectId), payload);
            message.success('创建成功');
            navigate(`/projects/${projectId}/test-cases/${newCase.id}`, { replace: true });
        } else {
            await updateTestCase(parseInt(projectId), parseInt(caseId!), payload);
            message.success('更新成功');
        }
    } catch (e: any) {
        console.error(e);
        message.error(`保存失败: ${e.message}`);
    }
  };

  const handleRun = async () => {
    if (!projectId || !caseId || !selectedEnv) {
        message.warning('请选择环境');
        return;
    }
    setRunning(true);
    setRunResult(null);
    try {
        const result = await runTestCase(parseInt(projectId), parseInt(caseId), selectedEnv);
        setRunResult(result);
        if (result.passed) {
            message.success('执行通过');
        } else {
            message.error('执行失败');
        }
    } catch (e: any) {
        console.error(e);
        message.error(`执行出错: ${e.message}`);
    } finally {
        setRunning(false);
    }
  };

  const assertionColumns = [
    { title: '检查源', dataIndex: 'source', key: 'source' },
    { title: '表达式', dataIndex: 'expression', key: 'expression' },
    { title: '操作符', dataIndex: 'operator', key: 'operator' },
    { title: '预期值', dataIndex: 'value', key: 'value' },
    { 
        title: '实际值', 
        dataIndex: 'actual_value', 
        key: 'actual_value',
        render: (val: any) => (typeof val === 'object' ? JSON.stringify(val) : String(val))
    },
    { 
        title: '结果', 
        key: 'passed',
        render: (_: any, record: any) => (
            <Tag color={record.passed ? 'success' : 'error'}>
                {record.passed ? '通过' : '失败'}
            </Tag>
        )
    },
    { title: '错误信息', dataIndex: 'error', key: 'error', render: (text: string) => <span style={{color: 'red'}}>{text}</span> },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={
            <Space>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`/projects/${projectId}/test-cases`)} />
                {isNew ? '新建用例' : '编辑用例'}
            </Space>
        }
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
            {
                key: 'design',
                label: '用例设计',
                children: (
                    <Form form={form} layout="vertical" onFinish={handleSave}>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item name="name" label="用例名称" rules={[{ required: true }]}>
                                    <Input placeholder="输入用例名称" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="description" label="描述">
                                    <Input placeholder="用例描述" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Divider>请求信息</Divider>
                        <Space style={{ width: '100%' }}>
                            <Form.Item name="method" rules={[{ required: true }]} initialValue="GET">
                                <Select style={{ width: 100 }}>
                                    <Option value="GET">GET</Option>
                                    <Option value="POST">POST</Option>
                                    <Option value="PUT">PUT</Option>
                                    <Option value="DELETE">DELETE</Option>
                                </Select>
                            </Form.Item>
                            <Form.Item name="url" rules={[{ required: true }]} style={{ flex: 1, minWidth: 400 }}>
                                <Input placeholder="/api/v1/users (不包含 Host)" prefix="/" />
                            </Form.Item>
                        </Space>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item name="headers" label="Headers (JSON)">
                                    <TextArea rows={4} placeholder='{"Content-Type": "application/json"}' style={{ fontFamily: 'monospace' }} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="params" label="Query Params (JSON)">
                                    <TextArea rows={4} placeholder='{"page": 1}' style={{ fontFamily: 'monospace' }} />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Form.Item name="body" label="Body (JSON)">
                            <TextArea rows={6} placeholder='{"key": "value"}' style={{ fontFamily: 'monospace' }} />
                        </Form.Item>

                        <Divider>断言规则</Divider>
                        <Form.List name="assertions">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...restField }) => (
                                        <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="start">
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'source']}
                                                rules={[{ required: true, message: 'Missing source' }]}
                                            >
                                                <Select style={{ width: 120 }} placeholder="检查源">
                                                    <Option value="status_code">Status Code</Option>
                                                    <Option value="body">Body (JSON)</Option>
                                                    <Option value="header">Header</Option>
                                                    <Option value="response_time">Time (s)</Option>
                                                </Select>
                                            </Form.Item>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'expression']}
                                            >
                                                <Input placeholder="JSONPath / Header Key" />
                                            </Form.Item>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'operator']}
                                                rules={[{ required: true, message: 'Missing op' }]}
                                            >
                                                <Select style={{ width: 100 }} placeholder="操作符">
                                                    <Option value="eq">Equals</Option>
                                                    <Option value="gt">Greater</Option>
                                                    <Option value="lt">Less</Option>
                                                    <Option value="contains">Contains</Option>
                                                </Select>
                                            </Form.Item>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'value']}
                                                rules={[{ required: true, message: 'Missing val' }]}
                                            >
                                                <Input placeholder="预期值" />
                                            </Form.Item>
                                            <MinusCircleOutlined onClick={() => remove(name)} />
                                        </Space>
                                    ))}
                                    <Form.Item>
                                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                            添加断言
                                        </Button>
                                    </Form.Item>
                                </>
                            )}
                        </Form.List>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                                保存用例
                            </Button>
                        </Form.Item>
                    </Form>
                )
            },
            {
                key: 'run',
                label: '执行测试',
                children: (
                    <div style={{ minHeight: 400 }}>
                        <Space style={{ marginBottom: 16 }}>
                            <Select 
                                style={{ width: 200 }} 
                                placeholder="选择运行环境" 
                                value={selectedEnv}
                                onChange={setSelectedEnv}
                            >
                                {project?.environments?.map(env => (
                                    <Option key={env.id} value={env.id}>{env.name}</Option>
                                ))}
                            </Select>
                            <Button 
                                type="primary" 
                                icon={<PlayCircleOutlined />} 
                                onClick={handleRun}
                                loading={running}
                                disabled={!selectedEnv || isNew}
                            >
                                运行
                            </Button>
                            {isNew && <Text type="secondary">请先保存用例</Text>}
                        </Space>

                        {runResult && (
                            <div>
                                <Divider>执行结果</Divider>
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    <Card size="small" title="基础信息">
                                        <Space size="large">
                                            <Tag color={runResult.passed ? 'success' : 'error'}>
                                                {runResult.passed ? '测试通过' : '测试失败'}
                                            </Tag>
                                            <Text>Status: {runResult.result.status_code}</Text>
                                            <Text>Time: {runResult.result.duration}s</Text>
                                        </Space>
                                    </Card>

                                    <Card size="small" title="断言详情">
                                        <Table 
                                            dataSource={runResult.assertions} 
                                            columns={assertionColumns} 
                                            pagination={false} 
                                            rowKey={(r) => r.expression + r.operator}
                                            size="small"
                                        />
                                    </Card>

                                    <Card size="small" title="响应内容">
                                        <Tabs items={[
                                            {
                                                key: 'body',
                                                label: 'Body',
                                                children: <TextArea value={JSON.stringify(runResult.result.body, null, 2)} rows={10} readOnly />
                                            },
                                            {
                                                key: 'headers',
                                                label: 'Headers',
                                                children: <TextArea value={JSON.stringify(runResult.result.headers, null, 2)} rows={10} readOnly />
                                            }
                                        ]} />
                                    </Card>
                                </Space>
                            </div>
                        )}
                    </div>
                )
            }
        ]} />
      </Card>
    </div>
  );
};

export default TestCaseDetail;
