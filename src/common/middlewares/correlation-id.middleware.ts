import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { ContextService, RequestContext } from "../utils/context.service";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      correlationId?: string;
      userId?: string;
    }
  }
}

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: NextFunction): void {
    const correlationId =
      (request.headers["x-correlation-id"] as string) ||
      (request.headers["x-request-id"] as string) ||
      ContextService.generateCorrelationId();
    const userId =
      (request.headers["x-user-id"] as string) ||
      (request as any).user?.id ||
      undefined;

    request.correlationId = correlationId;
    request.userId = userId;

    response.setHeader("X-Correlation-ID", correlationId);

    const context: RequestContext = {
      correlationId,
      userId,
      userAgent: request.get("user-agent"),
      ip: request.ip,
      method: request.method,
      url: request.originalUrl,
      timestamp: new Date().toISOString(),
    };

    // Run the rest of the request within this context
    ContextService.run(context, () => {
      ContextService.setContext(context);
      next();
    });
  }
}
