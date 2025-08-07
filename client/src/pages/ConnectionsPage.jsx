import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Table,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Typography,
  Divider,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ThunderboltOutlined,
  GoogleOutlined,
  WalletOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import {
  fetchConnections,
  deleteConnection,
  testConnection,
  fetchGoogleStatus,
  fetchSolanaStatus,
} from "../redux/connections/connections.slice";
import connectionService from "../services/connection.service.js";

const { Title, Text } = Typography;
const { Option } = Select;

const ConnectionsPage = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingConnection, setEditingConnection] = useState(null);
  const [form] = Form.useForm();
  const location = useLocation();

  const dispatch = useDispatch();
  const {
    connections = [],
    googleStatus = { connected: false },
    solanaStatus = { connected: false },
    status,
  } = useSelector((state) => state.connections || {});

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchConnections());
      dispatch(fetchGoogleStatus());
      dispatch(fetchSolanaStatus());
    }
  }, [status, dispatch]);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const oauthStatus = query.get("status");
    const error = query.get("error");
    const connectionId = query.get("connectionId");
    const email = query.get("email");

    if (oauthStatus === "success") {
      message.success(
        `Google account connected successfully! Email: ${email || "Unknown"}`
      );
      dispatch(fetchGoogleStatus());
      dispatch(fetchConnections());
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (oauthStatus === "error") {
      const errorMessage = error
        ? decodeURIComponent(error)
        : "Unknown error occurred";
      message.error(`Google connection failed: ${errorMessage}`);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (oauthStatus === "connected") {
      message.info("Google account is already connected");
      dispatch(fetchGoogleStatus());
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location.search, dispatch]);

  if (status === "loading") {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <div style={{ marginBottom: "16px" }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
        <Text className="text-lg text-gray-600">Loading connections...</Text>
      </div>
    );
  }

  const handleCreateConnection = async (values) => {
    try {
      const response = await connectionService.createConnection(values);
      if (response.success) {
        message.success("Connection created successfully");
        setModalVisible(false);
        form.resetFields();
        dispatch(fetchConnections());
      }
    } catch (error) {
      message.error("Failed to create connection");
    }
  };

  const handleUpdateConnection = async (values) => {
    try {
      const response = await connectionService.updateConnection(
        editingConnection._id,
        values
      );
      if (response.success) {
        message.success("Connection updated successfully");
        setModalVisible(false);
        setEditingConnection(null);
        form.resetFields();
        dispatch(fetchConnections());
      }
    } catch (error) {
      message.error("Failed to update connection");
    }
  };

  const handleDeleteConnection = async (connectionId) => {
    try {
      await dispatch(deleteConnection(connectionId)).unwrap();
      message.success("Connection deleted successfully");
    } catch (error) {
      message.error("Failed to delete connection");
    }
  };

  const handleTestConnection = async (connectionId) => {
    try {
      await dispatch(testConnection(connectionId)).unwrap();
      message.success("Connection test successful");
    } catch (error) {
      message.error("Connection test failed");
    }
  };

  const handleGoogleAuth = () => {
    connectionService.initiateGoogleAuth();
  };

  const handleGoogleDisconnect = async () => {
    try {
      await connectionService.disconnectGoogle();
      message.success("Google account disconnected");
      dispatch(fetchGoogleStatus());
      dispatch(fetchConnections());
    } catch (error) {
      message.error("Failed to disconnect Google account");
    }
  };

  const handleSolanaConnect = () => {
    Modal.confirm({
      title: "Connect Solana Wallet",
      content: (
        <div>
          <p>Enter your Solana private key to connect your wallet:</p>
          <Input.Password
            placeholder="Enter private key (base64 or hex format)"
            id="solana-private-key"
          />
        </div>
      ),
      onOk: async () => {
        const privateKey = document.getElementById("solana-private-key").value;
        if (!privateKey) {
          message.error("Private key is required");
          return;
        }

        try {
          await connectionService.connectSolanaWallet(privateKey);
          message.success("Solana wallet connected successfully");
          dispatch(fetchSolanaStatus());
        } catch (error) {
          message.error("Failed to connect Solana wallet");
        }
      },
    });
  };

  const handleSolanaDisconnect = async () => {
    try {
      await connectionService.disconnectSolana();
      message.success("Solana wallet disconnected");
      dispatch(fetchSolanaStatus());
    } catch (error) {
      message.error("Failed to disconnect Solana wallet");
    }
  };

  const columns = [
    {
      title: "Service",
      dataIndex: "service",
      key: "service",
      render: (service) => (
        <Tag color="blue" icon={<LinkOutlined />}>
          {service}
        </Tag>
      ),
    },
    {
      title: "Account",
      dataIndex: "accountIdentifier",
      key: "accountIdentifier",
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Last Used",
      dataIndex: "lastUsedAt",
      key: "lastUsedAt",
      render: (date) => (date ? new Date(date).toLocaleDateString() : "Never"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<ThunderboltOutlined />}
            onClick={() => handleTestConnection(record._id)}
          >
            Test
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingConnection(record);
              form.setFieldsValue(record);
              setModalVisible(true);
            }}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this connection?"
            onConfirm={() => handleDeleteConnection(record._id)}
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <div
        style={{
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Title level={2}>Connections</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingConnection(null);
            form.resetFields();
            setModalVisible(true);
          }}
        >
          Add Connection
        </Button>
      </div>

      {/* Google Integration */}
      <Card style={{ marginBottom: "24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <Title level={4} style={{ margin: 0 }}>
              <GoogleOutlined
                style={{ marginRight: "8px", color: "#4285f4" }}
              />
              Google Workspace
            </Title>
            <Text type="secondary">
              Connect your Google account for Gmail and Sheets integration
            </Text>
          </div>
          <div>
            {googleStatus?.connected ? (
              <Space>
                <Tag color="green">Connected</Tag>
                <Button onClick={handleGoogleDisconnect}>Disconnect</Button>
              </Space>
            ) : (
              <Button type="primary" onClick={handleGoogleAuth}>
                Connect Google
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Solana Integration */}
      <Card style={{ marginBottom: "24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <Title level={4} style={{ margin: 0 }}>
              <WalletOutlined
                style={{ marginRight: "8px", color: "#9945ff" }}
              />
              Solana Wallet
            </Title>
            <Text type="secondary">
              Connect your Solana wallet for blockchain operations
            </Text>
          </div>
          <div>
            {solanaStatus?.connected ? (
              <Space>
                <Tag color="green">Connected</Tag>
                <Button onClick={handleSolanaDisconnect}>Disconnect</Button>
              </Space>
            ) : (
              <Button type="primary" onClick={handleSolanaConnect}>
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Custom Connections */}
      <Card>
        <Title level={4}>Custom Connections</Title>
        <Table
          columns={columns}
          dataSource={connections}
          loading={status === "loading"}
          rowKey="_id"
          pagination={false}
        />
      </Card>

      {/* Connection Modal */}
      <Modal
        title={editingConnection ? "Edit Connection" : "Add Connection"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingConnection(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={
            editingConnection ? handleUpdateConnection : handleCreateConnection
          }
        >
          <Form.Item
            name="service"
            label="Service"
            rules={[{ required: true, message: "Please select a service" }]}
          >
            <Select placeholder="Select service">
              <Option value="test-service">Test Service</Option>
              <Option value="custom-api">Custom API</Option>
              <Option value="webhook">Webhook</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="accountIdentifier"
            label="Account Identifier"
            rules={[
              { required: true, message: "Please enter account identifier" },
            ]}
          >
            <Input placeholder="e.g., user@example.com" />
          </Form.Item>

          <Form.Item
            name="credentials"
            label="Credentials (JSON)"
            rules={[{ required: true, message: "Please enter credentials" }]}
          >
            <Input.TextArea
              placeholder='{"apiKey": "your-key", "secret": "your-secret"}'
              rows={3}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingConnection ? "Update" : "Create"}
              </Button>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ConnectionsPage;
