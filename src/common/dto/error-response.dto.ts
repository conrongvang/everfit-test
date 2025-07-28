import { ApiProperty } from "@nestjs/swagger";
import { ErrorCode } from "../constants/error-codes";

export class ErrorResponseDto {
  @ApiProperty({
    description: "HTTP status code",
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: "Application-specific error code",
    example: "METVL002",
  })
  errorCode: ErrorCode;

  @ApiProperty({
    description: "Human-readable error message",
    example: "Invalid unit for the specified metric type",
  })
  message: string;

  @ApiProperty({
    description: "Additional error details",
    required: false,
    example: {
      providedUnit: "invalid_unit",
      validUnits: ["meter", "centimeter", "inch", "feet", "yard", "mile"],
    },
  })
  details?: any;

  @ApiProperty({
    description: "Timestamp when the error occurred",
    example: "2024-01-15T10:30:00.000Z",
  })
  timestamp: string;
}

export class ValidationErrorResponseDto extends ErrorResponseDto {
  @ApiProperty({
    description: "Detailed validation errors",
    example: [
      {
        field: "unit",
        value: "invalid_unit",
        constraints: {
          isEnum: "unit must be a valid enum value",
        },
      },
    ],
  })
  validationErrors?: Array<{
    field: string;
    value: any;
    constraints: Record<string, string>;
  }>;
}
