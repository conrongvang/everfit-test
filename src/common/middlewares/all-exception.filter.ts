import { ArgumentsHost, Catch } from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const detailException: string = exception?.detail;
    const ctx = host.switchToHttp();
    const response: any = ctx.getResponse<Response>();
    if (detailException?.includes("still referenced from table")) {
      response.status(400).json({
        statusCode: 400,
        message: `This data cannot be deleted because ${
          exception?.table || "order data"
        } is using it`,
      });
    } else {
      response.status(500).json({
        statusCode: 500,
        message: exception,
      });
    }
    super.catch(exception, host);
  }
}
