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
  Alert,
  Statistic,
  Divider,
} from "antd";
import {
  WalletOutlined,
  SendOutlined,
  EyeOutlined,
  DisconnectOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import request from "../request/request.js";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const SolanaWallet = () => {
  const [walletStatus, setWalletStatus] = useState({ connected: false });
  const [accountInfo, setAccountInfo] = useState(null);
  const [networkInfo, setNetworkInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [connectModalVisible, setConnectModalVisible] = useState(false);
  const [sendModalVisible, setSendModalVisible] = useState(false);
  const [connectForm] = Form.useForm();
  const [sendForm] = Form.useForm();

  useEffect(() => {
    fetchWalletStatus();
    fetchNetworkInfo();
  }, []);

  const fetchWalletStatus = async () => {
    try {
      const response = await request.solana.getStatus();
      if (response.success) {
        setWalletStatus(response.data);
        if (response.data.connected) {
          fetchAccountInfo();
        }
      }
    } catch (error) {
      console.error("Failed to fetch wallet status:", error);
    }
  };

  const fetchAccountInfo = async () => {
    try {
      const response = await request.solana.getAccountInfo();
      if (response.success) {
        setAccountInfo(response.data.accountInfo);
      }
    } catch (error) {
      console.error("Failed to fetch account info:", error);
    }
  };

  const fetchNetworkInfo = async () => {
    try {
      const response = await request.solana.getNetworkInfo();
      if (response.success) {
        setNetworkInfo(response.data.networkInfo);
      }
    } catch (error) {
      console.error("Failed to fetch network info:", error);
    }
  };

  const handleConnect = async (values) => {
    setLoading(true);
    try {
      const response = await request.solana.connect(values.privateKey);
      if (response.success) {
        message.success("Wallet connected successfully");
        setConnectModalVisible(false);
        connectForm.resetFields();
        fetchWalletStatus();
      }
    } catch (error) {
      message.error("Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      const response = await request.solana.disconnect();
      if (response.success) {
        message.success("Wallet disconnected");
        setWalletStatus({ connected: false });
        setAccountInfo(null);
      }
    } catch (error) {
      message.error("Failed to disconnect wallet");
    } finally {
      setLoading(false);
    }
  };

  const handleSendSol = async (values) => {
    setLoading(true);
    try {
      const response = await request.solana.sendSol(
        values.recipient,
        parseFloat(values.amount)
      );
      if (response.success) {
        message.success("SOL sent successfully");
        setSendModalVisible(false);
        sendForm.resetFields();
        fetchAccountInfo();
      }
    } catch (error) {
      message.error("Failed to send SOL");
    } finally {
      setLoading(false);
    }
  };

  const validateAddress = async (address) => {
    try {
      const response = await request.solana.validateAddress(address);
      return response.success && response.data.isValid;
    } catch (error) {
      return false;
    }
  };

  const formatBalance = (balance) => {
    return parseFloat(balance).toFixed(6);
  };

  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div>
      {/* Wallet Status Card */}
      <Card
        title={
          <Space>
            <WalletOutlined style={{ color: "#9945ff" }} />
            <span>Solana Wallet</span>
            {walletStatus.connected && <Tag color="green">Connected</Tag>}
          </Space>
        }
        style={{ marginBottom: "16px" }}
      >
        {walletStatus.connected ? (
          <Space direction="vertical" style={{ width: "100%" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <Text strong>Public Key:</Text>
                <br />
                <Text code>{formatAddress(accountInfo?.publicKey)}</Text>
              </div>
              <Button
                danger
                icon={<DisconnectOutlined />}
                onClick={handleDisconnect}
                loading={loading}
              >
                Disconnect
              </Button>
            </div>

            <Divider />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
              }}
            >
              <Statistic
                title="Balance"
                value={formatBalance(accountInfo?.balance || 0)}
                suffix="SOL"
                precision={6}
              />
              <Statistic
                title="Lamports"
                value={accountInfo?.lamports || 0}
                formatter={(value) => value.toLocaleString()}
              />
            </div>

            <Space>
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={() => setSendModalVisible(true)}
              >
                Send SOL
              </Button>
              <Button
                icon={<ThunderboltOutlined />}
                onClick={fetchAccountInfo}
                loading={loading}
              >
                Refresh
              </Button>
            </Space>
          </Space>
        ) : (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <WalletOutlined
              style={{ fontSize: "48px", color: "#ccc", marginBottom: "16px" }}
            />
            <Title level={4}>No Wallet Connected</Title>
            <Paragraph type="secondary">
              Connect your Solana wallet to send SOL, check balances, and manage
              transactions.
            </Paragraph>
            <Button
              type="primary"
              icon={<WalletOutlined />}
              onClick={() => setConnectModalVisible(true)}
            >
              Connect Wallet
            </Button>
          </div>
        )}
      </Card>

      {/* Network Information */}
      {networkInfo && (
        <Card title="Network Information" style={{ marginBottom: "16px" }}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <div>
              <Text strong>Network:</Text>
              <Tag color="blue" style={{ marginLeft: "8px" }}>
                {networkInfo.cluster || "Unknown"}
              </Tag>
            </div>
            <div>
              <Text strong>Version:</Text>
              <Text style={{ marginLeft: "8px" }}>{networkInfo.version}</Text>
            </div>
            <div>
              <Text strong>Current Slot:</Text>
              <Text style={{ marginLeft: "8px" }}>
                {networkInfo.currentSlot?.toLocaleString()}
              </Text>
            </div>
          </Space>
        </Card>
      )}

      {/* Connect Wallet Modal */}
      <Modal
        title="Connect Solana Wallet"
        open={connectModalVisible}
        onCancel={() => {
          setConnectModalVisible(false);
          connectForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Alert
          message="Security Notice"
          description="Your private key is encrypted and stored securely. Never share your private key with anyone."
          type="warning"
          style={{ marginBottom: "16px" }}
        />

        <Form form={connectForm} layout="vertical" onFinish={handleConnect}>
          <Form.Item
            name="privateKey"
            label="Private Key"
            rules={[
              { required: true, message: "Please enter your private key" },
              {
                min: 32,
                message: "Private key must be at least 32 characters",
              },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Enter your Solana private key (base64 or hex format)"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Connect Wallet
              </Button>
              <Button onClick={() => setConnectModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Send SOL Modal */}
      <Modal
        title="Send SOL"
        open={sendModalVisible}
        onCancel={() => {
          setSendModalVisible(false);
          sendForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form form={sendForm} layout="vertical" onFinish={handleSendSol}>
          <Form.Item
            name="recipient"
            label="Recipient Address"
            rules={[
              { required: true, message: "Please enter recipient address" },
              {
                validator: async (_, value) => {
                  if (value && !(await validateAddress(value))) {
                    return Promise.reject(new Error("Invalid Solana address"));
                  }
                },
              },
            ]}
          >
            <Input placeholder="Enter Solana address" />
          </Form.Item>

          <Form.Item
            name="amount"
            label="Amount (SOL)"
            rules={[
              { required: true, message: "Please enter amount" },
              {
                pattern: /^\d+(\.\d+)?$/,
                message: "Please enter a valid number",
              },
              {
                validator: (_, value) => {
                  const amount = parseFloat(value);
                  const balance = parseFloat(accountInfo?.balance || 0);
                  if (amount > balance) {
                    return Promise.reject(new Error("Insufficient balance"));
                  }
                  if (amount <= 0) {
                    return Promise.reject(
                      new Error("Amount must be greater than 0")
                    );
                  }
                },
              },
            ]}
          >
            <Input
              type="number"
              step="0.000001"
              placeholder="0.000000"
              addonAfter="SOL"
            />
          </Form.Item>

          <Alert
            message={`Available Balance: ${formatBalance(
              accountInfo?.balance || 0
            )} SOL`}
            type="info"
            style={{ marginBottom: "16px" }}
          />

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Send SOL
              </Button>
              <Button onClick={() => setSendModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SolanaWallet;
