
export const APP_CONFIG = {
  name: 'RelayPoint',
  version: '1.0.0',
  description: 'Automation platform for connecting services and workflows',

  api: {
    baseURL: import.meta.env.VITE_APP_API_BASE_URL || import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: Number(import.meta.env.VITE_API_TIMEOUT || 30000),
    retryAttempts: Number(import.meta.env.VITE_API_RETRY_ATTEMPTS || 3)
  },

  ui: {
    theme: {
      primaryColor: '#1890ff',
      borderRadius: 6,
      fontSize: 14
    },
    layout: {
      headerHeight: 64,
      sidebarWidth: 200,
      contentPadding: 24
    },
    pagination: {
      pageSize: 10,
      showSizeChanger: true,
      showQuickJumper: true
    }
  },

  features: {
    googleAuth: true,
    notifications: true
  },

  routes: {
    public: ['/login', '/register', '/forgot-password'],
    protected: ['/profile', '/dashboard', '/relays']
  },

  messages: {
    errors: {
      networkError: 'Network error. Please check your connection.',
      unauthorized: 'You are not authorized to perform this action.'
    },
    success: {
      profileUpdated: 'Profile updated successfully',
      passwordChanged: 'Password changed successfully'
    }
  },

  validation: {
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    password: {
      required: true,
      minLength: 6,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/
    },
    name: {
      required: true,
      minLength: 2,
      maxLength: 50
    }
  }
};


export const getConfig = () => {
  return APP_CONFIG;
};

export default getConfig();