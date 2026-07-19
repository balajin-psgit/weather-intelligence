import React from "react";
import { 
  Sun, 
  CloudSun, 
  Cloud, 
  CloudFog, 
  CloudDrizzle, 
  CloudRain, 
  CloudSnow, 
  CloudRainWind, 
  CloudLightning, 
  HelpCircle,
  LucideIcon
} from "lucide-react";
import { CurrentWeather, DailyWeather, WeatherAlert } from "../types";

export interface WeatherUIConfig {
  label: string;
  icon: LucideIcon;
  bgGradient: string; // Tailwind gradient
  cardBg: string; // Glass background card color
  accentColor: string; // Accent color for text/borders
}

export function getWeatherUI(code: number, isDay: boolean = true): WeatherUIConfig {
  // Clear sky
  if (code === 0) {
    return {
      label: "Clear Sky",
      icon: Sun,
      bgGradient: isDay 
        ? "from-amber-400 via-orange-400 to-sky-500" 
        : "from-slate-900 via-indigo-950 to-slate-900",
      cardBg: isDay ? "bg-amber-500/10 border-amber-500/20" : "bg-indigo-500/10 border-indigo-500/20",
      accentColor: isDay ? "text-amber-500 border-amber-500" : "text-indigo-400 border-indigo-400",
    };
  }

  // Mainly clear, partly cloudy, overcast
  if (code >= 1 && code <= 3) {
    return {
      label: code === 1 ? "Mainly Clear" : code === 2 ? "Partly Cloudy" : "Overcast",
      icon: code === 3 ? Cloud : CloudSun,
      bgGradient: isDay 
        ? "from-sky-400 via-blue-400 to-slate-400" 
        : "from-slate-800 via-slate-900 to-indigo-950",
      cardBg: "bg-slate-500/10 border-slate-500/20",
      accentColor: "text-sky-400 border-sky-400",
    };
  }

  // Fog and depositing rime fog
  if (code === 45 || code === 48) {
    return {
      label: "Dense Fog",
      icon: CloudFog,
      bgGradient: "from-slate-400 to-zinc-500",
      cardBg: "bg-zinc-500/10 border-zinc-500/20",
      accentColor: "text-zinc-400 border-zinc-400",
    };
  }

  // Drizzle
  if (code === 51 || code === 53 || code === 55 || code === 56 || code === 57) {
    return {
      label: "Light Drizzle",
      icon: CloudDrizzle,
      bgGradient: "from-teal-600 via-slate-500 to-sky-600",
      cardBg: "bg-teal-500/10 border-teal-500/20",
      accentColor: "text-teal-400 border-teal-400",
    };
  }

  // Rain: Slight, moderate, heavy
  if (code === 61 || code === 63 || code === 65 || code === 66 || code === 67) {
    return {
      label: code === 61 ? "Slight Rain" : code === 63 ? "Moderate Rain" : "Heavy Downpour",
      icon: CloudRain,
      bgGradient: "from-blue-600 via-sky-700 to-slate-800",
      cardBg: "bg-blue-500/10 border-blue-500/20",
      accentColor: "text-blue-400 border-blue-400",
    };
  }

  // Snow fall: Slight, moderate, heavy
  if (code === 71 || code === 73 || code === 75 || code === 77) {
    return {
      label: "Snowfall",
      icon: CloudSnow,
      bgGradient: "from-sky-300 via-indigo-100 to-indigo-300 text-slate-800",
      cardBg: "bg-sky-500/10 border-sky-500/20",
      accentColor: "text-sky-300 border-sky-300",
    };
  }

  // Rain showers
  if (code === 80 || code === 81 || code === 82 || code === 85 || code === 86) {
    return {
      label: "Scattered Showers",
      icon: CloudRainWind,
      bgGradient: "from-indigo-600 via-blue-500 to-sky-700",
      cardBg: "bg-indigo-500/10 border-indigo-500/20",
      accentColor: "text-indigo-400 border-indigo-400",
    };
  }

  // Thunderstorm
  if (code === 95 || code === 96 || code === 99) {
    return {
      label: "Severe Thunderstorm",
      icon: CloudLightning,
      bgGradient: "from-slate-900 via-purple-950 to-slate-900",
      cardBg: "bg-purple-500/10 border-purple-500/20",
      accentColor: "text-purple-400 border-purple-400",
    };
  }

  // Default fallback
  return {
    label: "Unknown Weather",
    icon: HelpCircle,
    bgGradient: "from-slate-700 to-slate-900",
    cardBg: "bg-slate-500/10 border-slate-500/20",
    accentColor: "text-slate-400 border-slate-400",
  };
}

