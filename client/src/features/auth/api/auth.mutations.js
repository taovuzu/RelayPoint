import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";

import { login, logout, updateProfile, registerEmail, registerUser, verifyEmailByLink, verifyEmailByOTP, resendVerification, requestPasswordReset, refreshAccessToken, getCurrentUser, changeCurrentPassword, resetPasswordWithToken, googleLogin, clearEmailRegistrationStep } from '@/redux/auth';

export function useLogin() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const mutate = async (credentials) => {
    setIsLoading(true);
    setError(null);
    try {
      await dispatch(login(credentials)).unwrap();
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      setError(err);
      toast.error(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error };
}

export function useLogout() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const mutate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await dispatch(logout()).unwrap();
      toast.success('Successfully logged out');
      navigate('/login');
    } catch (err) {
      setError(err);
      toast.error(err.message || 'Logout failed');
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error };
}

export function useRegisterEmail() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const mutate = async (email) => {
    setIsLoading(true);
    setError(null);
    try {
      await dispatch(registerEmail(email)).unwrap();
      toast.success('Email registered! Please verify to continue.');
    } catch (err) {
      setError(err);
      toast.error(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error };
}

export function useVerifyOTP() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const mutate = async (params) => {
    setIsLoading(true);
    setError(null);
    try {
      await dispatch(verifyEmailByOTP(params)).unwrap();
      toast.success('Email verified successfully!');
    } catch (err) {
      setError(err);
      toast.error(err.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error };
}

export function useRegisterUser() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const mutate = async (params) => {
    setIsLoading(true);
    setError(null);
    try {
      await dispatch(registerUser(params)).unwrap();
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      setError(err);
      toast.error(err.message || 'Account creation failed');
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error };
}

export function useForgotPassword() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = async (email) => {
    setIsLoading(true);
    setError(null);
    try {
      await dispatch(requestPasswordReset({ email })).unwrap();
    } catch (err) {
      setError(err);
      toast.error(err.message || 'Failed to request password reset');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error };
}
export function useResetPassword() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const mutate = async (newPassword) => {
    setIsLoading(true);
    setError(null);
    try {
      await dispatch(resetPasswordWithToken(newPassword)).unwrap();
      toast.success('Password updated successfully! Please log in.');
      navigate('/login');
    } catch (err) {
      setError(err);
      toast.error(err.message || 'Failed to reset password');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error };
}



// Note:By appending .unwrap(), we explicitly tell Redux Toolkit: "If the result action is of type /rejected, strip away the Redux action wrapper and throw the raw payload as a real JavaScript error so my catch block mechanism can execute."

// ref: https://stackoverflow.com/questions/75804042/what-is-dispatch-unwrap-in-redux-toolkit
// ref: https://redux-toolkit.js.org/api/createAsyncThunk#unwrapping-result-actions
// ref: https://ui.shadcn.com/docs/components/radix/sonner
