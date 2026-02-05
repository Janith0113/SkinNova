import axios from 'axios';

export interface WeatherData {
  temperature: number;
  humidity: number;
  feelsLike: number;
  windSpeed: number;
  weatherCode: number;
  location: string;
  timestamp: Date;
  temperatureTrend?: 'warming' | 'cooling' | 'stable';
}

export interface TemperatureTrend {
  direction: 'warming' | 'cooling' | 'stable';
  rate: number; // degrees per hour
  forecast24h: number[]; // next 24 hours temp
}

/**
 * Fetch real-time weather data from Open-Meteo API (free, no API key needed)
 */
export const getWeatherData = async (
  latitude: number,
  longitude: number
): Promise<WeatherData> => {
  try {
    const weatherResponse = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,apparent_temperature&hourly=temperature_2m&temperature_unit=celsius&timezone=auto`
    );

    const current = weatherResponse.data.current;
    const hourly = weatherResponse.data.hourly;

    // Get location name using reverse geocoding
    let locationName = 'Your Location';
    try {
      const geoResponse = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      locationName =
        geoResponse.data.address?.city ||
        geoResponse.data.address?.town ||
        'Your Location';
    } catch (e) {
      // Keep default name
    }

    // Analyze temperature trend (check last 6 hours vs next 6 hours)
    const hourlyTemps = hourly.temperature_2m.slice(0, 24); // Next 24 hours
    const trend = analyzeTemperatureTrend(hourlyTemps);

    return {
      temperature: current.temperature_2m,
      humidity: current.relative_humidity_2m,
      feelsLike: current.apparent_temperature,
      windSpeed: current.wind_speed_10m,
      weatherCode: current.weather_code,
      location: locationName,
      timestamp: new Date(),
      temperatureTrend: trend.direction,
    };
  } catch (error) {
    console.error('Weather API error:', error);
    throw new Error('Unable to fetch weather data');
  }
};

/**
 * Analyze temperature trend using WMO (World Meteorological Organization) standard
 * WMO uses 12-hour temperature changes for trend classification
 * - Rapid warming: ≥2°C per 12 hours
 * - Moderate warming: 0.5-2°C per 12 hours
 * - Stable: -0.5 to +0.5°C per 12 hours
 * - Moderate cooling: -0.5 to -2°C per 12 hours
 * - Rapid cooling: ≥2°C drop per 12 hours
 */
export const analyzeTemperatureTrend = (
  hourlyTemps: number[]
): TemperatureTrend => {
  if (hourlyTemps.length < 2) {
    return {
      direction: 'stable',
      rate: 0,
      forecast24h: hourlyTemps,
    };
  }

  const currentTemp = hourlyTemps[0];
  // Use 12-hour period (WMO standard)
  const tempIn12Hours = hourlyTemps[12] || hourlyTemps[hourlyTemps.length - 1];

  // Calculate temperature change over 12 hours (WMO standard period)
  const temperatureChange = tempIn12Hours - currentTemp;

  // WMO classification: determine direction based on 12-hour change
  let direction: 'warming' | 'cooling' | 'stable';
  
  if (temperatureChange > 0.5) {
    direction = 'warming';
  } else if (temperatureChange < -0.5) {
    direction = 'cooling';
  } else {
    direction = 'stable';
  }

  // Rate in degrees per hour for reference
  const rate = parseFloat((temperatureChange / 12).toFixed(2));

  return {
    direction,
    rate, // degrees Celsius per hour
    forecast24h: hourlyTemps,
  };
};

/**
 * Get weather condition description from WMO code
 */
export const getWeatherCondition = (code: number): string => {
  if (code === 0 || code === 1) return 'Clear';
  if (code === 2) return 'Partly Cloudy';
  if (code === 3) return 'Overcast';
  if (code === 45 || code === 48) return 'Foggy';
  if (code >= 51 && code <= 67) return 'Drizzle';
  if (code >= 71 && code <= 85) return 'Snow';
  if (code >= 80 && code <= 82) return 'Rain Showers';
  if (code === 85 || code === 86) return 'Snow Showers';
  if (code >= 90 && code <= 99) return 'Thunderstorm';
  return 'Unknown';
};
