import { Injectable } from "@nestjs/common";
import { AsyncLocalStorage } from "async_hooks";

export interface RequestContext {
  correlationId: string;
  userId?: string;
  userAgent?: string;
  ip?: string;
  method?: string;
  url?: string;
  timestamp?: string;
}

@Injectable()
export class ContextService {
  private static asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

  static generateCorrelationId(): string {
    return (
      Math.random().toString(36).substr(2, 9) + "_" + Date.now().toString(36)
    );
  }

  static setContext(context: RequestContext): void {
    this.asyncLocalStorage.enterWith(context);
  }

  static getContext(): RequestContext | undefined {
    return this.asyncLocalStorage.getStore();
  }

  static getCorrelationId(): string | undefined {
    return this.getContext()?.correlationId;
  }

  static getUserId(): string | undefined {
    return this.getContext()?.userId;
  }

  static run<T>(context: RequestContext, callback: () => T): T {
    return this.asyncLocalStorage.run(context, callback);
  }
}
