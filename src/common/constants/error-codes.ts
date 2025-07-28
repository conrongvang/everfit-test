/**
 * Error code format: [DOMAIN][ERROR_TYPE][SPECIFIC_CODE]
 *
 * Format explanation:
 * - 3 letters for domain (e.g., USR for User, MET for Metrics, SYS for System)
 * - 2 letters for error type (e.g., VL for Validation, NF for Not Found, AU for Auth)
 * - 3 digits for specific error (e.g., 001, 002, 003)
 *
 * Example: USRVL001 = User Validation Error 001
 */

// System Error Codes (SYSXX000)
export const SYSTEM_ERROR_CODES = {
  // General System Errors (SYSGE000)
  INTERNAL_SERVER_ERROR: "SYSGE001",
  SERVICE_UNAVAILABLE: "SYSGE002",
  REQUEST_TIMEOUT: "SYSGE003",
  DATABASE_CONNECTION_ERROR: "SYSGE004",

  // Authentication Errors (SYSAU000)
  UNAUTHORIZED: "SYSAU001",
  FORBIDDEN: "SYSAU002",
  TOKEN_EXPIRED: "SYSAU003",
  INVALID_TOKEN: "SYSAU004",

  // Rate Limiting (SYSRL000)
  RATE_LIMIT_EXCEEDED: "SYSRL001",
} as const;

// User Error Codes (USRXX000)
export const USER_ERROR_CODES = {
  // User Validation Errors (USRVL000)
  INVALID_USER_ID: "USRVL001",
  INVALID_EMAIL_FORMAT: "USRVL002",
  INVALID_PASSWORD: "USRVL003",

  // User Not Found Errors (USRNF000)
  USER_NOT_FOUND: "USRNF001",

  // User Business Logic Errors (USRBL000)
  USER_ALREADY_EXISTS: "USRBL001",
  USER_INACTIVE: "USRBL002",
} as const;

// Metrics Error Codes (METXX000)
export const METRICS_ERROR_CODES = {
  // Metrics Validation Errors (METVL000)
  INVALID_METRIC_TYPE: "METVL001",
  INVALID_UNIT: "METVL002",
  INVALID_VALUE: "METVL003",
  INVALID_DATE: "METVL004",
  MISSING_REQUIRED_FIELD: "METVL005",

  // Metrics Not Found Errors (METNF000)
  METRIC_NOT_FOUND: "METNF001",
  NO_METRICS_DATA: "METNF002",

  // Metrics Business Logic Errors (METBL000)
  DUPLICATE_METRIC_ENTRY: "METBL001",
  METRIC_DATE_IN_FUTURE: "METBL002",
  METRIC_VALUE_OUT_OF_RANGE: "METBL003",
} as const;

// Health Check Error Codes (HLCXX000)
export const HEALTH_ERROR_CODES = {
  // Health Check Errors (HLCGE000)
  DATABASE_UNHEALTHY: "HLCGE001",
  EXTERNAL_SERVICE_UNHEALTHY: "HLCGE002",
} as const;

// All error codes combined
export const ERROR_CODES = {
  ...SYSTEM_ERROR_CODES,
  ...USER_ERROR_CODES,
  ...METRICS_ERROR_CODES,
  ...HEALTH_ERROR_CODES,
} as const;

// Type definitions
export type SystemErrorCode =
  (typeof SYSTEM_ERROR_CODES)[keyof typeof SYSTEM_ERROR_CODES];
export type UserErrorCode =
  (typeof USER_ERROR_CODES)[keyof typeof USER_ERROR_CODES];
export type MetricsErrorCode =
  (typeof METRICS_ERROR_CODES)[keyof typeof METRICS_ERROR_CODES];
export type HealthErrorCode =
  (typeof HEALTH_ERROR_CODES)[keyof typeof HEALTH_ERROR_CODES];
export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

// Error code to human-readable message mapping
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  // System Errors
  [SYSTEM_ERROR_CODES.INTERNAL_SERVER_ERROR]:
    "An internal server error occurred",
  [SYSTEM_ERROR_CODES.SERVICE_UNAVAILABLE]: "Service is currently unavailable",
  [SYSTEM_ERROR_CODES.REQUEST_TIMEOUT]: "Request timeout exceeded",
  [SYSTEM_ERROR_CODES.DATABASE_CONNECTION_ERROR]: "Database connection failed",
  [SYSTEM_ERROR_CODES.UNAUTHORIZED]: "Authentication required",
  [SYSTEM_ERROR_CODES.FORBIDDEN]: "Access forbidden",
  [SYSTEM_ERROR_CODES.TOKEN_EXPIRED]: "Authentication token has expired",
  [SYSTEM_ERROR_CODES.INVALID_TOKEN]: "Invalid authentication token",
  [SYSTEM_ERROR_CODES.RATE_LIMIT_EXCEEDED]:
    "Rate limit exceeded. Please try again later",

  // User Errors
  [USER_ERROR_CODES.INVALID_USER_ID]: "Invalid user ID provided",
  [USER_ERROR_CODES.INVALID_EMAIL_FORMAT]: "Invalid email format",
  [USER_ERROR_CODES.INVALID_PASSWORD]: "Invalid password format",
  [USER_ERROR_CODES.USER_NOT_FOUND]: "User not found",
  [USER_ERROR_CODES.USER_ALREADY_EXISTS]: "User already exists",
  [USER_ERROR_CODES.USER_INACTIVE]: "User account is inactive",

  // Metrics Errors
  [METRICS_ERROR_CODES.INVALID_METRIC_TYPE]: "Invalid metric type provided",
  [METRICS_ERROR_CODES.INVALID_UNIT]:
    "Invalid unit for the specified metric type",
  [METRICS_ERROR_CODES.INVALID_VALUE]: "Invalid metric value",
  [METRICS_ERROR_CODES.INVALID_DATE]: "Invalid date format",
  [METRICS_ERROR_CODES.MISSING_REQUIRED_FIELD]: "Required field is missing",
  [METRICS_ERROR_CODES.METRIC_NOT_FOUND]: "Metric not found",
  [METRICS_ERROR_CODES.NO_METRICS_DATA]: "No metrics data available",
  [METRICS_ERROR_CODES.DUPLICATE_METRIC_ENTRY]:
    "Duplicate metric entry for the same date",
  [METRICS_ERROR_CODES.METRIC_DATE_IN_FUTURE]:
    "Metric date cannot be in the future",
  [METRICS_ERROR_CODES.METRIC_VALUE_OUT_OF_RANGE]:
    "Metric value is out of acceptable range",

  // Health Check Errors
  [HEALTH_ERROR_CODES.DATABASE_UNHEALTHY]: "Database health check failed",
  [HEALTH_ERROR_CODES.EXTERNAL_SERVICE_UNHEALTHY]:
    "External service health check failed",
};
