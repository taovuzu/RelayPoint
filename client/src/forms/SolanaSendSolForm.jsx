import React from 'react';
import { Form, Input, InputNumber, Alert } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const SolanaSendSolForm = ({ value = {}, onChange }) => {
  const triggerChange = (changedValue) => {
    onChange?.({ ...value, ...changedValue });
  };

  return (
    <>
      <Form.Item label="Recipient Address" required>
        <Input
          placeholder="Enter Solana wallet address"
          value={value.recipient}
          onChange={(e) => triggerChange({ recipient: e.target.value })}
        />
        <Alert
          message="Solana Address"
          description="Enter a valid Solana wallet address (base58 encoded)"
          type="info"
          showIcon
          style={{ marginTop: 8 }}
        />
      </Form.Item>
      <Form.Item label="Amount (SOL)" required>
        <InputNumber
          placeholder="0.1"
          min={0.000001}
          step={0.000001}
          precision={6}
          value={value.amount}
          onChange={(amount) => triggerChange({ amount })}
          style={{ width: '100%' }}
        />
        <Alert
          message="Minimum Amount"
          description="Minimum transaction amount is 0.000001 SOL"
          type="warning"
          showIcon
          style={{ marginTop: 8 }}
        />
      </Form.Item>
      <Form.Item label="Memo (optional)">
        <Input
          placeholder="Transaction memo"
          value={value.memo}
          onChange={(e) => triggerChange({ memo: e.target.value })}
        />
      </Form.Item>
    </>
  );
};

export default SolanaSendSolForm;
