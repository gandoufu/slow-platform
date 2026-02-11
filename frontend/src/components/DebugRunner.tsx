import React, { useState } from 'react';
import { Card, Form, Input, Select, Button, Tabs, Space, Spin, Alert, Tag } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';
import { debugRun } from '../services/debug';
import type { Environment } from '../types/project';
import type { DebugResponse } from '../types/debug';

const { Option } = Select;
const { TextArea } = Input;

interface DebugRunnerProps {
  initialValues?: any;
  environments: Environment[];
  projectId: number;
}

const DebugRunner: React.FC<DebugRunnerProps> = ({ initialValues, environments }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<DebugResponse | null>(null);

  const handleRun = async (values: any) => {
    setLoading(true);
    setResponse(null);
    try {
      // Construct request body
      const requestData = {
        method: values.method,
        url: values.url,
        environment_id: values.environment_id,
        // TODO: Parse headers, params from string/JSON input
        headers: values.headers ? JSON.parse(values.headers) : undefined,
        body: values.body ? JSON.parse(values.body) : undefined,
        body_type: 'json' 
      };

      const res = await debugRun(requestData);
      setResponse(res);
    } catch (error: any) {
      console.error('Run failed', error);
      // If the API call itself failed (network error), mock a response structure
      if (!error.response && error.message) {
         setResponse({
             status_code: 0,
             headers: {},
             body: null,
             duration: 0,
             error: error.message
         });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: 24, height: '100%' }}>
      <div style={{ flex: 1 }}>
        <Card title="请求配置" size="small">
          <Form
            form={form}
            layout="vertical"
            initialValues={initialValues}
            onFinish={handleRun}
          >
            <Space.Compact style={{ width: '100%', marginBottom: 16 }}>
              <Form.Item name="method" noStyle initialValue="GET">
                <Select style={{ width: 100 }}>
                  <Option value="GET">GET</Option>
                  <Option value="POST">POST</Option>
                  <Option value="PUT">PUT</Option>
                  <Option value="DELETE">DELETE</Option>
                </Select>
              </Form.Item>
              <Form.Item name="environment_id" noStyle>
                <Select style={{ width: 150 }} placeholder="选择环境" allowClear>
                  {environments.map(env => (
                    <Option key={env.id} value={env.id}>{env.name}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="url" noStyle>
                <Input placeholder="输入接口路径 (如 /users/1)" />
              </Form.Item>
              <Button type="primary" htmlType="submit" icon={<PlayCircleOutlined />} loading={loading}>
                发送
              </Button>
            </Space.Compact>

            <Tabs defaultActiveKey="body" items={[
              {
                key: 'body',
                label: 'Body',
                children: (
                  <Form.Item name="body" noStyle>
                    <TextArea rows={10} placeholder='{"key": "value"}' style={{ fontFamily: 'monospace' }} />
                  </Form.Item>
                )
              },
              {
                key: 'headers',
                label: 'Headers',
                children: (
                  <Form.Item name="headers" noStyle>
                    <TextArea rows={10} placeholder='{"Content-Type": "application/json"}' style={{ fontFamily: 'monospace' }} />
                  </Form.Item>
                )
              }
            ]} />
          </Form>
        </Card>
      </div>

      <div style={{ flex: 1 }}>
        <Card title="响应结果" size="small" style={{ height: '100%' }} bodyStyle={{ height: 'calc(100% - 57px)', overflow: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', marginTop: 50 }}>
              <Spin tip="发送请求中..." />
            </div>
          ) : response ? (
            <div>
              <div style={{ marginBottom: 16 }}>
                <Tag color={response.status_code >= 200 && response.status_code < 300 ? 'green' : 'red'}>
                  Status: {response.status_code}
                </Tag>
                <Tag>Time: {(response.duration * 1000).toFixed(0)}ms</Tag>
              </div>
              
              {response.error && (
                <Alert message={response.error} type="error" style={{ marginBottom: 16 }} />
              )}

              <Tabs defaultActiveKey="body" items={[
                {
                  key: 'body',
                  label: 'Body',
                  children: (
                    <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4, overflow: 'auto', maxHeight: 400 }}>
                      {typeof response.body === 'object' ? JSON.stringify(response.body, null, 2) : response.body}
                    </pre>
                  )
                },
                {
                  key: 'headers',
                  label: 'Headers',
                  children: (
                    <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
                      {JSON.stringify(response.headers, null, 2)}
                    </pre>
                  )
                }
              ]} />
            </div>
          ) : (
            <div style={{ textAlign: 'center', marginTop: 100, color: '#999' }}>
              暂无响应数据
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default DebugRunner;
