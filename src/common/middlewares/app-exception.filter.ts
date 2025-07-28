import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Request, Response } from "express";
import { ErrorCode, SYSTEM_ERROR_CODES } from "../constants/error-codes";
import {
  ErrorResponseDto,
  ValidationErrorResponseDto,
} from "../dto/error-response.dto";
import { AppException } from "../exceptions/app-exception";
import { AppLoggerService } from "../utils/app-logger.service";

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  private readonly logger = new AppLoggerService("EXCEPTION");

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: HttpStatus;
    let errorResponse: ErrorResponseDto | ValidationErrorResponseDto;

    if (exception instanceof AppException) {
      status = exception.getStatus();
      errorResponse = {
        statusCode: status,
        errorCode: exception.errorCode,
        message: exception.message,
        details: exception.details,
        timestamp: exception.timestamp,
      };
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (
        typeof exceptionResponse === "object" &&
        "message" in exceptionResponse
      ) {
        const responseObj = exceptionResponse as any;

        // Handle validation errors specifically
        if (
          Array.isArray(responseObj.message) &&
          status === HttpStatus.BAD_REQUEST
        ) {
          errorResponse = this.createValidationErrorResponse(
            responseObj.message
          );
        } else {
          errorResponse = {
            statusCode: status,
            errorCode: this.mapHttpStatusToErrorCode(status) as ErrorCode,
            message: Array.isArray(responseObj.message)
              ? responseObj.message.join(", ")
              : responseObj.message || exception.message,
            timestamp: new Date().toISOString(),
          };
        }
      } else {
        errorResponse = {
          statusCode: status,
          errorCode: this.mapHttpStatusToErrorCode(status) as ErrorCode,
          message: exception.message,
          timestamp: new Date().toISOString(),
        };
      }
    } else {
      // Handle unexpected errors
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      errorResponse = {
        statusCode: status,
        errorCode: SYSTEM_ERROR_CODES.INTERNAL_SERVER_ERROR,
        message: "An unexpected error occurred",
        timestamp: new Date().toISOString(),
      };

      // Log unexpected errors with enhanced logging
      this.logger.error(
        exception instanceof Error ? exception : new Error(String(exception)),
        {
          correlationId: request.correlationId,
          userId: request.userId,
          userAgent: request.get("user-agent"),
          ip: request.ip,
          statusCode: status,
          method: request.method,
          url: request.url,
        }
      );
    }

    if (status >= 500 || !(exception instanceof AppException)) {
      this.logger.error(`HTTP ${status} Error: ${errorResponse.message}`, {
        errorCode: errorResponse.errorCode,
        url: request.url,
        method: request.method,
        correlationId: request.correlationId,
        userId: request.userId,
        userAgent: request.get("user-agent"),
        ip: request.ip,
        statusCode: status,
        type: "HTTP_ERROR",
      });
    }

    response.status(status).json(errorResponse);
  }

  private createValidationErrorResponse(
    validationErrors: any[]
  ): ValidationErrorResponseDto {
    const formattedErrors = validationErrors.map((error) => ({
      field: error.property || "unknown",
      value: error.value,
      constraints: error.constraints || {},
    }));

    return {
      statusCode: HttpStatus.BAD_REQUEST,
      errorCode: "METVL005", // Using missing required field as default validation error
      message: "Validation failed",
      details: {
        validationErrors: formattedErrors,
      },
      timestamp: new Date().toISOString(),
      validationErrors: formattedErrors,
    };
  }

  private mapHttpStatusToErrorCode(status: HttpStatus): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return SYSTEM_ERROR_CODES.INTERNAL_SERVER_ERROR;
      case HttpStatus.UNAUTHORIZED:
        return SYSTEM_ERROR_CODES.UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return SYSTEM_ERROR_CODES.FORBIDDEN;
      case HttpStatus.REQUEST_TIMEOUT:
        return SYSTEM_ERROR_CODES.REQUEST_TIMEOUT;
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return SYSTEM_ERROR_CODES.INTERNAL_SERVER_ERROR;
      case HttpStatus.SERVICE_UNAVAILABLE:
        return SYSTEM_ERROR_CODES.SERVICE_UNAVAILABLE;
      default:
        return SYSTEM_ERROR_CODES.INTERNAL_SERVER_ERROR;
    }
  }
}
