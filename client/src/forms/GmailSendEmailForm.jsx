import React from 'react';
import { Form, Input, Select, InputNumber, Switch, Alert } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const GmailSendEmailForm = ({ value = {}, onChange }) => {
  const triggerChange = (changedValue) => {
    onChange?.({ ...value, ...changedValue });
  };

  return (
    <>
      <Form.Item label="To" required>
        <Input
          placeholder="recipient@example.com"
          value={value.to}
          onChange={(e) => triggerChange({ to: e.target.value })}
        />
      </Form.Item>
      <Form.Item label="Subject" required>
        <Input
          placeholder="Your email subject"
          value={value.subject}
          onChange={(e) => triggerChange({ subject: e.target.value })}
        />
      </Form.Item>
      <Form.Item label="Body" required>
        <Input.TextArea
          rows={4}
          placeholder="Enter your email content here. You can use variables from the trigger, like {{trigger.payload.subject}}."
          value={value.body}
          onChange={(e) => triggerChange({ body: e.target.value })}
        />
      </Form.Item>
      <Form.Item label="HTML Email">
        <Switch
          checked={value.isHtml || false}
          onChange={(checked) => triggerChange({ isHtml: checked })}
        />
        <span style={{ marginLeft: 8 }}>Send as HTML email</span>
      </Form.Item>
    </>
  );
};

export default GmailSendEmailForm;
