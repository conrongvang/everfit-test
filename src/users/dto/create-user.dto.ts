import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateUserDto {
  @ApiProperty({
    description: "User name",
    example: "John_Doe_123",
    maxLength: 60,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  name: string;
}
