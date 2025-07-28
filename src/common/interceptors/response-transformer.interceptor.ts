import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { GqlContextType } from "@nestjs/graphql";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { successRespCode } from "../constants/response.enum";

export interface Response<T> {
  statusCode: number;
  message?: string;
  data?: T;
  error?: any;
}

@Injectable()
export class ResponseTransformerInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<Response<T>> {
    if (context.getType<GqlContextType>() !== "graphql") {
      const request = context.switchToHttp().getRequest();

      // ignore transform for health check api call
      const ignoreApiPaths = ["/api/postman", "/api/hc"];
      if (ignoreApiPaths.includes(request.route.path)) {
        return next.handle();
      }
    }

    return next.handle().pipe(
      map((data) => {
        if (context.getType<GqlContextType>() === "graphql") {
          return data;
        }

        const response = context.switchToHttp().getResponse();

        if (successRespCode.includes(response.statusCode)) {
          return { statusCode: response.statusCode, data: data };
        }

        return {
          statusCode: response.statusCode,
          message: data.message,
          error: data.error,
        };
      })
    );
  }
}
