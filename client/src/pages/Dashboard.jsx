import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Button, Statistic, Typography, Space, Spin, Alert, Switch, Tag, Badge, Progress, Tabs } from 'antd';
import { 
  PlusOutlined, 
  ThunderboltOutlined, 
  PlayCircleOutlined, 
  PauseCircleOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  SettingOutlined,
  BarChartOutlined,
  UserOutlined,
  WalletOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRelays, toggleRelay, deleteRelay } from '../redux/relay/actions';
import SolanaWallet from '../components/SolanaWallet';

const { Title, Text } = Typography;

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { relays, isLoading, error } = useSelector((state) => state.relay);
  const { current: user, isLoggedIn } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchRelays());
  }, [dispatch]);

  const handleToggleRelay = async (relayId, currentStatus) => {
    try {
      await dispatch(toggleRelay(relayId)).unwrap();
    } catch (error) {
      console.error('Failed to toggle relay:', error);
    }
  };

  const handleDeleteRelay = async (relayId) => {
    if (window.confirm('Are you sure you want to delete this relay?')) {
      try {
        await dispatch(deleteRelay(relayId)).unwrap();
      } catch (error) {
        console.error('Failed to delete relay:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'success';
      case 'failed': return 'error';
      case 'running': return 'processing';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'success': return 'Success';
      case 'failed': return 'Failed';
      case 'running': return 'Running';
      case 'pending': return 'Pending';
      default: return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto px-4">
          <ThunderboltOutlined className="text-8xl mb-8" style={{ color: '#ff4a00' }} />
          <h1 className="zapier-heading-1 mb-6">
            Ready to Start Automating?
          </h1>
          <p className="zapier-text-lg mb-8 text-gray-600">
            Create powerful workflow automations with our visual builder
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              type="primary"
              size="large"
              onClick={() => navigate('/register')}
              className="zapier-btn zapier-btn-primary"
              style={{ backgroundColor: '#ff4a00', borderColor: '#ff4a00' }}
            >
              Get Started Free
            </Button>
            <Button 
              size="large"
              onClick={() => navigate('/login')}
              className="zapier-btn zapier-btn-secondary"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-soft border-b border-gray-200/50">
        <div className="container">
          <div className="flex items-center justify-between py-8">
            <div className="animate-fade-in">
              <h1 className="text-h2 mb-2">
                Welcome back, <span className="gradient-text">{user?.fullName || user?.name}</span>!
              </h1>
              <p className="text-base text-gray-600">
                Manage your workflow automations and boost productivity
              </p>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={() => navigate('/relays')}
              className="btn btn-primary btn-lg shadow-strong animate-fade-in"
              style={{ animationDelay: '0.2s' }}
            >
              Create Relay
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="py-12">
        <div className="container">
          <div className="grid grid-cols-4 gap-8">
            <div className="card animate-fade-in-up">
              <div className="card-body text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 mb-6 shadow-medium">
                  <ThunderboltOutlined className="text-3xl text-white" />
                </div>
                <div className="text-h1 mb-3 gradient-text">
                  {relays.length}
                </div>
                <div className="text-base font-semibold text-gray-700 mb-2">Total Relays</div>
                <div className="text-sm text-green-600 font-medium">↑ 12% this month</div>
              </div>
            </div>
            <div className="card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="card-body text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 mb-6 shadow-medium">
                  <PlayCircleOutlined className="text-3xl text-white" />
                </div>
                <div className="text-h1 mb-3 text-green-600">
                  {relays.filter(relay => relay.active).length}
                </div>
                <div className="text-base font-semibold text-gray-700 mb-2">Active Relays</div>
                <div className="text-sm text-green-600 font-medium">↑ 8% this week</div>
              </div>
            </div>
            <div className="card animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="card-body text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 mb-6 shadow-medium">
                  <ReloadOutlined className="text-3xl text-white" />
                </div>
                <div className="text-h1 mb-3 text-blue-600">
                  {relays.reduce((sum, relay) => sum + (relay.runCount || 0), 0)}
                </div>
                <div className="text-base font-semibold text-gray-700 mb-2">Total Runs</div>
                <div className="text-sm text-green-600 font-medium">↑ 25% this month</div>
              </div>
            </div>
            <div className="card animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="card-body text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mb-6 shadow-medium">
                  <BarChartOutlined className="text-3xl text-white" />
                </div>
                <div className="text-h1 mb-3 text-purple-600">
                  {relays.length > 0 ? 
                    Math.round(
                      relays.reduce((sum, relay) => sum + (relay.successCount || 0), 0) / 
                      Math.max(relays.reduce((sum, relay) => sum + (relay.runCount || 0), 0), 1) * 100
                    ) : 0
                  }%
                </div>
                <div className="text-base font-semibold text-gray-700 mb-2">Success Rate</div>
                <div className="text-sm text-green-600 font-medium">↑ 5% this week</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="container mb-8">
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            closable
            className="animate-fade-in"
          />
        </div>
      )}

      {/* Main Content with Tabs */}
      <div className="py-12">
        <div className="container">
          <Tabs
            defaultActiveKey="relays"
            items={[
              {
                key: 'relays',
                label: (
                  <span>
                    <ThunderboltOutlined />
                    Relays
                  </span>
                ),
                children: (
                  <div>
                    <div className="flex items-center justify-between mb-12">
                      <h2 className="text-h3">Your Relays</h2>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate('/relays')}
                        className="btn btn-primary btn-lg shadow-strong"
                      >
                        Create New Relay
                      </Button>
                    </div>
          
          {relays.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-gradient-to-br from-orange-100 via-purple-50 to-blue-100 rounded-3xl p-16 max-w-lg mx-auto shadow-strong animate-scale-in">
                <div className="animate-float">
                  <ThunderboltOutlined className="text-8xl mb-8" style={{ color: '#ff4a00' }} />
                </div>
                <h3 className="text-h3 mb-6">No relays created yet</h3>
                <p className="text-lg text-gray-600 mb-10 leading-relaxed">
                  Create your first automation to get started and boost your productivity
                </p>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  size="large"
                  onClick={() => navigate('/relays')}
                  className="btn btn-primary btn-lg shadow-strong"
                >
                  Create Your First Relay
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-8">
              {relays.map((relay, index) => (
                <div 
                  key={relay._id} 
                  className="card animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="card-body">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-h5">{relay.name}</h3>
                      <Switch
                        checked={relay.active}
                        onChange={() => handleToggleRelay(relay._id, relay.active)}
                        checkedChildren="On"
                        unCheckedChildren="Off"
                        className="shadow-sm"
                      />
                    </div>
                    
                    <div className="space-y-4 mb-8">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 shadow-sm"></div>
                        <span className="text-sm text-gray-600">
                          Trigger: {relay.trigger?.triggerId || relay.trigger?.name || 'Unknown'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 shadow-sm"></div>
                        <span className="text-sm text-gray-600">
                          Actions: {relay.actions?.length || 0}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center space-x-3">
                        {relay.active ? (
                          <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                            <CheckCircleOutlined className="text-white text-sm" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                            <ClockCircleOutlined className="text-gray-500 text-sm" />
                          </div>
                        )}
                        <span className="text-sm font-medium text-gray-700">
                          {relay.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {relay.runCount || 0} runs
                      </span>
                    </div>
                    
                    <div className="flex space-x-3">
                      <Button 
                        type="text" 
                        icon={<EyeOutlined />} 
                        onClick={() => navigate(`/relays/${relay._id}`)}
                        className="flex-1 btn btn-ghost"
                      >
                        View
                      </Button>
                      <Button 
                        type="text" 
                        icon={<EditOutlined />} 
                        onClick={() => navigate(`/relays/${relay._id}`)}
                        className="flex-1 btn btn-ghost"
                      >
                        Edit
                      </Button>
                      <Button 
                        type="text" 
                        icon={<DeleteOutlined />} 
                        danger 
                        onClick={() => handleDeleteRelay(relay._id)}
                        className="flex-1 btn btn-ghost"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
                  </div>
                )
              },
              {
                key: 'wallet',
                label: (
                  <span>
                    <WalletOutlined />
                    Solana Wallet
                  </span>
                ),
                children: <SolanaWallet />
              }
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
