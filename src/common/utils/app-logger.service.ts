import { Logger, LoggerService } from "@nestjs/common";
import { ContextService } from "./context.service";

export interface LogMetadata {
  correlationId?: string;
  userId?: string;
  userAgent?: string;
  ip?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  responseTime?: number;
  errorCode?: string;
  stack?: string;
  [key: string]: any;
}

export class AppLoggerService implements LoggerService {
  protected readonly logger: LoggerService;

  constructor(context?: string) {
    this.logger = new Logger(context || AppLoggerService.name).localInstance;
  }

  private formatLogMessage(message: string, metadata?: LogMetadata): string {
    const context = ContextService.getContext();
    const logData = {
      timestamp: new Date().toISOString(),
      correlationId: metadata?.correlationId || context?.correlationId,
      userId: metadata?.userId || context?.userId,
      message,
      ...metadata,
    };

    // Filter out undefined values
    const cleanLogData = Object.fromEntries(
      Object.entries(logData).filter(([_, value]) => value !== undefined)
    );

    return JSON.stringify(cleanLogData);
  }

  // Represent log level as info
  log(message: any, metadata?: LogMetadata): void {
    this.logger.log(this.formatLogMessage(message, metadata));
  }

  error(error: Error | string, metadata?: LogMetadata): void {
    const errorMessage = error instanceof Error ? error.message : error;
    const stack = error instanceof Error ? error.stack : undefined;
    this.logger.error(
      this.formatLogMessage(errorMessage, {
        stack,
        type: "ERROR",
        ...metadata,
      })
    );
  }

  warn(message: any, metadata?: LogMetadata): void {
    this.logger.warn(this.formatLogMessage(message, metadata));
  }

  debug(message: any, metadata?: LogMetadata): void {
    if (this.logger?.debug) {
      this.logger.debug(this.formatLogMessage(message, metadata));
    }
  }

  verbose(message: any, metadata?: LogMetadata): void {
    if (this.logger?.verbose) {
      this.logger.verbose(this.formatLogMessage(message, metadata));
    }
  }
}
