export interface LocationData {
  name: string;
  country: string;
  country_code?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

export interface CurrentWeather {
  temp: number;
  apparent: number;
  weatherCode: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  cloudCover: number;
  isDay: boolean;
  time: string;
}

export interface DailyWeather {
  date: string;
  maxTemp: number;
  minTemp: number;
  apparentMaxTemp: number;
  apparentMinTemp: number;
  weatherCode: number;
  precipitationProbability: number;
  precipitationSum: number;
  maxWindSpeed: number;
  maxUvIndex?: number;
  sunrise: string;
  sunset: string;
}

export interface WeatherAlert {
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  recommendedAction: string;
}

export interface DailyRecommendation {
  date: string;
  activitySuitability: number; // 0 - 100
  suitabilityReason: string;
  clothingSuggestion: string;
  bestTimeOfDay: string;
}

export interface LifestyleIndex {
  index: number; // 1 - 10
  advice: string;
}

export interface WeatherIntelligence {
  planningSummary: string;
  extremeWeatherAlerts: WeatherAlert[];
  dailyRecommendations: DailyRecommendation[];
  activityInsight: string;
  lifestyleIndices: {
    outdoorRunning: LifestyleIndex;
    energyUsage: LifestyleIndex;
    gardening: LifestyleIndex;
    stargazing: LifestyleIndex;
  };
}
