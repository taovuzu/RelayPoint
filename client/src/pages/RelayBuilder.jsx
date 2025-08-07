import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Typography,
  Space,
  Input,
  Form,
  message,
  Row,
  Col,
  Select,
  Tag,
  Alert,
  Divider,
  Modal,
  Steps,
} from "antd";
import {
  PlusOutlined,
  ThunderboltOutlined,
  SendOutlined,
  LinkOutlined,
  MailOutlined,
  TableOutlined,
  WalletOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  suggestRelay,
  createRelay,
  clearSuggestion,
} from "../redux/relay/actions";
import {
  fetchConnections,
  fetchGoogleStatus,
  fetchSolanaStatus,
} from "../redux/connections/connections.slice";
import {
  AVAILABLE_TRIGGERS,
  AVAILABLE_ACTIONS,
  getTriggerById,
  getActionById,
} from "../config/workflowComponents";

// Import form components
import GmailSendEmailForm from "../forms/GmailSendEmailForm";
import GoogleSheetsAddRowForm from "../forms/GoogleSheetsAddRowForm";
import WebhookPostForm from "../forms/WebhookPostForm";
import SolanaSendSolForm from "../forms/SolanaSendSolForm";
import EmailReceivedForm from "../forms/EmailReceivedForm";
import GoogleSheetsNewRowForm from "../forms/GoogleSheetsNewRowForm";
import ScheduleForm from "../forms/ScheduleForm";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Step } = Steps;

