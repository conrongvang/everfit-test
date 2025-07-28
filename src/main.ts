import { ValidationPipe, VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as compression from "compression";
import * as fs from "fs";
import helmet from "helmet";
import { AppConfigs } from "./app.config";
import { AppModule } from "./app.module";
import { ResponseTransformerInterceptor } from "./common/interceptors/response-transformer.interceptor";
import { TimeoutInterceptor } from "./common/interceptors/timeout.interceptor";
import { AppExceptionFilter } from "./common/middlewares/app-exception.filter";

async function swaggerBuilder(app: NestExpressApplication) {
  const swaggerConfig = new DocumentBuilder()
    .setTitle(AppConfigs.title)
    .setDescription(`Swagger document for ${AppConfigs.title} APIs`)
    .setVersion("1.0")
    .addTag(AppConfigs.title)
    .addBearerAuth()
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("swagger", app, swaggerDocument);

  return swaggerDocument;
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || [
      `http://localhost:${AppConfigs.port}`,
    ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  });

  app
    .setGlobalPrefix("/api")
    .enableVersioning({ type: VersioningType.URI })
    .use(
      helmet({
        contentSecurityPolicy: AppConfigs.isProd ? true : false,
      })
    )
    .useGlobalFilters(new AppExceptionFilter())
    .useGlobalInterceptors(new ResponseTransformerInterceptor())
    .useGlobalInterceptors(new TimeoutInterceptor());

  if (AppConfigs.isProd) {
    app.use(compression());
  }

  app.enableShutdownHooks().useGlobalPipes(new ValidationPipe());

  await app.startAllMicroservices();
  const swaggerDocument = await swaggerBuilder(app);
  await app.listen(AppConfigs.port);
  swaggerDocument.servers?.push({
    url: await app.getUrl(),
  });
  fs.writeFileSync("./swagger-doc.json", JSON.stringify(swaggerDocument));

  return app;
}

bootstrap().then(async (app) => {
  console.log(`Application start on port ${await app.getUrl()}`);
});
