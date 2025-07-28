export const DISTANCE_UNITS = {
  METER: "meter",
  CENTIMETER: "centimeter",
  INCH: "inch",
  FEET: "feet",
  YARD: "yard",
  MILE: "mile",
} as const;

export const TEMPERATURE_UNITS = {
  CELSIUS: "°C",
  FAHRENHEIT: "°F",
  KELVIN: "°K",
} as const;

export const METRIC_TYPES = {
  DISTANCE: "distance",
  TEMPERATURE: "temperature",
} as const;

export const DISTANCE_CONVERSION_FACTORS = {
  [DISTANCE_UNITS.METER]: 1,
  [DISTANCE_UNITS.CENTIMETER]: 0.01,
  [DISTANCE_UNITS.INCH]: 0.0254,
  [DISTANCE_UNITS.FEET]: 0.3048,
  [DISTANCE_UNITS.YARD]: 0.9144,
  [DISTANCE_UNITS.MILE]: 1609.34,
};

export const TEMPERATURE_CONVERTERS = {
  [TEMPERATURE_UNITS.CELSIUS]: {
    [TEMPERATURE_UNITS.CELSIUS]: (temp: number) => temp,
    [TEMPERATURE_UNITS.FAHRENHEIT]: (temp: number) => (temp * 9) / 5 + 32,
    [TEMPERATURE_UNITS.KELVIN]: (temp: number) => temp + 273.15,
  },
  [TEMPERATURE_UNITS.FAHRENHEIT]: {
    [TEMPERATURE_UNITS.CELSIUS]: (temp: number) => ((temp - 32) * 5) / 9,
    [TEMPERATURE_UNITS.FAHRENHEIT]: (temp: number) => temp,
    [TEMPERATURE_UNITS.KELVIN]: (temp: number) =>
      ((temp - 32) * 5) / 9 + 273.15,
  },
  [TEMPERATURE_UNITS.KELVIN]: {
    [TEMPERATURE_UNITS.CELSIUS]: (temp: number) => temp - 273.15,
    [TEMPERATURE_UNITS.FAHRENHEIT]: (temp: number) =>
      ((temp - 273.15) * 9) / 5 + 32,
    [TEMPERATURE_UNITS.KELVIN]: (temp: number) => temp,
  },
};

export type DistanceUnit = (typeof DISTANCE_UNITS)[keyof typeof DISTANCE_UNITS];
export type TemperatureUnit =
  (typeof TEMPERATURE_UNITS)[keyof typeof TEMPERATURE_UNITS];
export type MetricType = (typeof METRIC_TYPES)[keyof typeof METRIC_TYPES];