const RelayBuilder = () => {
  const [form] = Form.useForm();
  const [description, setDescription] = useState("");
  const [selectedTrigger, setSelectedTrigger] = useState(null);
  const [selectedActions, setSelectedActions] = useState([]);
  const [triggerConfig, setTriggerConfig] = useState({});
  const [actionConfigs, setActionConfigs] = useState({});
  const [connectionModalVisible, setConnectionModalVisible] = useState(false);
  const [missingConnection, setMissingConnection] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { suggestion, isLoading } = useSelector((state) => state.relay);
  const {
    connections = [],
    googleStatus = { connected: false },
    solanaStatus = { connected: false },
    status: connectionsStatus,
  } = useSelector((state) => state.connections || {});
  const { isLoggedIn } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isLoggedIn && connectionsStatus === "idle") {
      dispatch(fetchConnections());
      dispatch(fetchGoogleStatus());
      dispatch(fetchSolanaStatus());
    }
  }, [isLoggedIn, connectionsStatus, dispatch]);

  const handleSuggest = async () => {
    if (!description.trim()) {
      message.warning("Please enter a description for your relay");
      return;
    }

    try {
      await dispatch(suggestRelay(description)).unwrap();
    } catch (error) {
      message.error("Failed to generate suggestion");
    }
  };

  const handleCreateRelay = async (values) => {
    try {
      const relayData = {
        name: values.name,
        description: values.description,
        trigger: {
          type: selectedTrigger?.id,
          config: triggerConfig,
        },
        actions: selectedActions.map((action, index) => ({
          type: action.id,
          name: action.name,
          order: index + 1,
          config: actionConfigs[action.id] || {},
        })),
      };

      await dispatch(createRelay(relayData)).unwrap();
      message.success("Relay created successfully!");
      form.resetFields();
      setDescription("");
      setSelectedTrigger(null);
      setSelectedActions([]);
      setTriggerConfig({});
      setActionConfigs({});
      dispatch(clearSuggestion());
    } catch (error) {
      message.error("Failed to create relay");
    }
  };

  const handleTriggerChange = (triggerId) => {
    const trigger = getTriggerById(triggerId);
    setSelectedTrigger(trigger);
    setTriggerConfig({});

    if (trigger?.requiresConnection) {
      const hasConnection =
        Array.isArray(connections) &&
        connections.some((conn) => conn.service === trigger.connectionService);
      if (!hasConnection) {
        setMissingConnection(trigger.connectionService);
        setConnectionModalVisible(true);
        return;
      }
    }
  };

  const handleActionAdd = (actionId) => {
    const action = getActionById(actionId);
    if (!action) return;

    if (action.requiresConnection) {
      const hasConnection =
        Array.isArray(connections) &&
        connections.some((conn) => conn.service === action.connectionService);
      if (!hasConnection) {
        setMissingConnection(action.connectionService);
        setConnectionModalVisible(true);
        return;
      }
    }

    if (!selectedActions.find((a) => a.id === actionId)) {
      setSelectedActions([...selectedActions, action]);
      setActionConfigs({ ...actionConfigs, [actionId]: {} });
    }
  };

  const handleActionRemove = (actionId) => {
    setSelectedActions(selectedActions.filter((a) => a.id !== actionId));
    const newConfigs = { ...actionConfigs };
    delete newConfigs[actionId];
    setActionConfigs(newConfigs);
  };

  const handleTriggerConfigChange = (config) => {
    setTriggerConfig(config);
  };

  const handleActionConfigChange = (actionId, config) => {
    setActionConfigs({ ...actionConfigs, [actionId]: config });
  };

  const renderTriggerForm = () => {
    if (!selectedTrigger) return null;

    switch (selectedTrigger.id) {
      case "EMAIL_RECEIVED":
        return (
          <EmailReceivedForm
            value={triggerConfig}
            onChange={handleTriggerConfigChange}
          />
        );
      case "GOOGLE_SHEETS_NEW_ROW":
        return (
          <GoogleSheetsNewRowForm
            value={triggerConfig}
            onChange={handleTriggerConfigChange}
          />
        );
      case "SCHEDULE":
        return (
          <ScheduleForm
            value={triggerConfig}
            onChange={handleTriggerConfigChange}
          />
        );
      default:
        return null;
    }
  };

  const renderActionForm = (action) => {
    switch (action.id) {
      case "SEND_EMAIL_SMTP":
        return (
          <GmailSendEmailForm
            value={actionConfigs[action.id] || {}}
            onChange={(config) => handleActionConfigChange(action.id, config)}
          />
        );
      case "GOOGLE_SHEETS_ADD_ROW":
        return (
          <GoogleSheetsAddRowForm
            value={actionConfigs[action.id] || {}}
            onChange={(config) => handleActionConfigChange(action.id, config)}
          />
        );
      case "WEBHOOK_POST":
        return (
          <WebhookPostForm
            value={actionConfigs[action.id] || {}}
            onChange={(config) => handleActionConfigChange(action.id, config)}
          />
        );
      case "SOLANA_SEND_SOL":
        return (
          <SolanaSendSolForm
            value={actionConfigs[action.id] || {}}
            onChange={(config) => handleActionConfigChange(action.id, config)}
          />
        );
      default:
        return null;
    }
  };

  const getConnectionStatus = (service) => {
    switch (service) {
      case "google":
        return googleStatus?.connected || false;
      case "solana":
        return solanaStatus?.connected || false;
      default:
        return (
          Array.isArray(connections) &&
          connections.some((conn) => conn.service === service)
        );
    }
  };

  if (isLoggedIn && connectionsStatus === "loading") {
    return (
      <div className="text-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <Text className="text-lg text-gray-600">Loading connections...</Text>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="text-center py-16">
        <ThunderboltOutlined className="text-6xl text-primary-600 mb-6" />
        <Title level={2} className="mb-4">
          Create Your First Relay
        </Title>
        <Text className="text-lg text-gray-600 mb-8 block">
          Sign up to start building powerful workflow automations
        </Text>
        <Space size="large">
          <Button
            type="primary"
            size="large"
            onClick={() => navigate("/register")}
            className="bg-primary-600 hover:bg-primary-700"
          >
            Get Started Free
          </Button>
          <Button size="large" onClick={() => navigate("/login")}>
            Sign In
          </Button>
        </Space>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Title level={2}>Relay Builder</Title>
        <Text className="text-gray-600 text-lg">
          Create powerful workflow automations with Gmail, Google Sheets,
          Webhooks, and Solana
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* AI Suggestion Panel */}
        <Col xs={24} lg={12}>
          <Card title="AI Relay Suggester" className="h-full">
            <div className="space-y-4">
              <div>
                <Text className="text-gray-600">
                  Describe what you want your relay to do, and our AI will
                  suggest a configuration.
                </Text>
              </div>

              <TextArea
                rows={4}
                placeholder="e.g., When I receive a webhook from my store, send an email notification to the customer"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mb-4"
              />

              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSuggest}
                loading={isLoading}
                className="w-full bg-primary-600 hover:bg-primary-700"
              >
                Generate Suggestion
              </Button>
            </div>
          </Card>
        </Col>

        {/* Manual Creation Panel */}
        <Col xs={24} lg={12}>
          <Card title="Manual Relay Creation" className="h-full">
            <Form form={form} layout="vertical" onFinish={handleCreateRelay}>
              <Form.Item
                name="name"
                label="Relay Name"
                rules={[{ required: true, message: "Please enter a name" }]}
              >
                <Input placeholder="Enter relay name" />
              </Form.Item>

              <Form.Item name="description" label="Description">
                <TextArea
                  rows={3}
                  placeholder="Describe what this relay does"
                />
              </Form.Item>

              <Form.Item
                name="trigger"
                label="Trigger Type"
                rules={[{ required: true, message: "Please select a trigger" }]}
              >
                <Select
                  placeholder="Select trigger type"
                  onChange={handleTriggerChange}
                >
                  {AVAILABLE_TRIGGERS.map((trigger) => (
                    <Select.Option key={trigger.id} value={trigger.id}>
                      <Space>
                        {trigger.id === "INCOMING_WEBHOOK" && <LinkOutlined />}
                        {trigger.id === "EMAIL_RECEIVED" && <MailOutlined />}
                        {trigger.id === "GOOGLE_SHEETS_NEW_ROW" && (
                          <TableOutlined />
                        )}
                        {trigger.id === "SCHEDULE" && <ClockCircleOutlined />}
                        {trigger.name}
                        {trigger.requiresConnection && (
                          <Tag
                            color={
                              getConnectionStatus(trigger.connectionService)
                                ? "green"
                                : "red"
                            }
                            size="small"
                          >
                            {getConnectionStatus(trigger.connectionService)
                              ? "Connected"
                              : "Not Connected"}
                          </Tag>
                        )}
                      </Space>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              {/* Trigger Configuration */}
              {selectedTrigger && (
                <Card size="small" title={`Configure ${selectedTrigger.name}`}>
                  {renderTriggerForm()}
                </Card>
              )}

              <Divider />

              <Form.Item label="Actions">
                <Select
                  placeholder="Add an action"
                  onSelect={handleActionAdd}
                  style={{ marginBottom: 16 }}
                >
                  {AVAILABLE_ACTIONS.map((action) => (
                    <Select.Option key={action.id} value={action.id}>
                      <Space>
                        {action.id === "WEBHOOK_POST" && <SendOutlined />}
                        {action.id === "SEND_EMAIL_SMTP" && <MailOutlined />}
                        {action.id === "GOOGLE_SHEETS_ADD_ROW" && (
                          <TableOutlined />
                        )}
                        {action.id === "SOLANA_SEND_SOL" && <WalletOutlined />}
                        {action.name}
                        {action.requiresConnection && (
                          <Tag
                            color={
                              getConnectionStatus(action.connectionService)
                                ? "green"
                                : "red"
                            }
                            size="small"
                          >
                            {getConnectionStatus(action.connectionService)
                              ? "Connected"
                              : "Not Connected"}
                          </Tag>
                        )}
                      </Space>
                    </Select.Option>
                  ))}
                </Select>

                {/* Selected Actions */}
                {selectedActions.map((action, index) => (
                  <Card
                    key={action.id}
                    size="small"
                    style={{ marginBottom: 16 }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 16,
                      }}
                    >
                      <Space>
                        {action.id === "WEBHOOK_POST" && <SendOutlined />}
                        {action.id === "SEND_EMAIL_SMTP" && <MailOutlined />}
                        {action.id === "GOOGLE_SHEETS_ADD_ROW" && (
                          <TableOutlined />
                        )}
                        {action.id === "SOLANA_SEND_SOL" && <WalletOutlined />}
                        <Text strong>{action.name}</Text>
                        <Tag color="blue">Step {index + 1}</Tag>
                      </Space>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleActionRemove(action.id)}
                      />
                    </div>
                    {renderActionForm(action)}
                  </Card>
                ))}
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<PlusOutlined />}
                  className="w-full bg-primary-600 hover:bg-primary-700"
                  disabled={!selectedTrigger || selectedActions.length === 0}
                >
                  Create Relay
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>

      {/* Suggestion Display */}
      {suggestion && (
        <Card title="AI Suggestion" className="mt-6">
          <div className="space-y-4">
            <div>
              <Title level={4}>{suggestion.name}</Title>
              <Text className="text-gray-600">{suggestion.description}</Text>
            </div>

            <div>
              <Text strong>Trigger: </Text>
              <Tag color="blue">{suggestion.trigger.type}</Tag>
            </div>

            <div>
              <Text strong>Actions:</Text>
              <div className="mt-2 space-y-2">
                {suggestion.actions?.map((action, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Tag color="green">{action.type}</Tag>
                    <Text>{action.name}</Text>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                type="primary"
                onClick={() => {
                  form.setFieldsValue({
                    name: suggestion.name,
                    description: suggestion.description,
                    trigger: suggestion.trigger.type,
                  });
                  handleTriggerChange(suggestion.trigger.type);
                  // Add suggested actions
                  suggestion.actions?.forEach((action) => {
                    handleActionAdd(action.type);
                  });
                }}
              >
                Use This Suggestion
              </Button>
              <Button onClick={() => dispatch(clearSuggestion())}>
                Dismiss
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Connection Modal */}
      <Modal
        title="Connection Required"
        open={connectionModalVisible}
        onCancel={() => setConnectionModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setConnectionModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="connect"
            type="primary"
            onClick={() => {
              setConnectionModalVisible(false);
              navigate("/dashboard/connections");
            }}
          >
            Go to Connections
          </Button>,
        ]}
      >
        <Alert
          message="Connection Required"
          description={`You need to connect your ${missingConnection} account before using this trigger/action.`}
          type="warning"
          showIcon
        />
      </Modal>
    </div>
  );
};

export default RelayBuilder;
