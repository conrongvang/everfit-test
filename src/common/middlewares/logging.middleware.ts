import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { AppLoggerService } from "../utils/app-logger.service";

@Injectable()
export class AppLoggerMiddleware implements NestMiddleware {
  private logger = new AppLoggerService("HTTP");

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl: url, body } = request;
    const userAgent = request.get("user-agent") || "";
    const startTime = Date.now();
    const correlationId = request.correlationId;
    const userId = request.userId;

    this.logger.log("REQUEST_START | ", {
      correlationId,
      userId,
      userAgent,
      ip,
      method,
      url,
      body,
    });

    response.on("finish", () => {
      const { statusCode } = response;
      const contentLength = response.get("content-length");
      const responseTime = Date.now() - startTime;
      const logLevel = statusCode >= 400 ? "error" : "log";

      this.logger[logLevel]("REQUEST_END", {
        correlationId,
        userId,
        userAgent,
        ip,
        contentLength,
        responseTime,
        body,
        statusCode,
      });
    });

    next();
  }
}
