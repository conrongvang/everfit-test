import { Injectable } from "@nestjs/common";
import {
  DISTANCE_CONVERSION_FACTORS,
  DistanceUnit,
  METRIC_TYPES,
  TEMPERATURE_CONVERTERS,
  TemperatureUnit,
} from "../constants/metric-units";

@Injectable()
export class UnitConversionService {
  convertDistance(
    value: number,
    fromUnit: DistanceUnit,
    toUnit: DistanceUnit
  ): number {
    if (fromUnit === toUnit) return value;

    // Convert to base unit (meter) first, then to target unit
    const valueInMeters = value * DISTANCE_CONVERSION_FACTORS[fromUnit];
    const convertedValue = valueInMeters / DISTANCE_CONVERSION_FACTORS[toUnit];

    return Math.round(convertedValue * 10000) / 10000; // Round to 4 decimal places
  }

  convertTemperature(
    value: number,
    fromUnit: TemperatureUnit,
    toUnit: TemperatureUnit
  ): number {
    if (fromUnit === toUnit) return value;

    const converter = TEMPERATURE_CONVERTERS[fromUnit][toUnit];
    const convertedValue = converter(value);

    return Math.round(convertedValue * 100) / 100; // Round to 2 decimal places
  }

  convertValue(
    value: number,
    fromUnit: string,
    toUnit: string,
    metricType: string
  ): number {
    if (metricType === METRIC_TYPES.DISTANCE) {
      return this.convertDistance(
        value,
        fromUnit as DistanceUnit,
        toUnit as DistanceUnit
      );
    } else if (metricType === METRIC_TYPES.TEMPERATURE) {
      return this.convertTemperature(
        value,
        fromUnit as TemperatureUnit,
        toUnit as TemperatureUnit
      );
    }

    return value;
  }
}
