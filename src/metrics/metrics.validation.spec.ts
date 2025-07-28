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
import { CreateMetricDto } from "./dto/create-metric.dto";
import { MetricsService } from "./metrics.service";

describe("MetricsService - Unit Validation Tests", () => {
  let service: MetricsService;
  let metricDbService: jest.Mocked<MetricDbService>;

  beforeEach(async () => {
    const mockMetricDbService = {
      createMetric: jest.fn(),
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

  describe("Unit Validation Tests", () => {
    describe("Valid Units - Should Pass Validation", () => {
      describe("Distance Metric Valid Units", () => {
        it.each(Object.values(DISTANCE_UNITS))(
          "should accept valid distance unit: %s",
          async (validUnit) => {
            // Arrange
            const createMetricDto: CreateMetricDto = {
              user_id: 1,
              metric_type: METRIC_TYPES.DISTANCE,
              value: 100,
              unit: validUnit,
              date_recorded: "2024-01-15",
            };

            metricDbService.createMetric.mockResolvedValue({} as any);

            // Act & Assert
            await expect(
              service.createMetric(createMetricDto)
            ).resolves.toBeTruthy();
            expect(metricDbService.createMetric).toHaveBeenCalledWith(
              createMetricDto
            );
          }
        );

        it.each(Object.values(DISTANCE_UNITS))(
          "should accept valid distance target unit in chart data: %s",
          async (validUnit) => {
            // Arrange
            const queryDto: ChartDataQueryDto = {
              userId: 1,
              metricType: METRIC_TYPES.DISTANCE,
              timePeriod: 1,
              targetUnit: validUnit,
            };

            metricDbService.getChartData.mockResolvedValue([]);

            // Act & Assert
            await expect(service.getChartData(queryDto)).resolves.toBeTruthy();
            expect(metricDbService.getChartData).toHaveBeenCalledWith(queryDto);
          }
        );
      });

      describe("Temperature Metric Valid Units", () => {
        it.each(Object.values(TEMPERATURE_UNITS))(
          "should accept valid temperature unit: %s",
          async (validUnit) => {
            // Arrange
            const createMetricDto: CreateMetricDto = {
              user_id: 1,
              metric_type: METRIC_TYPES.TEMPERATURE,
              value: 25,
              unit: validUnit,
              date_recorded: "2024-01-15",
            };

            metricDbService.createMetric.mockResolvedValue({} as any);

            // Act & Assert
            await expect(
              service.createMetric(createMetricDto)
            ).resolves.toBeTruthy();
            expect(metricDbService.createMetric).toHaveBeenCalledWith(
              createMetricDto
            );
          }
        );

        it.each(Object.values(TEMPERATURE_UNITS))(
          "should accept valid temperature target unit in chart data: %s",
          async (validUnit) => {
            // Arrange
            const queryDto: ChartDataQueryDto = {
              userId: 1,
              metricType: METRIC_TYPES.TEMPERATURE,
              timePeriod: 1,
              targetUnit: validUnit,
            };

            metricDbService.getChartData.mockResolvedValue([]);

            // Act & Assert
            await expect(service.getChartData(queryDto)).resolves.toBeTruthy();
            expect(metricDbService.getChartData).toHaveBeenCalledWith(queryDto);
          }
        );
      });
    });

    describe("Invalid Units - Should Fail Validation", () => {
      describe("Distance Metric Invalid Units", () => {
        const invalidDistanceUnits = [
          "invalid_unit",
          "kilogram",
          "celsius",
          "fahrenheit",
          "kelvin",
          "METER", // Wrong case
          "meters", // Plural
          "123",
          "meter!@#",
          ...Object.values(TEMPERATURE_UNITS), // Temperature units for distance
        ];

        it.each(invalidDistanceUnits)(
          "should reject invalid distance unit: %s",
          async (invalidUnit) => {
            // Arrange
            const createMetricDto: CreateMetricDto = {
              user_id: 1,
              metric_type: METRIC_TYPES.DISTANCE,
              value: 100,
              unit: invalidUnit,
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
                `Invalid unit '${invalidUnit}' for metric type 'distance'`
              );
              expect(error.details).toEqual({
                providedUnit: invalidUnit,
                validUnits: Object.values(DISTANCE_UNITS),
                metricType: "distance",
              });
              expect(error.getStatus()).toBe(400);
            }

            // Ensure database is never called when validation fails
            expect(metricDbService.createMetric).not.toHaveBeenCalled();
          }
        );

        // Test only truthy invalid units for chart data (empty string is falsy and skips validation)
        const invalidDistanceUnitsForChart = invalidDistanceUnits.filter(
          (unit) => unit && unit.trim() !== "" // Only test truthy values
        );

        it.each(invalidDistanceUnitsForChart)(
          "should reject invalid distance target unit in chart data: %s",
          async (invalidUnit) => {
            // Arrange
            const queryDto: ChartDataQueryDto = {
              userId: 1,
              metricType: METRIC_TYPES.DISTANCE,
              timePeriod: 1,
              targetUnit: invalidUnit as any,
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
                `Invalid unit '${invalidUnit}' for metric type 'distance'`
              );
              expect(error.details).toEqual({
                providedUnit: invalidUnit,
                validUnits: Object.values(DISTANCE_UNITS),
                metricType: "distance",
              });
            }

            expect(metricDbService.getChartData).not.toHaveBeenCalled();
          }
        );
      });

      describe("Temperature Metric Invalid Units", () => {
        const invalidTemperatureUnits = [
          "invalid_temp_unit",
          "degree",
          "celsius",
          "fahrenheit",
          "kelvin",
          "CELSIUS", // Wrong case
          "C",
          "F",
          "K",
          "°c", // Wrong case
          "°f", // Wrong case
          "°k", // Wrong case
          "degrees",
          ...Object.values(DISTANCE_UNITS), // Distance units for temperature
        ];

        it.each(invalidTemperatureUnits)(
          "should reject invalid temperature unit: %s",
          async (invalidUnit) => {
            // Arrange
            const createMetricDto: CreateMetricDto = {
              user_id: 1,
              metric_type: METRIC_TYPES.TEMPERATURE,
              value: 25,
              unit: invalidUnit,
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
                `Invalid unit '${invalidUnit}' for metric type 'temperature'`
              );
              expect(error.details).toEqual({
                providedUnit: invalidUnit,
                validUnits: Object.values(TEMPERATURE_UNITS),
                metricType: "temperature",
              });
              expect(error.getStatus()).toBe(400);
            }

            expect(metricDbService.createMetric).not.toHaveBeenCalled();
          }
        );

        // Test only truthy invalid units for chart data
        const invalidTemperatureUnitsForChart = invalidTemperatureUnits.filter(
          (unit) => unit && unit.trim() !== ""
        );

        it.each(invalidTemperatureUnitsForChart)(
          "should reject invalid temperature target unit in chart data: %s",
          async (invalidUnit) => {
            // Arrange
            const queryDto: ChartDataQueryDto = {
              userId: 1,
              metricType: METRIC_TYPES.TEMPERATURE,
              timePeriod: 1,
              targetUnit: invalidUnit as any,
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
                `Invalid unit '${invalidUnit}' for metric type 'temperature'`
              );
              expect(error.details).toEqual({
                providedUnit: invalidUnit,
                validUnits: Object.values(TEMPERATURE_UNITS),
                metricType: "temperature",
              });
            }

            expect(metricDbService.getChartData).not.toHaveBeenCalled();
          }
        );
      });
    });

    describe("Cross-Type Unit Validation", () => {
      describe("Temperature Units with Distance Metrics", () => {
        it.each(Object.values(TEMPERATURE_UNITS))(
          "should reject temperature unit %s for distance metric",
          async (tempUnit) => {
            // Arrange
            const createMetricDto: CreateMetricDto = {
              user_id: 1,
              metric_type: METRIC_TYPES.DISTANCE,
              value: 100,
              unit: tempUnit,
              date_recorded: "2024-01-15",
            };

            // Act & Assert
            await expect(service.createMetric(createMetricDto)).rejects.toThrow(
              BadRequestAppException
            );

            try {
              await service.createMetric(createMetricDto);
            } catch (error) {
              expect(error.errorCode).toBe(METRICS_ERROR_CODES.INVALID_UNIT);
              expect(error.message).toBe(
                `Invalid unit '${tempUnit}' for metric type 'distance'`
              );
              expect(error.details.providedUnit).toBe(tempUnit);
              expect(error.details.validUnits).toEqual(
                Object.values(DISTANCE_UNITS)
              );
              expect(error.details.metricType).toBe("distance");
            }
          }
        );
      });

      describe("Distance Units with Temperature Metrics", () => {
        it.each(Object.values(DISTANCE_UNITS))(
          "should reject distance unit %s for temperature metric",
          async (distanceUnit) => {
            // Arrange
            const createMetricDto: CreateMetricDto = {
              user_id: 1,
              metric_type: METRIC_TYPES.TEMPERATURE,
              value: 25,
              unit: distanceUnit,
              date_recorded: "2024-01-15",
            };

            // Act & Assert
            await expect(service.createMetric(createMetricDto)).rejects.toThrow(
              BadRequestAppException
            );

            try {
              await service.createMetric(createMetricDto);
            } catch (error) {
              expect(error.errorCode).toBe(METRICS_ERROR_CODES.INVALID_UNIT);
              expect(error.message).toBe(
                `Invalid unit '${distanceUnit}' for metric type 'temperature'`
              );
              expect(error.details.providedUnit).toBe(distanceUnit);
              expect(error.details.validUnits).toEqual(
                Object.values(TEMPERATURE_UNITS)
              );
              expect(error.details.metricType).toBe("temperature");
            }
          }
        );
      });
    });

    describe("Case Sensitivity and Format Validation", () => {
      it("should be case sensitive for distance units", async () => {
        const invalidCaseUnits = [
          "METER",
          "Meter",
          "CENTIMETER",
          "Inch",
          "FEET",
        ];

        for (const invalidUnit of invalidCaseUnits) {
          const createMetricDto: CreateMetricDto = {
            user_id: 1,
            metric_type: METRIC_TYPES.DISTANCE,
            value: 100,
            unit: invalidUnit,
            date_recorded: "2024-01-15",
          };

          await expect(service.createMetric(createMetricDto)).rejects.toThrow(
            BadRequestAppException
          );
        }
      });

      it("should be case sensitive for temperature units", async () => {
        const invalidCaseUnits = [
          "celsius",
          "CELSIUS",
          "Celsius",
          "fahrenheit",
          "FAHRENHEIT",
        ];

        for (const invalidUnit of invalidCaseUnits) {
          const createMetricDto: CreateMetricDto = {
            user_id: 1,
            metric_type: METRIC_TYPES.TEMPERATURE,
            value: 25,
            unit: invalidUnit,
            date_recorded: "2024-01-15",
          };

          await expect(service.createMetric(createMetricDto)).rejects.toThrow(
            BadRequestAppException
          );
        }
      });

      it("should reject units with extra characters", async () => {
        const unitsWithExtraChars = [
          "meter ", // trailing space
          " meter", // leading space
          "meter!", // special character
          "meter123", // numbers
          "me ter", // space in middle
        ];

        for (const invalidUnit of unitsWithExtraChars) {
          const createMetricDto: CreateMetricDto = {
            user_id: 1,
            metric_type: METRIC_TYPES.DISTANCE,
            value: 100,
            unit: invalidUnit,
            date_recorded: "2024-01-15",
          };

          await expect(service.createMetric(createMetricDto)).rejects.toThrow(
            BadRequestAppException
          );
        }
      });
    });

    describe("Edge Cases", () => {
      it("should handle empty string unit in createMetric", async () => {
        const createMetricDto: CreateMetricDto = {
          user_id: 1,
          metric_type: METRIC_TYPES.DISTANCE,
          value: 100,
          unit: "",
          date_recorded: "2024-01-15",
        };

        await expect(service.createMetric(createMetricDto)).rejects.toThrow(
          BadRequestAppException
        );

        try {
          await service.createMetric(createMetricDto);
        } catch (error) {
          expect(error.message).toBe(
            "Invalid unit '' for metric type 'distance'"
          );
        }
      });

      it("should handle empty string targetUnit in getChartData (should not validate)", async () => {
        // Empty string is falsy, so validation is skipped
        const queryDto: ChartDataQueryDto = {
          userId: 1,
          metricType: METRIC_TYPES.DISTANCE,
          timePeriod: 1,
          targetUnit: "" as any, // Empty string is falsy, validation skipped
        };

        metricDbService.getChartData.mockResolvedValue([]);

        // Should NOT throw an error because empty string skips validation
        const result = await service.getChartData(queryDto);
        expect(result).toBeTruthy();
        expect(metricDbService.getChartData).toHaveBeenCalledWith(queryDto);
      });

      it("should handle undefined targetUnit in getChartData (should not validate)", async () => {
        const queryDto: ChartDataQueryDto = {
          userId: 1,
          metricType: METRIC_TYPES.DISTANCE,
          timePeriod: 1,
          // targetUnit is undefined
        };

        metricDbService.getChartData.mockResolvedValue([]);

        // Should NOT throw an error because undefined skips validation
        const result = await service.getChartData(queryDto);
        expect(result).toBeTruthy();
        expect(metricDbService.getChartData).toHaveBeenCalledWith(queryDto);
      });

      it("should handle numeric string units", async () => {
        const numericUnits = ["1", "123", "0", "-1"];

        for (const numericUnit of numericUnits) {
          const createMetricDto: CreateMetricDto = {
            user_id: 1,
            metric_type: METRIC_TYPES.DISTANCE,
            value: 100,
            unit: numericUnit,
            date_recorded: "2024-01-15",
          };

          await expect(service.createMetric(createMetricDto)).rejects.toThrow(
            BadRequestAppException
          );
        }
      });

      it("should handle special character units", async () => {
        const specialCharUnits = [
          "@",
          "#",
          "$",
          "%",
          "&",
          "*",
          "()",
          "[]",
          "{}",
        ];

        for (const specialUnit of specialCharUnits) {
          const createMetricDto: CreateMetricDto = {
            user_id: 1,
            metric_type: METRIC_TYPES.TEMPERATURE,
            value: 25,
            unit: specialUnit,
            date_recorded: "2024-01-15",
          };

          await expect(service.createMetric(createMetricDto)).rejects.toThrow(
            BadRequestAppException
          );
        }
      });
    });

    describe("Validation Behavior Differences", () => {
      it("should validate units in createMetric for all provided units", async () => {
        // createMetric always validates the unit field (required)
        const createMetricDto: CreateMetricDto = {
          user_id: 1,
          metric_type: METRIC_TYPES.DISTANCE,
          value: 100,
          unit: "invalid_unit",
          date_recorded: "2024-01-15",
        };

        await expect(service.createMetric(createMetricDto)).rejects.toThrow(
          BadRequestAppException
        );
      });

      it("should only validate targetUnit in getChartData when truthy", async () => {
        // getChartData only validates targetUnit if it's truthy
        const falsyValues = ["", null, undefined, 0, false];

        for (const falsyValue of falsyValues) {
          const queryDto: ChartDataQueryDto = {
            userId: 1,
            metricType: METRIC_TYPES.DISTANCE,
            timePeriod: 1,
            targetUnit: falsyValue as any,
          };

          metricDbService.getChartData.mockResolvedValue([]);

          // Should NOT validate because falsy values skip validation
          const result = await service.getChartData(queryDto);
          expect(result).toBeTruthy();
        }
      });
    });

    describe("Validation Error Structure", () => {
      it("should provide complete error details for invalid units", async () => {
        const createMetricDto: CreateMetricDto = {
          user_id: 1,
          metric_type: METRIC_TYPES.DISTANCE,
          value: 100,
          unit: "invalid_test_unit",
          date_recorded: "2024-01-15",
        };

        try {
          await service.createMetric(createMetricDto);
          fail("Expected BadRequestAppException to be thrown");
        } catch (error) {
          // Verify error structure completeness
          expect(error).toBeInstanceOf(BadRequestAppException);
          expect(error).toHaveProperty("errorCode");
          expect(error).toHaveProperty("message");
          expect(error).toHaveProperty("details");

          // Verify error content
          expect(error.errorCode).toBe(METRICS_ERROR_CODES.INVALID_UNIT);
          expect(error.message).toContain("invalid_test_unit");
          expect(error.message).toContain("distance");

          // Verify details structure
          expect(error.details).toHaveProperty("providedUnit");
          expect(error.details).toHaveProperty("validUnits");
          expect(error.details).toHaveProperty("metricType");

          // Verify details content
          expect(error.details.providedUnit).toBe("invalid_test_unit");
          expect(error.details.validUnits).toEqual(
            Object.values(DISTANCE_UNITS)
          );
          expect(error.details.metricType).toBe("distance");
          expect(Array.isArray(error.details.validUnits)).toBe(true);
          expect(error.details.validUnits.length).toBeGreaterThan(0);
        }
      });
    });
  });
});
