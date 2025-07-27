import React, { useState, useEffect } from 'react';
import {
  Card,
  Avatar,
  Typography,
  Button,
  Form,
  Input,
  Select,
  Switch,
  Divider,
  message,
  Tabs,
  Row,
  Col,
  Space
} from 'antd';
import {
  UserOutlined,
  SettingOutlined,
  EditOutlined,
  SaveOutlined,
  LockOutlined,
  BellOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser } from '@/redux/auth/selectors';

import MainLayout from '@/layout/MainLayout';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const ProfilePage = () => {
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [settingsForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const currentUser = useSelector(selectCurrentUser);
  const dispatch = useDispatch();

  const [userSettings, setUserSettings] = useState({
    theme: 'light',
    language: 'en',
    notifications: {
      email: true,
      push: false,
      marketing: false
    },
    privacy: {
      profileVisible: false,
      analyticsEnabled: true
    }
  });

  useEffect(() => {
    if (currentUser) {
      form.setFieldsValue({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        company: currentUser.company || '',
        role: currentUser.role || ''
      });
    }
  }, [currentUser, form]);

  const handleProfileUpdate = async (values) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      message.success('Profile updated successfully!');
      setEditMode(false);
    } catch (error) {
      message.error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (values) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      message.success('Password changed successfully!');
      passwordForm.resetFields();
    } catch (error) {
      message.error('Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsUpdate = async (values) => {
    setLoading(true);
    try {
      setUserSettings({ ...userSettings, ...values });
      await new Promise((resolve) => setTimeout(resolve, 500));
      message.success('Settings updated successfully!');
    } catch (error) {
      message.error('Failed to update settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const profileTabItems = [
    {
      key: 'profile',
      label: (
        <span className="flex items-center gap-2">
          <UserOutlined />
          Profile
        </span>
      ),
      children: (
        <div className="space-y-6">
          <Card className="card-modern border border-gray-200 rounded-2xl shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative">
                <Avatar
                  size={120}
                  src={currentUser?.avatar}
                  className="ring-4 ring-primary-100 bg-gradient-to-r from-primary-600 to-primary-700"
                  icon={<UserOutlined />}
                />
              </div>
              
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <Title level={3} className="text-gray-900 mb-1">
                      {currentUser?.name || 'User Name'}
                    </Title>
                    <Text className="text-gray-600 text-base">
                      {currentUser?.email || 'user@example.com'}
                    </Text>
                    <div className="flex items-center gap-2 mt-2">
                      <Text className="text-gray-500">Active Account</Text>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      type={editMode ? "default" : "primary"}
                      icon={editMode ? <SaveOutlined /> : <EditOutlined />}
                      onClick={() => setEditMode(!editMode)}
                      className={editMode ? "btn-secondary" : "btn-primary shadow-sm"}
                    >
                      {editMode ? 'Cancel' : 'Edit Profile'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Personal Information" className="card-modern border border-gray-200">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleProfileUpdate}
              disabled={!editMode}
            >
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="name"
                    label="Full Name"
                    rules={[{ required: true, message: 'Please enter your name' }]}
                  >
                    <Input placeholder="Enter your full name" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: 'Please enter your email' },
                      { type: 'email', message: 'Please enter a valid email' }
                    ]}
                  >
                    <Input placeholder="Enter your email" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="phone" label="Phone">
                    <Input placeholder="Enter your phone number" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="company" label="Company">
                    <Input placeholder="Enter your company" />
                  </Form.Item>
                </Col>
              </Row>
              
              {editMode && (
                <div className="flex justify-end gap-3">
                  <Button onClick={() => setEditMode(false)}>
                    Cancel
                  </Button>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Save Changes
                  </Button>
                </div>
              )}
            </Form>
          </Card>
        </div>
      )
    },
    {
      key: 'security',
      label: (
        <span className="flex items-center gap-2">
          <LockOutlined />
          Security
        </span>
      ),
      children: (
        <Card title="Change Password" className="card-modern border border-gray-200">
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={handlePasswordChange}
          >
            <Form.Item
              name="currentPassword"
              label="Current Password"
              rules={[{ required: true, message: 'Please enter current password' }]}
            >
              <Input.Password placeholder="Enter current password" />
            </Form.Item>
            
            <Form.Item
              name="newPassword"
              label="New Password"
              rules={[
                { required: true, message: 'Please enter new password' },
                { min: 6, message: 'Password must be at least 6 characters' }
              ]}
            >
              <Input.Password placeholder="Enter new password" />
            </Form.Item>
            
            <Form.Item
              name="confirmPassword"
              label="Confirm New Password"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: 'Please confirm new password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Passwords do not match'));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Confirm new password" />
            </Form.Item>
            
            <div className="flex justify-end">
              <Button type="primary" htmlType="submit" loading={loading}>
                Change Password
              </Button>
            </div>
          </Form>
        </Card>
      )
    },
    {
      key: 'settings',
      label: (
        <span className="flex items-center gap-2">
          <SettingOutlined />
          Settings
        </span>
      ),
      children: (
        <div className="space-y-6">
          <Card title="Preferences" className="card-modern border border-gray-200">
            <Form
              form={settingsForm}
              layout="vertical"
              onFinish={handleSettingsUpdate}
              initialValues={userSettings}
            >
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="theme" label="Theme">
                    <Select>
                      <Option value="light">Light</Option>
                      <Option value="dark">Dark</Option>
                      <Option value="auto">Auto</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="language" label="Language">
                    <Select>
                      <Option value="en">English</Option>
                      <Option value="es">Spanish</Option>
                      <Option value="fr">French</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              
              <Divider />
              
              <Title level={5}>Notifications</Title>
              <Form.Item name={['notifications', 'email']} valuePropName="checked">
                <Switch /> Email Notifications
              </Form.Item>
              <Form.Item name={['notifications', 'push']} valuePropName="checked">
                <Switch /> Push Notifications
              </Form.Item>
              <Form.Item name={['notifications', 'marketing']} valuePropName="checked">
                <Switch /> Marketing Emails
              </Form.Item>
              
              <Divider />
              
              <Title level={5}>Privacy</Title>
              <Form.Item name={['privacy', 'profileVisible']} valuePropName="checked">
                <Switch /> Make Profile Public
              </Form.Item>
              <Form.Item name={['privacy', 'analyticsEnabled']} valuePropName="checked">
                <Switch /> Enable Analytics
              </Form.Item>
              
              <div className="flex justify-end">
                <Button type="primary" htmlType="submit" loading={loading}>
                  Save Settings
                </Button>
              </div>
            </Form>
          </Card>
        </div>
      )
    }
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Title level={2} className="text-gray-900 mb-2">
              Profile Settings
            </Title>
            <Text className="text-gray-600">
              Manage your account settings and preferences
            </Text>
          </div>
          
          <Tabs
            defaultActiveKey="profile"
            items={profileTabItems}
            className="bg-white rounded-2xl shadow-sm border border-gray-200"
            tabBarStyle={{ padding: '0 24px', margin: 0 }}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;