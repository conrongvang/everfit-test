import { Test, TestingModule } from "@nestjs/testing";
import { METRICS_ERROR_CODES } from "../common/constants/error-codes";
import {
  DISTANCE_UNITS,
  METRIC_TYPES,
  TEMPERATURE_UNITS,
} from "../common/constants/metric-units";
import { BadRequestAppException } from "../common/exceptions/app-exception";
import { UnitConversionService } from "../common/utils/unit-conversion.service";
import { MetricEntity } from "../database/entities/metric.entity";
import { MetricDbService } from "../database/providers/metric-db.service";
import { CreateMetricDto } from "./dto/create-metric.dto";
import { MetricsService } from "./metrics.service";

describe("MetricsService - Creating Tests", () => {
  let service: MetricsService;
  let metricDbService: jest.Mocked<MetricDbService>;

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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createMetric", () => {
    describe("Success Cases", () => {
      it("should create a distance metric successfully", async () => {
        // Arrange
        const createMetricDto: CreateMetricDto = {
          user_id: 1,
          metric_type: METRIC_TYPES.DISTANCE,
          value: 100.5,
          unit: DISTANCE_UNITS.METER,
          date_recorded: "2024-01-15",
        };

        const mockMetricEntity = {
          id: 1,
          user_id: 1,
          metric_type: METRIC_TYPES.DISTANCE,
          value: 100.5,
          unit: DISTANCE_UNITS.METER,
          date_recorded: new Date("2024-01-15"),
          created_date: new Date(),
          updated_date: new Date(),
          user: { id: 1, name: "Test User" }, // This should be removed
        } as unknown as MetricEntity;

        metricDbService.createMetric.mockResolvedValue(mockMetricEntity);

        // Act
        const result = await service.createMetric(createMetricDto);

        // Assert
        expect(metricDbService.createMetric).toHaveBeenCalledWith(
          createMetricDto
        );
        expect(metricDbService.createMetric).toHaveBeenCalledTimes(1);
        expect(result).toEqual({
          id: 1,
          user_id: 1,
          metric_type: METRIC_TYPES.DISTANCE,
          value: 100.5,
          unit: DISTANCE_UNITS.METER,
          date_recorded: new Date("2024-01-15"),
          created_date: expect.any(Date),
          updated_date: expect.any(Date),
        });

        expect(result).not.toHaveProperty("user");
      });

      it("should create a temperature metric successfully", async () => {
        // Arrange
        const createMetricDto: CreateMetricDto = {
          user_id: 2,
          metric_type: METRIC_TYPES.TEMPERATURE,
          value: 25.5,
          unit: TEMPERATURE_UNITS.CELSIUS,
          date_recorded: "2024-01-16",
        };

        const mockMetricEntity = {
          id: 2,
          user_id: 2,
          metric_type: METRIC_TYPES.TEMPERATURE,
          value: 25.5,
          unit: TEMPERATURE_UNITS.CELSIUS,
          date_recorded: new Date("2024-01-16"),
          created_date: new Date(),
          updated_date: new Date(),
          user: { id: 2, name: "Another User" },
        } as unknown as MetricEntity;

        metricDbService.createMetric.mockResolvedValue(mockMetricEntity);

        // Act
        const result = await service.createMetric(createMetricDto);

        // Assert
        expect(metricDbService.createMetric).toHaveBeenCalledWith(
          createMetricDto
        );
        expect(result.metric_type).toBe(METRIC_TYPES.TEMPERATURE);
        expect(result.unit).toBe(TEMPERATURE_UNITS.CELSIUS);
        expect(result).not.toHaveProperty("user");
      });

      it("should handle all valid distance units", async () => {
        // Test each valid distance unit
        const validDistanceUnits = Object.values(DISTANCE_UNITS);

        for (const unit of validDistanceUnits) {
          const createMetricDto: CreateMetricDto = {
            user_id: 1,
            metric_type: METRIC_TYPES.DISTANCE,
            value: 50,
            unit,
            date_recorded: "2024-01-15",
          };

          const mockMetricEntity = {
            id: 1,
            user_id: 1,
            metric_type: METRIC_TYPES.DISTANCE,
            value: 50,
            unit,
            date_recorded: new Date("2024-01-15"),
            created_date: new Date(),
            updated_date: new Date(),
          } as unknown as MetricEntity;

          metricDbService.createMetric.mockResolvedValue(mockMetricEntity);

          // Should not throw for valid units
          await expect(
            service.createMetric(createMetricDto)
          ).resolves.toBeTruthy();
        }
      });

      it("should handle all valid temperature units", async () => {
        // Test each valid temperature unit
        const validTemperatureUnits = Object.values(TEMPERATURE_UNITS);

        for (const unit of validTemperatureUnits) {
          const createMetricDto: CreateMetricDto = {
            user_id: 1,
            metric_type: METRIC_TYPES.TEMPERATURE,
            value: 20,
            unit,
            date_recorded: "2024-01-15",
          };

          const mockMetricEntity = {
            id: 1,
            user_id: 1,
            metric_type: METRIC_TYPES.TEMPERATURE,
            value: 20,
            unit,
            date_recorded: new Date("2024-01-15"),
            created_date: new Date(),
            updated_date: new Date(),
          } as unknown as MetricEntity;

          metricDbService.createMetric.mockResolvedValue(mockMetricEntity);

          // Should not throw for valid units
          await expect(
            service.createMetric(createMetricDto)
          ).resolves.toBeTruthy();
        }
      });
    });

    describe("Validation Error Cases", () => {
      it("should throw BadRequestAppException for invalid distance unit", async () => {
        // Arrange
        const createMetricDto: CreateMetricDto = {
          user_id: 1,
          metric_type: METRIC_TYPES.DISTANCE,
          value: 100.5,
          unit: "invalid_unit",
          date_recorded: "2024-01-15",
        };

        // Act & Assert
        await expect(service.createMetric(createMetricDto)).rejects.toThrow(
          BadRequestAppException
        );

        try {
          await service.createMetric(createMetricDto);
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
          expect(error.getStatus()).toBe(400);
        }

        // Ensure database method is not called when validation fails
        expect(metricDbService.createMetric).not.toHaveBeenCalled();
      });

      it("should throw BadRequestAppException for invalid temperature unit", async () => {
        // Arrange
        const createMetricDto: CreateMetricDto = {
          user_id: 1,
          metric_type: METRIC_TYPES.TEMPERATURE,
          value: 25.5,
          unit: "invalid_temp_unit",
          date_recorded: "2024-01-15",
        };

        // Act & Assert
        await expect(service.createMetric(createMetricDto)).rejects.toThrow(
          BadRequestAppException
        );

        try {
          await service.createMetric(createMetricDto);
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
          expect(error.getStatus()).toBe(400);
        }

        expect(metricDbService.createMetric).not.toHaveBeenCalled();
      });

      it("should throw BadRequestAppException when using temperature unit for distance metric", async () => {
        // Arrange
        const createMetricDto: CreateMetricDto = {
          user_id: 1,
          metric_type: METRIC_TYPES.DISTANCE,
          value: 100,
          unit: TEMPERATURE_UNITS.CELSIUS, // Wrong unit type
          date_recorded: "2024-01-15",
        };

        // Act & Assert
        await expect(service.createMetric(createMetricDto)).rejects.toThrow(
          BadRequestAppException
        );

        try {
          await service.createMetric(createMetricDto);
        } catch (error) {
          expect(error).toBeInstanceOf(BadRequestAppException);
          expect(error.errorCode).toBe(METRICS_ERROR_CODES.INVALID_UNIT);
          expect(error.message).toBe(
            "Invalid unit '°C' for metric type 'distance'"
          );
          expect(error.details).toEqual({
            providedUnit: "°C",
            validUnits: Object.values(DISTANCE_UNITS),
            metricType: "distance",
          });
        }

        expect(metricDbService.createMetric).not.toHaveBeenCalled();
      });

      it("should throw BadRequestAppException when using distance unit for temperature metric", async () => {
        // Arrange
        const createMetricDto: CreateMetricDto = {
          user_id: 1,
          metric_type: METRIC_TYPES.TEMPERATURE,
          value: 25,
          unit: DISTANCE_UNITS.METER, // Wrong unit type
          date_recorded: "2024-01-15",
        };

        // Act & Assert
        await expect(service.createMetric(createMetricDto)).rejects.toThrow(
          BadRequestAppException
        );

        try {
          await service.createMetric(createMetricDto);
        } catch (error) {
          expect(error).toBeInstanceOf(BadRequestAppException);
          expect(error.errorCode).toBe(METRICS_ERROR_CODES.INVALID_UNIT);
          expect(error.message).toBe(
            "Invalid unit 'meter' for metric type 'temperature'"
          );
          expect(error.details).toEqual({
            providedUnit: "meter",
            validUnits: Object.values(TEMPERATURE_UNITS),
            metricType: "temperature",
          });
        }

        expect(metricDbService.createMetric).not.toHaveBeenCalled();
      });
    });

    describe("Database Integration", () => {
      it("should handle database errors properly", async () => {
        // Arrange
        const createMetricDto: CreateMetricDto = {
          user_id: 1,
          metric_type: METRIC_TYPES.DISTANCE,
          value: 100.5,
          unit: DISTANCE_UNITS.METER,
          date_recorded: "2024-01-15",
        };

        const dbError = new Error("Database connection failed");
        metricDbService.createMetric.mockRejectedValue(dbError);

        // Act & Assert
        await expect(service.createMetric(createMetricDto)).rejects.toThrow(
          "Database connection failed"
        );
        expect(metricDbService.createMetric).toHaveBeenCalledWith(
          createMetricDto
        );
      });

      it("should preserve all metric data except user relationship", async () => {
        // Arrange
        const createMetricDto: CreateMetricDto = {
          user_id: 123,
          metric_type: METRIC_TYPES.DISTANCE,
          value: 999.99,
          unit: DISTANCE_UNITS.MILE,
          date_recorded: "2024-12-25",
        };

        const mockMetricWithUser = {
          id: 456,
          user_id: 123,
          metric_type: METRIC_TYPES.DISTANCE,
          value: 999.99,
          unit: DISTANCE_UNITS.MILE,
          date_recorded: new Date("2024-12-25"),
          created_date: new Date("2024-01-01T10:00:00Z"),
          updated_date: new Date("2024-01-01T10:00:00Z"),
          user: {
            id: 123,
            name: "Test User",
            email: "test@example.com",
          },
        } as unknown as MetricEntity;

        metricDbService.createMetric.mockResolvedValue(mockMetricWithUser);

        // Act
        const result = await service.createMetric(createMetricDto);

        // Assert - All properties except user should be preserved
        expect(result).toEqual({
          id: 456,
          user_id: 123,
          metric_type: METRIC_TYPES.DISTANCE,
          value: 999.99,
          unit: DISTANCE_UNITS.MILE,
          date_recorded: new Date("2024-12-25"),
          created_date: new Date("2024-01-01T10:00:00Z"),
          updated_date: new Date("2024-01-01T10:00:00Z"),
        });
        expect(result).not.toHaveProperty("user");
      });
    });

    describe("Edge Cases", () => {
      it("should handle zero values", async () => {
        // Arrange
        const createMetricDto: CreateMetricDto = {
          user_id: 1,
          metric_type: METRIC_TYPES.DISTANCE,
          value: 0,
          unit: DISTANCE_UNITS.METER,
          date_recorded: "2024-01-15",
        };

        const mockMetricEntity = {
          id: 1,
          user_id: 1,
          metric_type: METRIC_TYPES.DISTANCE,
          value: 0,
          unit: DISTANCE_UNITS.METER,
          date_recorded: new Date("2024-01-15"),
          created_date: new Date(),
          updated_date: new Date(),
        } as unknown as MetricEntity;

        metricDbService.createMetric.mockResolvedValue(mockMetricEntity);

        // Act
        const result = await service.createMetric(createMetricDto);

        // Assert
        expect(result.value).toBe(0);
        expect(metricDbService.createMetric).toHaveBeenCalledWith(
          createMetricDto
        );
      });

      it("should handle negative temperature values", async () => {
        // Arrange
        const createMetricDto: CreateMetricDto = {
          user_id: 1,
          metric_type: METRIC_TYPES.TEMPERATURE,
          value: -10.5,
          unit: TEMPERATURE_UNITS.CELSIUS,
          date_recorded: "2024-01-15",
        };

        const mockMetricEntity = {
          id: 1,
          user_id: 1,
          metric_type: METRIC_TYPES.TEMPERATURE,
          value: -10.5,
          unit: TEMPERATURE_UNITS.CELSIUS,
          date_recorded: new Date("2024-01-15"),
          created_date: new Date(),
          updated_date: new Date(),
        } as unknown as MetricEntity;

        metricDbService.createMetric.mockResolvedValue(mockMetricEntity);

        // Act
        const result = await service.createMetric(createMetricDto);

        // Assert
        expect(result.value).toBe(-10.5);
        expect(metricDbService.createMetric).toHaveBeenCalledWith(
          createMetricDto
        );
      });

      it("should handle very large values", async () => {
        // Arrange
        const createMetricDto: CreateMetricDto = {
          user_id: 1,
          metric_type: METRIC_TYPES.DISTANCE,
          value: 999999.9999,
          unit: DISTANCE_UNITS.MILE,
          date_recorded: "2024-01-15",
        };

        const mockMetricEntity = {
          id: 1,
          user_id: 1,
          metric_type: METRIC_TYPES.DISTANCE,
          value: 999999.9999,
          unit: DISTANCE_UNITS.MILE,
          date_recorded: new Date("2024-01-15"),
          created_date: new Date(),
          updated_date: new Date(),
        } as unknown as MetricEntity;

        metricDbService.createMetric.mockResolvedValue(mockMetricEntity);

        // Act
        const result = await service.createMetric(createMetricDto);

        // Assert
        expect(result.value).toBe(999999.9999);
        expect(metricDbService.createMetric).toHaveBeenCalledWith(
          createMetricDto
        );
      });
    });
  });
});
