import React from 'react';
import { Form, Input, Select, Alert } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const EmailReceivedForm = ({ value = {}, onChange }) => {
  const triggerChange = (changedValue) => {
    onChange?.({ ...value, ...changedValue });
  };

  return (
    <>
      <Form.Item label="Monitor Labels">
        <Select
          mode="multiple"
          placeholder="Select labels to monitor"
          value={value.labelIds || ['INBOX']}
          onChange={(labelIds) => triggerChange({ labelIds })}
          options={[
            { value: 'INBOX', label: 'Inbox' },
            { value: 'UNREAD', label: 'Unread' },
            { value: 'IMPORTANT', label: 'Important' },
            { value: 'STARRED', label: 'Starred' }
          ]}
        />
        <Alert
          message="Email Monitoring"
          description="Select which Gmail labels to monitor for new emails. Default is INBOX."
          type="info"
          showIcon
          style={{ marginTop: 8 }}
        />
      </Form.Item>
    </>
  );
};

export default EmailReceivedForm;
