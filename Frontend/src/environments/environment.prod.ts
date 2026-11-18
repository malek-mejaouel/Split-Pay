/**
 * Production environment.
 *
 * `useMockData` is `false`: every call goes to the API Gateway.
 */
export const environment = {
  production: true,

  /** Base URL of the API Gateway behind the load balancer / ingress. */
  apiUrl: 'https://api.splitpay.local',

  /** Mock layer disabled in production. */
  useMockData: false,

  mockLatencyMs: 0,

  notificationPollMs: 30000,
} as const;
