import React from 'react';
import { Form, Input, Select, Alert } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const WebhookPostForm = ({ value = {}, onChange }) => {
  const triggerChange = (changedValue) => {
    onChange?.({ ...value, ...changedValue });
  };

  return (
    <>
      <Form.Item label="Webhook URL" required>
        <Input
          placeholder="https://example.com/webhook"
          value={value.url}
          onChange={(e) => triggerChange({ url: e.target.value })}
        />
      </Form.Item>
      <Form.Item label="HTTP Method" required>
        <Select
          value={value.method || 'POST'}
          onChange={(method) => triggerChange({ method })}
          options={[
            { value: 'POST', label: 'POST' },
            { value: 'PUT', label: 'PUT' },
            { value: 'PATCH', label: 'PATCH' }
          ]}
        />
      </Form.Item>
      <Form.Item label="Headers (JSON)">
        <Input.TextArea
          rows={3}
          placeholder='{"Content-Type": "application/json", "Authorization": "Bearer token"}'
          value={value.headers}
          onChange={(e) => triggerChange({ headers: e.target.value })}
        />
      </Form.Item>
      <Form.Item label="Payload (JSON)" required>
        <Input.TextArea
          rows={4}
          placeholder='{"message": "Hello from RelayPoint!", "data": "{{trigger.payload}}"}'
          value={value.payload}
          onChange={(e) => triggerChange({ payload: e.target.value })}
        />
        <Alert
          message="Dynamic Payload"
          description="Use {{trigger.payload}} to include data from the trigger in your webhook payload"
          type="info"
          showIcon
          style={{ marginTop: 8 }}
        />
      </Form.Item>
    </>
  );
};

export default WebhookPostForm;
