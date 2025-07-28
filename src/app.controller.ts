import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import * as fs from "fs";
import { AppService } from "./app.service";
import { Public } from "./common/decorators/public.decorator";

@Controller()
@ApiTags("Shared APIs")
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get("/postman")
  @ApiOkResponse({ description: "Generated OpenAPI in JSON format successful" })
  @ApiOperation({ summary: "Return json data uses to import to Postman app" })
  async getPostmanApiCollection() {
    return JSON.parse(
      fs.readFileSync("./swagger-doc.json", { encoding: "utf-8" })
    );
  }
}
