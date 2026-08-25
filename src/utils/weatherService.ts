import { WeatherData, CitySearchResult } from '../types/weather';

const WEATHER_STORAGE_KEY = 'aquaflow_weather_cache_v3';

// Open-Meteo Weather Code interpretation
export const interpretWeatherCode = (code: number, isDay: boolean = true): { text: string; icon: string } => {
  switch (code) {
    case 0:
      return { text: 'Clear Sky', icon: isDay ? '☀️' : '🌙' };
    case 1:
    case 2:
      return { text: 'Mainly Clear / Partly Cloudy', icon: isDay ? '🌤️' : '☁️' };
    case 3:
      return { text: 'Overcast', icon: '☁️' };
    case 45:
    case 48:
      return { text: 'Foggy / Hazy', icon: '🌫️' };
    case 51:
    case 53:
    case 55:
      return { text: 'Light Drizzle', icon: '🌦️' };
    case 61:
    case 63:
    case 65:
      return { text: 'Rain', icon: '🌧️' };
    case 71:
    case 73:
    case 75:
      return { text: 'Snowfall', icon: '❄️' };
    case 80:
    case 81:
    case 82:
      return { text: 'Rain Showers', icon: '🌧️' };
    case 95:
    case 96:
    case 99:
      return { text: 'Thunderstorm', icon: '⛈️' };
    default:
      return { text: 'Clear', icon: isDay ? '☀️' : '🌙' };
  }
};

// Calculate scientific water intake compensation based on real meteorological metrics (ACSM & EFSA standards)
export const calculateWeatherHydrationAdjustment = (
  temp: number,
  apparentTemp: number,
  humidity: number,
  uvIndex: number
): { adjustmentMl: number; reasons: string[] } => {
  let adjustment = 0;
  const reasons: string[] = [];

  // Effective thermal temperature: blend ambient temperature with feels-like (apparent temp)
  // In warm/hot weather (>= 26°C), heat index elevates cutaneous vasodilation and sweat rate.
  // In mild/cool weather, high humidity actually prevents dehydration by lowering respiratory vapor loss.
  const effectiveTemp =
    temp >= 26
      ? Math.max(temp, temp * 0.4 + apparentTemp * 0.6)
      : temp;

  // 1. Thermal Load & Insensible Perspiration Compensation (Physiologically calibrated)
  if (effectiveTemp >= 38) {
    const heatAdd = Math.min(650, 400 + Math.round((effectiveTemp - 38) * 50));
    adjustment += heatAdd;
    reasons.push(`🔥 Extreme Heat (${effectiveTemp.toFixed(1)}°C thermal load): Elevated thermoregulatory sweat compensation (+${heatAdd} ml).`);
  } else if (effectiveTemp >= 32) {
    const heatAdd = Math.round(200 + (effectiveTemp - 32) * 35);
    adjustment += heatAdd;
    reasons.push(`☀️ High Temperature (${effectiveTemp.toFixed(1)}°C feels like): Moderate sweat loss compensation (+${heatAdd} ml).`);
  } else if (effectiveTemp >= 25) {
    const warmAdd = Math.round((effectiveTemp - 24) * 25);
    adjustment += warmAdd;
    reasons.push(`🌤️ Warm Weather (${effectiveTemp.toFixed(1)}°C): Mild insensible perspiration (+${warmAdd} ml).`);
  } else if (effectiveTemp <= 5) {
    adjustment += 100;
    reasons.push(`❄️ Cold Weather (${effectiveTemp.toFixed(1)}°C): Respiratory vapor loss and cold diuresis (+100 ml).`);
  } else {
    reasons.push(`🍃 Mild Comfort Zone (${effectiveTemp.toFixed(1)}°C): Standard baseline hydration is optimal (0 ml added).`);
  }

  // 2. Humidity Factors (Air dryness vs vapor saturation)
  if (humidity <= 25) {
    // Very dry ambient air accelerates skin evaporation
    adjustment += 100;
    reasons.push(`💨 Dry Ambient Air (${humidity}%): Accelerates transepidermal water loss (+100 ml).`);
  }

  // 3. Solar UV Radiation Load
  if (uvIndex >= 8 && effectiveTemp >= 28) {
    adjustment += 100;
    reasons.push(`☀️ High Solar UV Index (${uvIndex}): Elevates metabolic heat dissipation load (+100 ml).`);
  }

  // Strict Physiological Safety Cap: Ambient weather alone should never exceed +650 ml/day
  // to protect against excessive fluid intake and dilutional hyponatremia.
  const boundedAdjustment = Math.min(650, Math.max(0, Math.round(adjustment)));

  return { adjustmentMl: boundedAdjustment, reasons };
};

// Search cities using Open-Meteo Geocoding
export const searchCities = async (query: string): Promise<CitySearchResult[]> => {
  if (!query || query.trim().length < 2) return [];

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      query.trim()
    )}&count=5&language=en&format=json`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to search city');
    const data = await res.json();

    if (!data.results || !Array.isArray(data.results)) return [];

    return data.results.map((r: any) => ({
      id: r.id,
      name: r.name,
      country: r.country || '',
      admin1: r.admin1 || '',
      latitude: r.latitude,
      longitude: r.longitude,
    }));
  } catch (err) {
    console.error('City search error:', err);
    return [];
  }
};

// Fetch real-time weather by coordinates
export const fetchWeatherByCoords = async (
  lat: number,
  lon: number,
  cityName: string = 'Current Location',
  countryName: string = ''
): Promise<WeatherData> => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,uv_index,surface_pressure&timezone=auto&models=best_match&forecast_days=1`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch weather data');
  const data = await res.json();

  const current = data.current;
  const temp = current.temperature_2m;
  const appTemp = current.apparent_temperature;
  const humidity = current.relative_humidity_2m;
  const uv = current.uv_index || 0;
  const wind = current.wind_speed_10m || 0;
  const weatherCode = current.weather_code || 0;
  const isDay = current.is_day === 1;

  const { text, icon } = interpretWeatherCode(weatherCode, isDay);
  const { adjustmentMl, reasons } = calculateWeatherHydrationAdjustment(temp, appTemp, humidity, uv);

  const weatherObj: WeatherData = {
    city: cityName,
    country: countryName,
    latitude: lat,
    longitude: lon,
    temperature: Math.round(temp * 10) / 10,
    apparentTemperature: Math.round(appTemp * 10) / 10,
    humidity: Math.round(humidity),
    uvIndex: Math.round(uv * 10) / 10,
    windSpeed: Math.round(wind),
    weatherCode,
    conditionDescription: text,
    conditionIcon: icon,
    isDay,
    fetchedAt: Date.now(),
    recommendedAdjustmentMl: adjustmentMl,
    scienceBreakdown: reasons,
  };

  saveWeatherCache(weatherObj);
  return weatherObj;
};

export const loadWeatherCache = (): WeatherData | null => {
  try {
    const raw = localStorage.getItem(WEATHER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const saveWeatherCache = (data: WeatherData) => {
  try {
    localStorage.setItem(WEATHER_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save weather cache', e);
  }
};
