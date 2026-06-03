const API_CONFIG = {

  BASE_URL: import.meta.env.VITE_API_BASE_URL,

  EMAIL_CONFIG: {
    SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID,
    TEMPLATE_ID: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
    PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
  },

  ENDPOINTS: {
    // LOGIN: '/api/user/login',
    LOGIN: '/api/user/google-login-success',
    TRUECALLER_STATUS: (requestId) => `/api/user/truecaller/status/${requestId}`,
    // VERIFY_TOKEN: '/user/verify',
    // REFRESH_TOKEN: '/user/refresh',
    GET_USER_BY_EMAIL: (email) => `/api/user/byemail/${email}`,


    GET_ALL_USER_TRANSACTIONS: (id) => `/api/wallet/history/${id}`,
    GET_USER_TRANSACTION: (id) => `/api/wallet/history/${id}`,


    GET_CHARGER: (ocppId) => `/api/user/charger/ocpp/${ocppId}`,
    // encodeURIComponent(ocppId)


    GET_ALL_PLANS: '/api/user-plan-selection/available',
    GET_PLAN_BY_ID: (id) => `/api/user-plan-selection/${id}`,
    SELECT_PLAN: '/api/user-plan-selection/select',

    START_SESSION: '/api/sessions/start',
    STOP_SESSION: '/api/sessions/stop',
    GET_ENERGY_USED: (sessionId) => `/api/sessions/${sessionId}/energy`,
    GET_SESSION_STATUS: (sessionId) => `/api/sessions/${sessionId}/status`,
    GET_ALL_SESSIONS: '/api/sessions/all/records',
    // GET_KWH_USED: '/session/kwh/used',


    CREATE_ORDER: '/api/razorpay/create-order',
    VERIFY_PAYMENT: '/api/razorpay/verify-payment',
  },

  TIMEOUT: 30000,

  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
}

// export const WS_CONFIG = {
//   URL: import.meta.env.VITE_WS_URL || 'ws://localhost:8080',
//   RECONNECT_ATTEMPTS: 5,
//   RECONNECT_DELAY: 3000,
// }

// export const GOOGLE_CONFIG = {
//   CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_DEFAULT_CLIENT_ID.apps.googleusercontent.com'
// }

export default API_CONFIG