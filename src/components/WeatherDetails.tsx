import React from "react";
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Compass, 
  Cloud, 
  Sunrise, 
  Sunset 
} from "lucide-react";
import { CurrentWeather, DailyWeather } from "../types";

interface WeatherDetailsProps {
  current: CurrentWeather;
  todayForecast?: DailyWeather;
}

export default function WeatherDetails({ current, todayForecast }: WeatherDetailsProps) {
  // Get wind direction cardinal label
  const getWindDirectionLabel = (deg: number) => {
    const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    const idx = Math.round(((deg %= 360) < 0 ? deg + 360 : deg) / 22.5) % 16;
    return directions[idx];
  };

  const details = [
    {
      id: "detail-apparent",
      label: "Feels Like",
      value: `${current.apparent.toFixed(1)}°C`,
      icon: Thermometer,
      color: "text-amber-400",
      description: current.apparent > current.temp ? "Feels warmer than actual temperature" : "Feels cooler than actual temperature",
    },
    {
      id: "detail-humidity",
      label: "Humidity",
      value: `${current.humidity}%`,
      icon: Droplets,
      color: "text-blue-400",
      description: current.humidity > 60 ? "Moist, high humidity atmosphere" : current.humidity < 35 ? "Dry air conditions" : "Comfortable moisture level",
    },
    {
      id: "detail-wind",
      label: "Wind Speed",
      value: `${current.windSpeed.toFixed(1)} km/h`,
      icon: Wind,
      color: "text-teal-400",
      description: `Blowing from the ${getWindDirectionLabel(current.windDirection)}`,
    },
    {
      id: "detail-clouds",
      label: "Cloud Cover",
      value: `${current.cloudCover}%`,
      icon: Cloud,
      color: "text-slate-400",
      description: current.cloudCover > 70 ? "Mostly cloudy or overcast skies" : current.cloudCover < 20 ? "Perfect clear sky view" : "Partially cloudy skies",
    },
    {
      id: "detail-sunrise",
      label: "Sunrise",
      value: todayForecast ? new Date(todayForecast.sunrise).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--",
      icon: Sunrise,
      color: "text-orange-400",
      description: "First ray of dawn light",
    },
    {
      id: "detail-sunset",
      label: "Sunset",
      value: todayForecast ? new Date(todayForecast.sunset).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--",
      icon: Sunset,
      color: "text-rose-400",
      description: "Dusk and transition to night",
    },
  ];

  return (
    <div id="weather-details-section" className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 shadow-2xl">
      <h3 id="weather-details-header" className="text-lg font-semibold text-slate-100 mb-6 flex items-center gap-2">
        <span className="w-1.5 h-5 rounded bg-blue-500"></span>
        Atmospheric Conditions
      </h3>
      
      <div id="weather-details-grid" className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {details.map((detail) => {
          const IconComponent = detail.icon;
          return (
            <div 
              key={detail.id}
              id={detail.id}
              className="bg-slate-800/40 border border-slate-700/30 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700/80 transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-400 tracking-wide uppercase">{detail.label}</span>
                <IconComponent className={`w-5 h-5 ${detail.color} transition-transform duration-300 group-hover:scale-110`} />
              </div>
              <div>
                <span className="text-2xl font-bold text-white tracking-tight">{detail.value}</span>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{detail.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
