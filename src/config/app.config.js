const APP_CONFIG = {
  APP_NAME: 'Bentork',
  VERSION: '1.0.0',


  CACHE: {
    USER_KEY: 'ev_user_data',
    TOKEN_KEY: 'ev_auth_token',
    CHARGER_KEY: 'ev_charger_data',
    PLAN_KEY: 'ev_plan_data',
    TRANSACTION_KEY: 'ev_user_transaction_data',
    SESSION_KEY: 'ev_session_data',
    ONBOARDING_KEY: 'ev_onboarding_completed',
    EXPIRY_DAYS: 7,
  },


  SESSION: {
    SESSION_TIMER: 'ev_session_time',
    NOTIFICATION_PREFERENCE: 'ev_notification_preference',
    WARMUP_DURATION: 5000,
    UPDATE_INTERVAL: 5000,
    KWH_UPDATE_INTERVAL: 300000,
    STATUS_POLL_INTERVAL: 45000,
    LOW_TIME_WARNING: 300,
    MAX_RETRY_ATTEMPTS: 3,
    MESSAGE_ROTATE_INTERVAL: 2000,
  },


  TAX: {
    GST_RATE: 0.18, // 18%
  },


  UI: {
    SPLASH_DURATION: 1000,
    TOAST_DURATION: 4000,
  },
}

export default APP_CONFIG