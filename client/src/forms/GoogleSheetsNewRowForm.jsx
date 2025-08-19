import React from 'react';
import { Form, Input, InputNumber, Alert } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const GoogleSheetsNewRowForm = ({ value = {}, onChange }) => {
  const triggerChange = (changedValue) => {
    onChange?.({ ...value, ...changedValue });
  };

  return (
    <>
      <Form.Item label="Spreadsheet ID" required>
        <Input
          placeholder="Enter the ID from the Google Sheet URL"
          value={value.spreadsheetId}
          onChange={(e) => triggerChange({ spreadsheetId: e.target.value })}
        />
        <Alert
          message="How to find Spreadsheet ID"
          description="Copy the ID from your Google Sheets URL: https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit"
          type="info"
          showIcon
          style={{ marginTop: 8 }}
        />
      </Form.Item>
      <Form.Item label="Sheet Name" required>
        <Input
          placeholder="e.g., Sheet1"
          value={value.sheetName}
          onChange={(e) => triggerChange({ sheetName: e.target.value })}
        />
      </Form.Item>
      <Form.Item label="Check Every (minutes)" required>
        <InputNumber
          placeholder="5"
          min={1}
          max={60}
          value={value.pollingInterval || 5}
          onChange={(pollingInterval) => triggerChange({ pollingInterval })}
          style={{ width: '100%' }}
        />
        <Alert
          message="Polling Frequency"
          description="How often to check for new rows. More frequent checks use more API quota."
          type="warning"
          showIcon
          style={{ marginTop: 8 }}
        />
      </Form.Item>
    </>
  );
};

export default GoogleSheetsNewRowForm;
