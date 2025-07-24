import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Layout as AntLayout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Space,
  Typography,
} from "antd";
import {
  DashboardOutlined,
  ThunderboltOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/auth/actions";

const { Header, Sider, Content } = AntLayout;
const { Text } = Typography;

const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { current: user, isLoggedIn } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
      onClick: () => navigate("/profile"),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: handleLogout,
    },
  ];

  const menuItems = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
      onClick: () => navigate("/dashboard"),
    },
    {
      key: "/relays",
      icon: <ThunderboltOutlined />,
      label: "Relays",
      onClick: () => navigate("/relays"),
    },
  ];

  return (
    <AntLayout className="min-h-screen">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="bg-white shadow-sm"
        width={250}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <ThunderboltOutlined className="text-2xl text-primary-600" />
            {!collapsed && (
              <Text strong className="text-lg text-gray-800">
                RelayPoint
              </Text>
            )}
          </div>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          className="border-r-0"
        />
      </Sider>

      <AntLayout>
        <Header className="bg-white shadow-sm px-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="text-gray-600"
            />

            {location.pathname === "/relays" && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate("/relays")}
                className="bg-primary-600 hover:bg-primary-700"
              >
                New Relay
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <Text className="text-gray-600">
                  Welcome, {user?.fullName || user?.name}
                </Text>

                <Dropdown
                  menu={{ items: userMenuItems }}
                  placement="bottomRight"
                  arrow
                >
                  <Avatar
                    icon={<UserOutlined />}
                    className="cursor-pointer hover:bg-primary-50"
                  />
                </Dropdown>
              </>
            ) : (
              <Space>
                <Button onClick={() => navigate("/login")}>Sign In</Button>
                <Button
                  type="primary"
                  onClick={() => navigate("/register")}
                  className="bg-primary-600 hover:bg-primary-700"
                >
                  Get Started
                </Button>
              </Space>
            )}
          </div>
        </Header>

        <Content className="p-6 bg-gray-50">
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