// Client-side fallback weather alerts based purely on forecast data
export function calculateLocalAlerts(current: CurrentWeather, daily: DailyWeather[]): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];

  // Check current temperature extremes
  if (current.temp >= 38) {
    alerts.push({
      severity: "critical",
      title: "Extreme Heat Warning",
      description: `Current temperature is extremely high at ${current.temp}°C. Prolonged exposure can lead to heat exhaustion or heat stroke.`,
      recommendedAction: "Stay indoors in air-conditioned environments, drink plenty of water, and avoid strenuous outdoor exercise."
    });
  } else if (current.temp >= 34) {
    alerts.push({
      severity: "high",
      title: "Heat Advisory",
      description: `High temperature of ${current.temp}°C detected. Heat index is elevated.`,
      recommendedAction: "Minimize direct sun exposure, wear lightweight loose clothing, and remain hydrated."
    });
  } else if (current.temp <= -5) {
    alerts.push({
      severity: "critical",
      title: "Severe Freeze Alert",
      description: `Temperature has dropped to dangerous levels of ${current.temp}°C. Frostbite risk is elevated.`,
      recommendedAction: "Dress in multiple warm insulated layers, protect exposed skin, and minimize outdoor exposure."
    });
  } else if (current.temp <= 2) {
    alerts.push({
      severity: "medium",
      title: "Freezing Conditions Warning",
      description: `Temperatures are hovering near or below freezing at ${current.temp}°C. Potential for frost and black ice.`,
      recommendedAction: "Use caution when walking or driving on bridges, walkways, and roads. Protect sensitive garden plants."
    });
  }

  // Check current wind speed
  if (current.windSpeed >= 45) {
    alerts.push({
      severity: "high",
      title: "Severe Gale Warning",
      description: `Extremely high current wind speed of ${current.windSpeed} km/h detected. High risk of debris and property damage.`,
      recommendedAction: "Secure lightweight outdoor items and stay indoors. Exercise extreme caution if driving high-profile vehicles."
    });
  } else if (current.windSpeed >= 30) {
    alerts.push({
      severity: "medium",
      title: "Wind Advisory",
      description: `Strong gusts of up to ${current.windSpeed} km/h can affect outdoor structures and make walking difficult.`,
      recommendedAction: "Secure lightweight outdoor patio furniture and take care when walking outdoors."
    });
  }

  // Check 7-day daily forecast for upcoming hazards
  const highRainDays = daily.filter(d => d.precipitationProbability >= 85 && d.precipitationSum >= 15);
  if (highRainDays.length > 0) {
    alerts.push({
      severity: "high",
      title: "Heavy Rainfall Forecasted",
      description: `Significant precipitation predicted on ${highRainDays[0].date} with a ${highRainDays[0].precipitationProbability}% probability of heavy downpours (${highRainDays[0].precipitationSum}mm).`,
      recommendedAction: "Keep umbrellas and rain gear handy, check drainage channels, and prepare for potential local urban flooding."
    });
  }

  const stormDays = daily.filter(d => d.weatherCode >= 95);
  if (stormDays.length > 0) {
    alerts.push({
      severity: "high",
      title: "Thunderstorms in Forecast",
      description: `Electrical thunderstorms with potential lightning strikes are forecasted for ${stormDays[0].date}.`,
      recommendedAction: "Unplug sensitive home electronics and avoid taking shelter under tall structures or trees when thunder rolls."
    });
  }

  const highUvDays = daily.filter(d => d.maxUvIndex && d.maxUvIndex >= 7);
  if (highUvDays.length > 0) {
    alerts.push({
      severity: "medium",
      title: "High UV Index Warning",
      description: `Very high solar UV radiation indices (up to ${highUvDays[0].maxUvIndex}) are forecast for this week.`,
      recommendedAction: "Apply high factor SPF broad-spectrum sunscreen, wear protective headwear and UV-rated sunglasses, and seek shade during peak solar noon hours."
    });
  }

  return alerts;
}
