import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Input,
  Space,
  Typography,
  Tag,
  message,
  Modal,
  Form,
  Divider,
  Alert,
} from "antd";
import {
  CopyOutlined,
  ThunderboltOutlined,
  LinkOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import request from "../request/request.js";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const WebhookManager = ({ relayId, relayName }) => {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [triggerId, setTriggerId] = useState("");
  const [triggerInfo, setTriggerInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testModalVisible, setTestModalVisible] = useState(false);
  const [testForm] = Form.useForm();

  useEffect(() => {
    if (relayId) {
      generateWebhookUrl();
    }
  }, [relayId]);

  const generateWebhookUrl = async () => {
    setLoading(true);
    try {
      const response = await request.webhook.generateUrl(relayId);
      if (response.success) {
        setWebhookUrl(response.data.webhookUrl);
        setTriggerId(response.data.triggerId);
        fetchTriggerInfo(response.data.triggerId);
      }
    } catch (error) {
      message.error("Failed to generate webhook URL");
    } finally {
      setLoading(false);
    }
  };

  const fetchTriggerInfo = async (triggerId) => {
    if (!triggerId) return;

    try {
      const response = await request.webhook.getTriggerInfo(triggerId);
      if (response.success) {
        setTriggerInfo(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch trigger info:", error);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      message.success("Copied to clipboard!");
    });
  };

  const handleTestWebhook = async (values) => {
    try {
      const response = await request.webhook.testTrigger(triggerId, values);
      if (response.success) {
        message.success("Webhook test completed successfully");
        setTestModalVisible(false);
        testForm.resetFields();
      }
    } catch (error) {
      message.error("Webhook test failed");
    }
  };

  const getWebhookMethod = () => {
    return "POST";
  };

  const getWebhookHeaders = () => {
    return {
      "Content-Type": "application/json",
      "User-Agent": "YourApp/1.0",
    };
  };

  const getWebhookExample = () => {
    return {
      event: "test",
      data: {
        message: "Hello from webhook!",
        timestamp: new Date().toISOString(),
      },
    };
  };

  if (!relayId) {
    return (
      <Card>
        <Alert
          message="No Relay Selected"
          description="Please select a relay to manage webhooks."
          type="info"
          showIcon
        />
      </Card>
    );
  }

  return (
    <div>
      <Card title="Webhook Configuration" style={{ marginBottom: "16px" }}>
        <Space direction="vertical" style={{ width: "100%" }}>
          <div>
            <Text strong>Webhook URL:</Text>
            <div style={{ marginTop: "8px" }}>
              <Input
                value={webhookUrl}
                readOnly
                addonAfter={
                  <Button
                    icon={<CopyOutlined />}
                    onClick={() => copyToClipboard(webhookUrl)}
                  >
                    Copy
                  </Button>
                }
              />
            </div>
          </div>

          <div>
            <Text strong>HTTP Method:</Text>
            <Tag color="blue" style={{ marginLeft: "8px" }}>
              {getWebhookMethod()}
            </Tag>
          </div>

          <div>
            <Text strong>Headers:</Text>
            <div style={{ marginTop: "8px" }}>
              <pre
                style={{
                  background: "#f5f5f5",
                  padding: "8px",
                  borderRadius: "4px",
                  fontSize: "12px",
                }}
              >
                {JSON.stringify(getWebhookHeaders(), null, 2)}
              </pre>
            </div>
          </div>

          <div>
            <Text strong>Example Payload:</Text>
            <div style={{ marginTop: "8px" }}>
              <pre
                style={{
                  background: "#f5f5f5",
                  padding: "8px",
                  borderRadius: "4px",
                  fontSize: "12px",
                }}
              >
                {JSON.stringify(getWebhookExample(), null, 2)}
              </pre>
            </div>
          </div>

          <Space>
            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              onClick={() => setTestModalVisible(true)}
              loading={loading}
            >
              Test Webhook
            </Button>
            <Button
              icon={<LinkOutlined />}
              onClick={generateWebhookUrl}
              loading={loading}
            >
              Regenerate URL
            </Button>
          </Space>
        </Space>
      </Card>

      {triggerInfo && (
        <Card title="Webhook Information">
          <Space direction="vertical" style={{ width: "100%" }}>
            <div>
              <Text strong>Relay Name:</Text>
              <Text style={{ marginLeft: "8px" }}>{triggerInfo.relayName}</Text>
            </div>
            <div>
              <Text strong>Status:</Text>
              <Tag
                color={triggerInfo.isActive ? "green" : "red"}
                style={{ marginLeft: "8px" }}
              >
                {triggerInfo.isActive ? "Active" : "Inactive"}
              </Tag>
            </div>
            <div>
              <Text strong>Last Run:</Text>
              <Text style={{ marginLeft: "8px" }}>
                {triggerInfo.lastRunAt
                  ? new Date(triggerInfo.lastRunAt).toLocaleString()
                  : "Never"}
              </Text>
            </div>
            <div>
              <Text strong>Total Runs:</Text>
              <Text style={{ marginLeft: "8px" }}>
                {triggerInfo.runCount || 0}
              </Text>
            </div>
          </Space>
        </Card>
      )}

      {/* Test Webhook Modal */}
      <Modal
        title="Test Webhook"
        open={testModalVisible}
        onCancel={() => {
          setTestModalVisible(false);
          testForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={testForm} layout="vertical" onFinish={handleTestWebhook}>
          <Alert
            message="Test Webhook"
            description="Send a test payload to your webhook to verify it's working correctly."
            type="info"
            style={{ marginBottom: "16px" }}
          />

          <Form.Item
            name="testData"
            label="Test Payload (JSON)"
            rules={[{ required: true, message: "Please enter test data" }]}
          >
            <TextArea
              rows={6}
              placeholder={JSON.stringify(getWebhookExample(), null, 2)}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Send Test
              </Button>
              <Button onClick={() => setTestModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default WebhookManager;
