// Environment configuration
export const config = {
  // API Configuration
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://fsii1pizs1.execute-api.us-east-1.amazonaws.com',
  
  // Environment
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // Feature Flags
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  enableDebugMode: import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true',
  
  // App Configuration
  appName: 'S3 Report Browser',
  appVersion: '1.0.0',
  
  // Cache Configuration
  cacheDuration: 30 * 60 * 1000, // 30 minutes
  
  // API Timeouts
  apiTimeout: 10000, // 10 seconds
  
  // Pagination
  defaultPageSize: 50,
  maxPageSize: 100,
} as const;

// Type-safe environment variables
export type Config = typeof config; 