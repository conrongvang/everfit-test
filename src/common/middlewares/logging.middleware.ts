import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class AppLoggerMiddleware implements NestMiddleware {
  private logger = new Logger("HTTP");

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl: url } = request;
    const userAgent = request.get("user-agent") || "";
    const startTime = Date.now();

    this.logger.log(`Entering method ${method} ${url}`);
    response.on("finish", () => {
      const { statusCode } = response;
      const contentLength = response.get("content-length");
      const endTime = Date.now();
      this.logger.log(
        `Exiting method ${method}(${
          endTime - startTime
        }ms) ${url} ${statusCode} ${contentLength} - ${userAgent} ${ip}`
      );
    });

    next();
  }
}
