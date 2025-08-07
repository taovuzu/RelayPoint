import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Button,
  Tabs,
  Space,
  Tag,
  Statistic,
  Row,
  Col,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  ThunderboltOutlined,
  LinkOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import WebhookManager from "../components/WebhookManager";
import request from "../request/request.js";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const RelayDetails = () => {
  const navigate = useNavigate();
  const { relayId } = useParams();
  const [relay, setRelay] = useState(null);
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (relayId) {
      fetchRelayDetails();
      fetchRelayRuns();
    }
  }, [relayId]);

  const fetchRelayDetails = async () => {
    setLoading(true);
    try {
      const response = await request.relay.get(relayId);
      if (response.success) {
        setRelay(response.data.relay);
      }
    } catch (error) {
      message.error("Failed to fetch relay details");
    } finally {
      setLoading(false);
    }
  };

  const fetchRelayRuns = async () => {
    try {
      const response = await request.relay.getRuns(relayId);
      if (response.success) {
        setRuns(response.data.runs || []);
      }
    } catch (error) {
      console.error("Failed to fetch relay runs:", error);
    }
  };

  const handleToggleRelay = async () => {
    try {
      const response = await request.relay.toggle(relayId);
      if (response.success) {
        message.success(
          `Relay ${
            relay.status === "active" ? "deactivated" : "activated"
          } successfully`
        );
        fetchRelayDetails();
      }
    } catch (error) {
      message.error("Failed to toggle relay");
    }
  };

  const handleTestRelay = async () => {
    try {
      const response = await request.relay.test(relayId);
      if (response.success) {
        message.success("Relay test initiated successfully");
        fetchRelayRuns();
      }
    } catch (error) {
      message.error("Failed to test relay");
    }
  };

  if (!relay) {
    return (
      <div style={{ padding: "24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/dashboard")}
            style={{ marginRight: "16px" }}
          >
            Back to Dashboard
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            Loading...
          </Title>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <div
        style={{ display: "flex", alignItems: "center", marginBottom: "24px" }}
      >
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/dashboard")}
          style={{ marginRight: "16px" }}
        >
          Back to Dashboard
        </Button>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            {relay.name}
          </Title>
          <Text type="secondary">{relay.description}</Text>
        </div>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Status"
              value={relay.active ? "Active" : "Inactive"}
              valueStyle={{ color: relay.active ? "#3f8600" : "#cf1322" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Total Runs" value={relay.runCount || 0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Last Run"
              value={
                relay.lastRunAt
                  ? new Date(relay.lastRunAt).toLocaleDateString()
                  : "Never"
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Trigger Type"
              value={relay.trigger?.triggerId || "Unknown"}
            />
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="webhooks">
        <TabPane
          tab={
            <span>
              <LinkOutlined />
              Webhooks
            </span>
          }
          key="webhooks"
        >
          <WebhookManager relayId={relayId} relayName={relay.name} />
        </TabPane>

        <TabPane
          tab={
            <span>
              <HistoryOutlined />
              Execution History
            </span>
          }
          key="history"
        >
          <Card title="Relay Runs">
            {runs.length === 0 ? (
              <Text type="secondary">
                No runs yet. Test your relay to see execution history.
              </Text>
            ) : (
              <div>
                {runs.map((run) => (
                  <Card
                    key={run._id}
                    size="small"
                    style={{ marginBottom: "8px" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <Text strong>Run #{run._id.slice(-6)}</Text>
                        <br />
                        <Text type="secondary">
                          {new Date(run.createdAt).toLocaleString()}
                        </Text>
                      </div>
                      <Tag
                        color={
                          run.status === "completed"
                            ? "green"
                            : run.status === "failed"
                            ? "red"
                            : "blue"
                        }
                      >
                        {run.status}
                      </Tag>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </TabPane>

        <TabPane
          tab={
            <span>
              <ThunderboltOutlined />
              Actions
            </span>
          }
          key="actions"
        >
          <Card title="Relay Actions">
            <Space>
              <Button
                type="primary"
                onClick={handleTestRelay}
                loading={loading}
              >
                Test Relay
              </Button>
              <Button onClick={handleToggleRelay} loading={loading}>
                {relay.active ? "Deactivate" : "Activate"}
              </Button>
            </Space>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default RelayDetails;
