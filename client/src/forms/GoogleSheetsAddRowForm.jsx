import React from 'react';
import { Form, Input, Alert } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const GoogleSheetsAddRowForm = ({ value = {}, onChange }) => {
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
      <Form.Item label="Row Data (comma-separated)" required>
        <Input
          placeholder="Value1,Value2,Value3"
          value={value.rowData}
          onChange={(e) => triggerChange({ rowData: e.target.value })}
        />
        <Alert
          message="Dynamic Data"
          description="You can use variables from the trigger, e.g., {{trigger.payload.sender}},{{trigger.payload.subject}}"
          type="info"
          showIcon
          style={{ marginTop: 8 }}
        />
      </Form.Item>
    </>
  );
};

export default GoogleSheetsAddRowForm;
