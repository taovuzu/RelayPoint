import React, { useEffect } from "react";
import { GoogleOutlined } from "@ant-design/icons";
import { Button, Space } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "@/layout/AuthLayout";
import AuthForm from "@/forms/AuthForm";
import { useDispatch, useSelector } from "react-redux";
import { login } from "@/redux/auth/actions";
import { selectAuthState, selectIsLoggedIn } from "@/redux/auth/selectors";
import * as authService from "@/auth";
import { storePersist } from "@/redux/storePersist";

const LoginPage = () => {
  const { isLoading } = useSelector(selectAuthState);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (values) => {
    const query = new URLSearchParams(location.search);
    const qsRedirect = query.get("redirectTo");
    const stateRedirect = location.state && location.state.from;
    const target = qsRedirect || stateRedirect || "/dashboard";
    const result = await dispatch(login({ loginData: values }));
    if (result.meta.requestStatus === "fulfilled") {
      navigate(target, { replace: true });
    }
  };

  const handleGoogleLogin = () => {
    const query = new URLSearchParams(location.search);
    const qsRedirect = query.get("redirectTo");
    const stateRedirect = location.state && location.state.from;
    const current = qsRedirect || stateRedirect || "/home";
    storePersist.set("postLoginRedirect", current);
    authService.googleLogin();
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your account to continue"
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        <AuthForm type="login" onFinish={handleLogin} loading={isLoading} />
        <Button
          type="default"
          size="large"
          block
          icon={<GoogleOutlined />}
          onClick={handleGoogleLogin}
        >
          Continue with Google
        </Button>
      </Space>
    </AuthLayout>
  );
};

export default LoginPage;
