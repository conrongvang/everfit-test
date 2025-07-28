import { HttpException, HttpStatus } from "@nestjs/common";
import { ERROR_MESSAGES, ErrorCode } from "../constants/error-codes";

export interface AppExceptionOptions {
  errorCode: ErrorCode;
  message?: string;
  details?: any;
  cause?: Error;
}

export class AppException extends HttpException {
  public readonly errorCode: ErrorCode;
  public readonly details?: any;
  public readonly timestamp: string;

  constructor(status: HttpStatus, options: AppExceptionOptions) {
    const message = options.message || ERROR_MESSAGES[options.errorCode];

    super(
      {
        statusCode: status,
        errorCode: options.errorCode,
        message,
        details: options.details,
        timestamp: new Date().toISOString(),
      },
      status,
      { cause: options.cause }
    );

    this.errorCode = options.errorCode;
    this.details = options.details;
    this.timestamp = new Date().toISOString();
  }
}

// Specific exception classes for different HTTP status codes
export class BadRequestAppException extends AppException {
  constructor(options: AppExceptionOptions) {
    super(HttpStatus.BAD_REQUEST, options);
  }
}

export class UnauthorizedAppException extends AppException {
  constructor(options: AppExceptionOptions) {
    super(HttpStatus.UNAUTHORIZED, options);
  }
}

export class ForbiddenAppException extends AppException {
  constructor(options: AppExceptionOptions) {
    super(HttpStatus.FORBIDDEN, options);
  }
}

export class NotFoundAppException extends AppException {
  constructor(options: AppExceptionOptions) {
    super(HttpStatus.NOT_FOUND, options);
  }
}

export class ConflictAppException extends AppException {
  constructor(options: AppExceptionOptions) {
    super(HttpStatus.CONFLICT, options);
  }
}

export class InternalServerAppException extends AppException {
  constructor(options: AppExceptionOptions) {
    super(HttpStatus.INTERNAL_SERVER_ERROR, options);
  }
}

export class ServiceUnavailableAppException extends AppException {
  constructor(options: AppExceptionOptions) {
    super(HttpStatus.SERVICE_UNAVAILABLE, options);
  }
}

export class RequestTimeoutAppException extends AppException {
  constructor(options: AppExceptionOptions) {
    super(HttpStatus.REQUEST_TIMEOUT, options);
  }
}
