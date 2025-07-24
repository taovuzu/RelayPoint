import React from "react";
import { Menu } from "antd";
import {
  DashboardOutlined,
  ThunderboltOutlined,
  LinkOutlined,
  UserOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";

const SideBar = ({ form }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/relays",
      icon: <ThunderboltOutlined />,
      label: "Relays",
    },
    {
      key: "/dashboard/connections",
      icon: <LinkOutlined />,
      label: "Connections",
    },
    {
      key: "/dashboard/profile",
      icon: <UserOutlined />,
      label: "Profile",
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  return (
    <div
      style={{
        width: 250,
        minHeight: "100vh",
        backgroundColor: "#fff",
        borderRight: "1px solid #f0f0f0",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {form ? (
        <div style={{ flex: 1 }}>{form}</div>
      ) : (
        <div style={{ padding: "16px" }}>
          <div style={{ marginBottom: "16px" }}>
            <h3 style={{ margin: 0, color: "#1890ff" }}>RelayPoint</h3>
            <p style={{ margin: "4px 0 0 0", color: "#666", fontSize: "12px" }}>
              Automation Platform
            </p>
          </div>

          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            onClick={handleMenuClick}
            items={menuItems}
            style={{ border: "none" }}
          />
        </div>
      )}
    </div>
  );
};

export default React.memo(SideBar);
