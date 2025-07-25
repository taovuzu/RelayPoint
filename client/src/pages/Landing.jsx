import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsLoggedIn } from "@/redux/auth/selectors";
import { Button, Typography, Card, Row, Col, Space, Statistic } from "antd";
import {
  ThunderboltOutlined,
  RocketOutlined,
  SettingOutlined,
  ApiOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  PlayCircleOutlined,
  StarOutlined,
  UserOutlined,
  BranchesOutlined,
  ClockCircleOutlined,
  SafetyOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

const Landing = () => {
  const navigate = useNavigate();
  const isLoggedIn = useSelector(selectIsLoggedIn);

  const features = [
    {
      icon: (
        <BranchesOutlined className="text-3xl" style={{ color: "#ff4a00" }} />
      ),
      title: "Visual Workflow Builder",
      description:
        "Drag and drop interface to create powerful automations without coding",
      color: "bg-orange-50",
    },
    {
      icon: <ApiOutlined className="text-3xl" style={{ color: "#7b68ee" }} />,
      title: "Webhook Integration",
      description:
        "Connect any service with webhooks and trigger actions automatically",
      color: "bg-purple-50",
    },
    {
      icon: (
        <SettingOutlined className="text-3xl" style={{ color: "#0ea5e9" }} />
      ),
      title: "Smart Actions",
      description:
        "Send emails, process data, and integrate with external services",
      color: "bg-blue-50",
    },
  ];

  const benefits = [
    "No coding required",
    "Visual workflow builder",
    "Real-time execution monitoring",
    "AI-powered suggestions",
    "Secure and reliable",
  ];

  const stats = [
    { value: "5M+", label: "Tasks Automated", change: "+25% this month" },
    { value: "2,000+", label: "Apps Connected", change: "+10 new this week" },
    { value: "50,000+", label: "Hours Saved", change: "+15% efficiency" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-soft border-b border-gray-200/50 sticky top-0 z-50">
        <div className="container">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-medium">
                <ThunderboltOutlined className="text-2xl text-white" />
              </div>
              <span className="text-2xl font-bold gradient-text">
                RelayPoint
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {isLoggedIn ? (
                <Button
                  type="primary"
                  onClick={() => navigate("/dashboard")}
                  className="btn btn-primary btn-lg"
                >
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    type="text"
                    onClick={() => navigate("/login")}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Sign In
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => navigate("/register")}
                    className="btn btn-primary btn-lg"
                  >
                    Get Started Free
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-blue-50"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>

        <div className="container relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            <div className="animate-fade-in-up">
              <h1 className="text-display mb-8">
                Automate your work with{" "}
                <span className="gradient-text">RelayPoint</span>
              </h1>
              <p className="text-lg text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                Connect your favorite apps and services with our intuitive
                visual workflow builder. No coding required - just drag, drop,
                and automate your way to productivity.
              </p>
            </div>

            <div
              className="flex flex-col sm:flex-row gap-6 justify-center mb-16 animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              {isLoggedIn ? (
                <Button
                  type="primary"
                  size="large"
                  onClick={() => navigate("/dashboard")}
                  className="btn btn-primary btn-lg shadow-strong"
                >
                  Open Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    type="primary"
                    size="large"
                    onClick={() => navigate("/register")}
                    className="btn btn-primary btn-lg shadow-strong"
                  >
                    Start Free Trial
                  </Button>
                  <Button
                    size="large"
                    onClick={() => navigate("/login")}
                    className="btn btn-secondary btn-lg"
                  >
                    Watch Demo
                  </Button>
                </>
              )}
            </div>

            {/* Hero Visual */}
            <div
              className="relative animate-fade-in-up"
              style={{ animationDelay: "0.4s" }}
            >
              <div className="relative bg-white rounded-3xl shadow-strong p-8 border border-gray-200/50">
                <div className="bg-gradient-to-br from-orange-100 via-purple-50 to-blue-100 rounded-2xl p-12">
                  <div className="flex items-center justify-center space-x-8">
                    <div className="animate-float">
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-medium">
                        <ThunderboltOutlined className="text-3xl text-white" />
                      </div>
                    </div>
                    <div className="text-4xl text-gray-400">→</div>
                    <div
                      className="animate-float"
                      style={{ animationDelay: "1s" }}
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-medium">
                        <ApiOutlined className="text-3xl text-white" />
                      </div>
                    </div>
                    <div className="text-4xl text-gray-400">→</div>
                    <div
                      className="animate-float"
                      style={{ animationDelay: "2s" }}
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-medium">
                        <CheckCircleOutlined className="text-3xl text-white" />
                      </div>
                    </div>
                  </div>
                  <p className="text-center text-gray-600 mt-8 text-lg">
                    Visual workflow automation made simple
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container">
          <div className="text-center mb-20">
            <h2 className="text-h2 mb-6">Powerful Features</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Everything you need to automate your workflows and boost
              productivity
            </p>
          </div>
          <div className="grid grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="card-body text-center">
                  <div
                    className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 ${feature.color} shadow-medium`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-h4 mb-4">{feature.title}</h3>
                  <p className="text-base text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="container">
          <div className="grid grid-cols-2 gap-16 items-center">
            <div className="animate-slide-in-left">
              <h2 className="text-h2 mb-6">Why Choose RelayPoint?</h2>
              <p className="text-lg text-gray-600 mb-10">
                Join thousands of users who are already saving time with
                automation
              </p>
              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-medium">
                      <CheckCircleOutlined className="text-white text-lg" />
                    </div>
                    <span className="text-base font-medium text-gray-700">
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>
              <Button
                type="primary"
                size="large"
                className="btn btn-primary btn-lg mt-10 shadow-strong"
                onClick={() => navigate("/register")}
                icon={<ArrowRightOutlined />}
              >
                Start Building Now
              </Button>
            </div>
            <div className="text-center animate-slide-in-right">
              <div className="relative">
                <div className="bg-gradient-to-br from-orange-100 via-purple-50 to-blue-100 rounded-3xl p-16 shadow-strong">
                  <div className="animate-float">
                    <ThunderboltOutlined
                      className="text-9xl mb-8"
                      style={{ color: "#ff4a00" }}
                    />
                  </div>
                  <h3 className="text-h3 mb-6">Ready to Automate?</h3>
                  <p className="text-lg text-gray-600 mb-10">
                    Create your first workflow in minutes
                  </p>
                  <Button
                    type="primary"
                    size="large"
                    className="btn btn-primary btn-lg shadow-strong"
                    onClick={() => navigate("/register")}
                  >
                    Get Started
                  </Button>
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-orange-400 rounded-full animate-pulse"></div>
                <div
                  className="absolute -bottom-4 -left-4 w-6 h-6 bg-blue-400 rounded-full animate-pulse"
                  style={{ animationDelay: "1s" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-white">
        <div className="container">
          <div className="text-center mb-20">
            <h2 className="text-h2 mb-6">Join the Automation Revolution</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Trusted by thousands of users worldwide who are already saving
              time and boosting productivity
            </p>
          </div>
          <div className="grid grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="card">
                  <div className="card-body">
                    <div className="text-h1 mb-4 gradient-text">
                      {stat.value}
                    </div>
                    <div className="text-base font-semibold text-gray-700 mb-2">
                      {stat.label}
                    </div>
                    <div className="text-sm text-green-600 font-medium">
                      {stat.change}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/20 rounded-full blur-2xl animate-pulse"></div>
        <div
          className="absolute bottom-10 right-10 w-40 h-40 bg-white/20 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>

        <div className="container relative z-10">
          <div className="text-center text-white">
            <div className="animate-fade-in-up">
              <h2 className="text-h2 mb-8 text-white">
                Ready to Start Automating?
              </h2>
              <p className="text-lg mb-12 text-white/90 max-w-3xl mx-auto leading-relaxed">
                Join thousands of users who are already saving time with
                RelayPoint. Start your automation journey today and transform
                your workflow.
              </p>
              <Button
                type="primary"
                size="large"
                className="btn btn-lg shadow-strong"
                onClick={() => navigate("/register")}
                style={{
                  backgroundColor: "white",
                  color: "#ff4a00",
                  borderColor: "white",
                  fontWeight: "600",
                }}
                icon={<RocketOutlined />}
              >
                Create Your Account
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container">
          <div className="grid grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
                  <ThunderboltOutlined className="text-2xl text-white" />
                </div>
                <span className="text-2xl font-bold">RelayPoint</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Automate your work with powerful visual workflows. Connect apps,
                save time, and boost productivity.
              </p>
            </div>
            <div>
              <h4 className="text-h6 mb-6">Product</h4>
              <div className="space-y-3">
                <div>
                  <a
                    href="#"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Features
                  </a>
                </div>
                <div>
                  <a
                    href="#"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Pricing
                  </a>
                </div>
                <div>
                  <a
                    href="#"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Integrations
                  </a>
                </div>
                <div>
                  <a
                    href="#"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    API
                  </a>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-h6 mb-6">Company</h4>
              <div className="space-y-3">
                <div>
                  <a
                    href="#"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    About
                  </a>
                </div>
                <div>
                  <a
                    href="#"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Blog
                  </a>
                </div>
                <div>
                  <a
                    href="#"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Careers
                  </a>
                </div>
                <div>
                  <a
                    href="#"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Press
                  </a>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-h6 mb-6">Support</h4>
              <div className="space-y-3">
                <div>
                  <a
                    href="#"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Help Center
                  </a>
                </div>
                <div>
                  <a
                    href="#"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Contact
                  </a>
                </div>
                <div>
                  <a
                    href="#"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Status
                  </a>
                </div>
                <div>
                  <a
                    href="#"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Community
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 flex items-center justify-between">
            <p className="text-sm text-gray-400">
              © 2024 RelayPoint. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <a
                href="#"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Terms
              </a>
              <a
                href="#"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
