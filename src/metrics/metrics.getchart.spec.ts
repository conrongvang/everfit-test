import { Test, TestingModule } from "@nestjs/testing";
import { METRICS_ERROR_CODES } from "../common/constants/error-codes";
import {
  DISTANCE_UNITS,
  METRIC_TYPES,
  TEMPERATURE_UNITS,
} from "../common/constants/metric-units";
import { BadRequestAppException } from "../common/exceptions/app-exception";
import { UnitConversionService } from "../common/utils/unit-conversion.service";
import { MetricDbService } from "../database/providers/metric-db.service";
import { ChartDataQueryDto } from "./dto/chart-data-query.dto";
import { MetricsService } from "./metrics.service";

describe("MetricsService", () => {
  let service: MetricsService;
  let metricDbService: jest.Mocked<MetricDbService>;
  let unitConversionService: jest.Mocked<UnitConversionService>;

  beforeEach(async () => {
    const mockMetricDbService = {
      createMetric: jest.fn(),
      getMetricsByType: jest.fn(),
      getChartData: jest.fn(),
    };

    const mockUnitConversionService = {
      convertValue: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetricsService,
        {
          provide: MetricDbService,
          useValue: mockMetricDbService,
        },
        {
          provide: UnitConversionService,
          useValue: mockUnitConversionService,
        },
      ],
    }).compile();

    service = module.get<MetricsService>(MetricsService);
    metricDbService = module.get(MetricDbService);
    unitConversionService = module.get(UnitConversionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getChartData", () => {
    describe("Success Cases", () => {
      it("should return chart data without unit conversion", async () => {
        // Arrange
        const queryDto: ChartDataQueryDto = {
          userId: 1,
          metricType: METRIC_TYPES.DISTANCE,
          timePeriod: 1,
          // No targetUnit specified
        };

        const mockDbData = [
          {
            date: "2024-01-15",
            value: "100.5",
            unit: DISTANCE_UNITS.METER,
            created_date: new Date("2024-01-15T10:00:00Z"),
          },
          {
            date: "2024-01-16",
            value: "200.0",
            unit: DISTANCE_UNITS.METER,
            created_date: new Date("2024-01-16T11:00:00Z"),
          },
          {
            date: "2024-01-17",
            value: "150.75",
            unit: DISTANCE_UNITS.METER,
            created_date: new Date("2024-01-17T12:00:00Z"),
          },
        ];

        metricDbService.getChartData.mockResolvedValue(mockDbData as any);

        // Act
        const result = await service.getChartData(queryDto);

        // Assert
        expect(metricDbService.getChartData).toHaveBeenCalledWith(queryDto);
        expect(metricDbService.getChartData).toHaveBeenCalledTimes(1);
        expect(unitConversionService.convertValue).not.toHaveBeenCalled();

        expect(result).toEqual({
          data: [
            {
              date: "2024-01-15",
              value: 100.5,
              originalUnit: DISTANCE_UNITS.METER,
            },
            {
              date: "2024-01-16",
              value: 200.0,
              originalUnit: DISTANCE_UNITS.METER,
            },
            {
              date: "2024-01-17",
              value: 150.75,
              originalUnit: DISTANCE_UNITS.METER,
            },
          ],
          metricType: METRIC_TYPES.DISTANCE,
          timePeriod: 1,
          targetUnit: undefined,
          totalPoints: 3,
        });
      });

      it("should return chart data with unit conversion when targetUnit is specified", async () => {
        // Arrange
        const queryDto: ChartDataQueryDto = {
          userId: 1,
          metricType: METRIC_TYPES.DISTANCE,
          timePeriod: 2,
          targetUnit: DISTANCE_UNITS.CENTIMETER,
        };

        const mockDbData = [
          {
            date: "2024-01-15",
            value: "1.5",
            unit: DISTANCE_UNITS.METER,
            created_date: new Date("2024-01-15T10:00:00Z"),
          },
          {
            date: "2024-01-16",
            value: "2.0",
            unit: DISTANCE_UNITS.METER,
            created_date: new Date("2024-01-16T11:00:00Z"),
          },
        ];

        metricDbService.getChartData.mockResolvedValue(mockDbData as any);
        unitConversionService.convertValue
          .mockReturnValueOnce(150.0) // 1.5m -> 150cm
          .mockReturnValueOnce(200.0); // 2.0m -> 200cm

        // Act
        const result = await service.getChartData(queryDto);

        // Assert
        expect(metricDbService.getChartData).toHaveBeenCalledWith(queryDto);
        expect(unitConversionService.convertValue).toHaveBeenCalledTimes(2);
        expect(unitConversionService.convertValue).toHaveBeenNthCalledWith(
          1,
          1.5,
          DISTANCE_UNITS.METER,
          DISTANCE_UNITS.CENTIMETER,
          METRIC_TYPES.DISTANCE
        );
        expect(unitConversionService.convertValue).toHaveBeenNthCalledWith(
          2,
          2.0,
          DISTANCE_UNITS.METER,
          DISTANCE_UNITS.CENTIMETER,
          METRIC_TYPES.DISTANCE
        );

        expect(result).toEqual({
          data: [
            {
              date: "2024-01-15",
              value: 150.0,
              originalUnit: DISTANCE_UNITS.METER,
              originalValue: 1.5,
              convertedUnit: DISTANCE_UNITS.CENTIMETER,
            },
            {
              date: "2024-01-16",
              value: 200.0,
              originalUnit: DISTANCE_UNITS.METER,
              originalValue: 2.0,
              convertedUnit: DISTANCE_UNITS.CENTIMETER,
            },
          ],
          metricType: METRIC_TYPES.DISTANCE,
          timePeriod: 2,
          targetUnit: DISTANCE_UNITS.CENTIMETER,
          totalPoints: 2,
        });
      });

      it("should handle temperature metrics with conversion", async () => {
        // Arrange
        const queryDto: ChartDataQueryDto = {
          userId: 2,
          metricType: METRIC_TYPES.TEMPERATURE,
          timePeriod: 1,
          targetUnit: TEMPERATURE_UNITS.FAHRENHEIT,
        };

        const mockDbData = [
          {
            date: "2024-01-15",
            value: "25.0",
            unit: TEMPERATURE_UNITS.CELSIUS,
            created_date: new Date("2024-01-15T10:00:00Z"),
          },
          {
            date: "2024-01-16",
            value: "30.5",
            unit: TEMPERATURE_UNITS.CELSIUS,
            created_date: new Date("2024-01-16T11:00:00Z"),
          },
        ];

        metricDbService.getChartData.mockResolvedValue(mockDbData as any);
        unitConversionService.convertValue
          .mockReturnValueOnce(77.0) // 25°C -> 77°F
          .mockReturnValueOnce(86.9); // 30.5°C -> 86.9°F

        // Act
        const result = await service.getChartData(queryDto);

        // Assert
        expect(result.data).toHaveLength(2);
        expect(result.data[0]).toEqual({
          date: "2024-01-15",
          value: 77.0,
          originalUnit: TEMPERATURE_UNITS.CELSIUS,
          originalValue: 25.0,
          convertedUnit: TEMPERATURE_UNITS.FAHRENHEIT,
        });
        expect(result.metricType).toBe(METRIC_TYPES.TEMPERATURE);
        expect(result.targetUnit).toBe(TEMPERATURE_UNITS.FAHRENHEIT);
      });

      it("should skip conversion when targetUnit equals original unit", async () => {
        // Arrange
        const queryDto: ChartDataQueryDto = {
          userId: 1,
          metricType: METRIC_TYPES.DISTANCE,
          timePeriod: 1,
          targetUnit: DISTANCE_UNITS.METER, // Same as original unit
        };

        const mockDbData = [
          {
            date: "2024-01-15",
            value: "100.5",
            unit: DISTANCE_UNITS.METER,
            created_date: new Date("2024-01-15T10:00:00Z"),
          },
        ];

        metricDbService.getChartData.mockResolvedValue(mockDbData as any);

        // Act
        const result = await service.getChartData(queryDto);

        // Assert
        expect(unitConversionService.convertValue).not.toHaveBeenCalled();
        expect(result.data[0]).toEqual({
          date: "2024-01-15",
          value: 100.5,
          originalUnit: DISTANCE_UNITS.METER,
          // No originalValue or convertedUnit properties
        });
      });

      it("should handle empty data array", async () => {
        // Arrange
        const queryDto: ChartDataQueryDto = {
          userId: 999,
          metricType: METRIC_TYPES.DISTANCE,
          timePeriod: 1,
        };

        metricDbService.getChartData.mockResolvedValue([]);

        // Act
        const result = await service.getChartData(queryDto);

        // Assert
        expect(result).toEqual({
          data: [],
          metricType: METRIC_TYPES.DISTANCE,
          timePeriod: 1,
          targetUnit: undefined,
          totalPoints: 0,
        });
      });

      it("should handle mixed units in the same metric type with conversion", async () => {
        // Arrange
        const queryDto: ChartDataQueryDto = {
          userId: 1,
          metricType: METRIC_TYPES.DISTANCE,
          timePeriod: 1,
          targetUnit: DISTANCE_UNITS.METER,
        };

        const mockDbData = [
          {
            date: "2024-01-15",
            value: "100.0",
            unit: DISTANCE_UNITS.CENTIMETER,
            created_date: new Date("2024-01-15T10:00:00Z"),
          },
          {
            date: "2024-01-16",
            value: "2.0",
            unit: DISTANCE_UNITS.METER,
            created_date: new Date("2024-01-16T11:00:00Z"),
          },
          {
            date: "2024-01-17",
            value: "3.28",
            unit: DISTANCE_UNITS.FEET,
            created_date: new Date("2024-01-17T12:00:00Z"),
          },
        ];

        metricDbService.getChartData.mockResolvedValue(mockDbData as any);
        unitConversionService.convertValue
          .mockReturnValueOnce(1.0) // 100cm -> 1m
          .mockReturnValueOnce(1.0); // 3.28ft -> ~1m

        // Act
        const result = await service.getChartData(queryDto);

        // Assert
        expect(unitConversionService.convertValue).toHaveBeenCalledTimes(2);
        expect(unitConversionService.convertValue).toHaveBeenNthCalledWith(
          1,
          100.0,
          DISTANCE_UNITS.CENTIMETER,
          DISTANCE_UNITS.METER,
          METRIC_TYPES.DISTANCE
        );
        expect(unitConversionService.convertValue).toHaveBeenNthCalledWith(
          2,
          3.28,
          DISTANCE_UNITS.FEET,
          DISTANCE_UNITS.METER,
          METRIC_TYPES.DISTANCE
        );

        expect(result.data).toHaveLength(3);
        expect(result.data[0].originalValue).toBe(100.0);
        expect(result.data[1].originalValue).toBeUndefined(); // Same unit, no conversion
        expect(result.data[2].originalValue).toBe(3.28);
      });
    });

    describe("Validation Error Cases", () => {
      it("should throw BadRequestAppException for invalid target unit with distance metric", async () => {
        // Arrange
        const queryDto: ChartDataQueryDto = {
          userId: 1,
          metricType: METRIC_TYPES.DISTANCE,
          timePeriod: 1,
          targetUnit: "invalid_unit" as any,
        };

        // Act & Assert
        await expect(service.getChartData(queryDto)).rejects.toThrow(
          BadRequestAppException
        );

        try {
          await service.getChartData(queryDto);
        } catch (error) {
          expect(error).toBeInstanceOf(BadRequestAppException);
          expect(error.errorCode).toBe(METRICS_ERROR_CODES.INVALID_UNIT);
          expect(error.message).toBe(
            "Invalid unit 'invalid_unit' for metric type 'distance'"
          );
          expect(error.details).toEqual({
            providedUnit: "invalid_unit",
            validUnits: Object.values(DISTANCE_UNITS),
            metricType: "distance",
          });
        }

        expect(metricDbService.getChartData).not.toHaveBeenCalled();
      });

      it("should throw BadRequestAppException for invalid target unit with temperature metric", async () => {
        // Arrange
        const queryDto: ChartDataQueryDto = {
          userId: 1,
          metricType: METRIC_TYPES.TEMPERATURE,
          timePeriod: 1,
          targetUnit: "invalid_temp_unit" as any,
        };

        // Act & Assert
        await expect(service.getChartData(queryDto)).rejects.toThrow(
          BadRequestAppException
        );

        try {
          await service.getChartData(queryDto);
        } catch (error) {
          expect(error).toBeInstanceOf(BadRequestAppException);
          expect(error.errorCode).toBe(METRICS_ERROR_CODES.INVALID_UNIT);
          expect(error.message).toBe(
            "Invalid unit 'invalid_temp_unit' for metric type 'temperature'"
          );
          expect(error.details).toEqual({
            providedUnit: "invalid_temp_unit",
            validUnits: Object.values(TEMPERATURE_UNITS),
            metricType: "temperature",
          });
        }

        expect(metricDbService.getChartData).not.toHaveBeenCalled();
      });

      it("should throw BadRequestAppException when using temperature unit for distance metric", async () => {
        // Arrange
        const queryDto: ChartDataQueryDto = {
          userId: 1,
          metricType: METRIC_TYPES.DISTANCE,
          timePeriod: 1,
          targetUnit: TEMPERATURE_UNITS.CELSIUS as any,
        };

        // Act & Assert
        await expect(service.getChartData(queryDto)).rejects.toThrow(
          BadRequestAppException
        );

        try {
          await service.getChartData(queryDto);
        } catch (error) {
          expect(error).toBeInstanceOf(BadRequestAppException);
          expect(error.errorCode).toBe(METRICS_ERROR_CODES.INVALID_UNIT);
          expect(error.message).toBe(
            "Invalid unit '°C' for metric type 'distance'"
          );
        }
      });

      it("should throw BadRequestAppException when using distance unit for temperature metric", async () => {
        // Arrange
        const queryDto: ChartDataQueryDto = {
          userId: 1,
          metricType: METRIC_TYPES.TEMPERATURE,
          timePeriod: 1,
          targetUnit: DISTANCE_UNITS.METER as any,
        };

        // Act & Assert
        await expect(service.getChartData(queryDto)).rejects.toThrow(
          BadRequestAppException
        );

        try {
          await service.getChartData(queryDto);
        } catch (error) {
          expect(error).toBeInstanceOf(BadRequestAppException);
          expect(error.errorCode).toBe(METRICS_ERROR_CODES.INVALID_UNIT);
          expect(error.message).toBe(
            "Invalid unit 'meter' for metric type 'temperature'"
          );
        }
      });
    });

    describe("Database Integration", () => {
      it("should handle database errors properly", async () => {
        // Arrange
        const queryDto: ChartDataQueryDto = {
          userId: 1,
          metricType: METRIC_TYPES.DISTANCE,
          timePeriod: 1,
        };

        const dbError = new Error("Database query failed");
        metricDbService.getChartData.mockRejectedValue(dbError);

        // Act & Assert
        await expect(service.getChartData(queryDto)).rejects.toThrow(
          "Database query failed"
        );
        expect(metricDbService.getChartData).toHaveBeenCalledWith(queryDto);
      });

      it("should pass correct query parameters to database service", async () => {
        // Arrange
        const queryDto: ChartDataQueryDto = {
          userId: 123,
          metricType: METRIC_TYPES.TEMPERATURE,
          timePeriod: 2,
          targetUnit: TEMPERATURE_UNITS.KELVIN,
        };

        metricDbService.getChartData.mockResolvedValue([]);

        // Act
        await service.getChartData(queryDto);

        // Assert
        expect(metricDbService.getChartData).toHaveBeenCalledWith(queryDto);
        expect(metricDbService.getChartData).toHaveBeenCalledTimes(1);
      });
    });

    describe("Edge Cases", () => {
      it("should handle numeric string values correctly", async () => {
        // Arrange
        const queryDto: ChartDataQueryDto = {
          userId: 1,
          metricType: METRIC_TYPES.DISTANCE,
          timePeriod: 1,
        };

        const mockDbData = [
          {
            date: "2024-01-15",
            value: "999.9999", // String value from database
            unit: DISTANCE_UNITS.METER,
            created_date: new Date("2024-01-15T10:00:00Z"),
          },
        ];

        metricDbService.getChartData.mockResolvedValue(mockDbData as any);

        // Act
        const result = await service.getChartData(queryDto);

        // Assert
        expect(result.data[0].value).toBe(999.9999);
        expect(typeof result.data[0].value).toBe("number");
      });

      it("should handle zero values", async () => {
        // Arrange
        const queryDto: ChartDataQueryDto = {
          userId: 1,
          metricType: METRIC_TYPES.TEMPERATURE,
          timePeriod: 1,
        };

        const mockDbData = [
          {
            date: "2024-01-15",
            value: "0",
            unit: TEMPERATURE_UNITS.CELSIUS,
            created_date: new Date("2024-01-15T10:00:00Z"),
          },
        ];

        metricDbService.getChartData.mockResolvedValue(mockDbData as any);

        // Act
        const result = await service.getChartData(queryDto);

        // Assert
        expect(result.data[0].value).toBe(0);
      });

      it("should handle negative temperature values", async () => {
        // Arrange
        const queryDto: ChartDataQueryDto = {
          userId: 1,
          metricType: METRIC_TYPES.TEMPERATURE,
          timePeriod: 1,
          targetUnit: TEMPERATURE_UNITS.FAHRENHEIT,
        };

        const mockDbData = [
          {
            date: "2024-01-15",
            value: "-10.5",
            unit: TEMPERATURE_UNITS.CELSIUS,
            created_date: new Date("2024-01-15T10:00:00Z"),
          },
        ];

        metricDbService.getChartData.mockResolvedValue(mockDbData as any);
        unitConversionService.convertValue.mockReturnValue(13.1); // -10.5°C -> 13.1°F

        // Act
        const result = await service.getChartData(queryDto);

        // Assert
        expect(result.data[0].originalValue).toBe(-10.5);
        expect(result.data[0].value).toBe(13.1);
      });

      it("should handle large datasets", async () => {
        // Arrange
        const queryDto: ChartDataQueryDto = {
          userId: 1,
          metricType: METRIC_TYPES.DISTANCE,
          timePeriod: 2,
        };

        // Generate 60 data points (2 months of daily data)
        const mockDbData = Array.from({ length: 60 }, (_, index) => ({
          date: `2024-01-${String(index + 1).padStart(2, "0")}`,
          value: String(100 + index),
          unit: DISTANCE_UNITS.METER,
          created_date: new Date(
            `2024-01-${String(index + 1).padStart(2, "0")}T10:00:00Z`
          ),
        }));

        metricDbService.getChartData.mockResolvedValue(mockDbData as any);

        // Act
        const result = await service.getChartData(queryDto);

        // Assert
        expect(result.data).toHaveLength(60);
        expect(result.totalPoints).toBe(60);
        expect(result.data[0].value).toBe(100);
        expect(result.data[59].value).toBe(159);
      });

      it("should handle conversion service errors gracefully", async () => {
        // Arrange
        const queryDto: ChartDataQueryDto = {
          userId: 1,
          metricType: METRIC_TYPES.DISTANCE,
          timePeriod: 1,
          targetUnit: DISTANCE_UNITS.CENTIMETER,
        };

        const mockDbData = [
          {
            date: "2024-01-15",
            value: "100.0",
            unit: DISTANCE_UNITS.METER,
            created_date: new Date("2024-01-15T10:00:00Z"),
          },
        ];

        metricDbService.getChartData.mockResolvedValue(mockDbData as any);
        unitConversionService.convertValue.mockImplementation(() => {
          throw new Error("Conversion failed");
        });

        // Act & Assert
        await expect(service.getChartData(queryDto)).rejects.toThrow(
          "Conversion failed"
        );
      });
    });

    describe("Response Structure Validation", () => {
      it("should return response with correct structure and all required fields", async () => {
        // Arrange
        const queryDto: ChartDataQueryDto = {
          userId: 1,
          metricType: METRIC_TYPES.DISTANCE,
          timePeriod: 1,
          targetUnit: DISTANCE_UNITS.CENTIMETER,
        };

        const mockDbData = [
          {
            date: "2024-01-15",
            value: "1.5",
            unit: DISTANCE_UNITS.METER,
            created_date: new Date("2024-01-15T10:00:00Z"),
          },
        ];

        metricDbService.getChartData.mockResolvedValue(mockDbData as any);
        unitConversionService.convertValue.mockReturnValue(150.0);

        // Act
        const result = await service.getChartData(queryDto);

        // Assert
        expect(result).toHaveProperty("data");
        expect(result).toHaveProperty("metricType");
        expect(result).toHaveProperty("timePeriod");
        expect(result).toHaveProperty("targetUnit");
        expect(result).toHaveProperty("totalPoints");

        expect(Array.isArray(result.data)).toBe(true);
        expect(typeof result.metricType).toBe("string");
        expect(typeof result.timePeriod).toBe("number");
        expect(typeof result.totalPoints).toBe("number");

        // Check data point structure
        const dataPoint = result.data[0];
        expect(dataPoint).toHaveProperty("date");
        expect(dataPoint).toHaveProperty("value");
        expect(dataPoint).toHaveProperty("originalUnit");
        expect(dataPoint).toHaveProperty("originalValue");
        expect(dataPoint).toHaveProperty("convertedUnit");

        expect(typeof dataPoint.date).toBe("string");
        expect(typeof dataPoint.value).toBe("number");
        expect(typeof dataPoint.originalUnit).toBe("string");
        expect(typeof dataPoint.originalValue).toBe("number");
        expect(typeof dataPoint.convertedUnit).toBe("string");
      });
    });
  });
});
