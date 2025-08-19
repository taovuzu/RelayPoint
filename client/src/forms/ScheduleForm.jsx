import React from 'react';
import { Form, Input, Alert } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const ScheduleForm = ({ value = {}, onChange }) => {
  const triggerChange = (changedValue) => {
    onChange?.({ ...value, ...changedValue });
  };

  return (
    <>
      <Form.Item label="Schedule (Cron Expression)" required>
        <Input
          placeholder="0 */5 * * * * (every 5 minutes)"
          value={value.cronExpression}
          onChange={(e) => triggerChange({ cronExpression: e.target.value })}
        />
        <Alert
          message="Cron Expression Examples"
          description={
            <div>
              <div>• <code>0 */5 * * * *</code> - Every 5 minutes</div>
              <div>• <code>0 0 */2 * * *</code> - Every 2 hours</div>
              <div>• <code>0 0 0 * * *</code> - Daily at midnight</div>
              <div>• <code>0 0 0 * * 1</code> - Weekly on Monday</div>
            </div>
          }
          type="info"
          showIcon
          style={{ marginTop: 8 }}
        />
      </Form.Item>
    </>
  );
};

export default ScheduleForm;
