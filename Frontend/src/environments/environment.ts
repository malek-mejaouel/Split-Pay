/**
 * Development environment.
 *
 * The front-end talks to a single entry point: the Spring Cloud API Gateway.
 * It never calls a microservice directly (Account / Wallet / Expense /
 * Settlement / Recurring / Savings / Notification are all reached through the
 * gateway using the prefixes declared in `core/constants/api-endpoints.ts`).
 */
export const environment = {
  production: false,

  /** Base URL of the API Gateway (Eureka-registered `api-gateway`). */
  apiUrl: 'http://localhost:8080',

  /**
   * When `true`, every `*ApiService` returns data from the local mock layer
   * (`src/app/mock`) instead of performing HTTP calls. Flip it to `false` once
   * the backend services are up — no component code has to change.
   */
  useMockData: true,

  /** Artificial latency (ms) applied to mocked responses, to exercise skeletons. */
  mockLatencyMs: 350,

  /** Polling interval for notifications while no WebSocket/SSE is available. */
  notificationPollMs: 30000,
} as const;
