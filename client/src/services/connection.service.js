import request from "../request/request.js";

const connectionService = {
  getAllConnections: () => request.connection.getAll(),

  getConnection: (connectionId) => request.connection.get(connectionId),

  createConnection: (connectionData) => request.connection.create(connectionData),

  updateConnection: (connectionId, connectionData) => request.connection.update(connectionId, connectionData),

  deleteConnection: (connectionId) => request.connection.delete(connectionId),

  testConnection: (connectionId) => request.connection.test(connectionId),

  initiateGoogleAuth: () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    window.location.href = `${cleanBaseUrl}/connections/google/auth`;
  },

  getGoogleStatus: () => request.googleConnection.getStatus(),

  disconnectGoogle: () => request.googleConnection.disconnect(),

  connectSolanaWallet: (privateKey) => request.solana.connect(privateKey),

  getSolanaStatus: () => request.solana.getStatus(),

  disconnectSolana: () => request.solana.disconnect(),

  testGmailConnection: () => request.gmail.test(),

  testSheetsConnection: () => request.sheets.test(),
};

export default connectionService;
