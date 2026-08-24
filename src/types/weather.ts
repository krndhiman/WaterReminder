// Weather Data & Hydration Calculation Types

export interface WeatherData {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  temperature: number; // in °C
  apparentTemperature: number; // Feels like in °C
  humidity: number; // in %
  uvIndex: number;
  windSpeed: number; // km/h
  weatherCode: number;
  conditionDescription: string;
  conditionIcon: string;
  isDay: boolean;
  fetchedAt: number; // timestamp
  recommendedAdjustmentMl: number; // calculated water intake offset
  scienceBreakdown: string[];
}

export interface CitySearchResult {
  id: number;
  name: string;
  country: string;
  admin1?: string; // State / Region
  latitude: number;
  longitude: number;
}
