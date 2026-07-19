import React, { useState } from "react";
import { CloudRain, Wind, AlertTriangle, ChevronRight, Calendar } from "lucide-react";
import { DailyWeather } from "../types";
import { getWeatherUI } from "../utils/weatherUtils";

interface WeeklyForecastProps {
  daily: DailyWeather[];
}

export default function WeeklyForecast({ daily }: WeeklyForecastProps) {
  const [hoveredDayIdx, setHoveredDayIdx] = useState<number | null>(null);

  // SVG Dimensioning and Coordinate Calculations
  const viewBoxWidth = 600;
  const viewBoxHeight = 120;
  const paddingX = 40;
  const paddingY = 25;

  const maxTemps = daily.map((d) => d.maxTemp);
  const minTemps = daily.map((d) => d.minTemp);
  const absoluteMax = Math.max(...maxTemps);
  const absoluteMin = Math.min(...minTemps);
  const tempRange = absoluteMax - absoluteMin || 1;

  // Compute (x, y) coordinates for a given index and temperature
  const getCoordinates = (index: number, temp: number) => {
    const stepX = (viewBoxWidth - paddingX * 2) / 6;
    const x = paddingX + index * stepX;
    
    // Invert Y coordinate so higher temp is higher up in visual space
    const graphHeight = viewBoxHeight - paddingY * 2;
    const y = paddingY + graphHeight - ((temp - absoluteMin) / tempRange) * graphHeight;
    return { x, y };
  };

  const maxPoints = daily.map((day, i) => getCoordinates(i, day.maxTemp));
  const minPoints = daily.map((day, i) => getCoordinates(i, day.minTemp));

  // Build SVG path strings
  const getPathString = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return "";
    return points.reduce((path, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`;
    }, "");
  };

  const maxPath = getPathString(maxPoints);
  const minPath = getPathString(minPoints);

  const formatDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    }
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div id="weekly-forecast-container" className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 shadow-2xl">
      <h3 id="forecast-header" className="text-lg font-semibold text-slate-100 mb-6 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-5 rounded bg-blue-500"></span>
          7-Day Visual Forecast
        </span>
        <span className="text-xs text-slate-400 font-normal flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" /> Next 7 days
        </span>
      </h3>

      {/* SVG Temperature Trend Chart */}
      <div id="temp-trend-chart-container" className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4 mb-6 relative overflow-hidden">
        <div className="absolute top-2 left-3 flex items-center gap-4 text-[10px] font-medium uppercase tracking-wider text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block shadow-[0_0_8px_rgba(251,191,36,0.5)]"></span> High Trend
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block shadow-[0_0_8px_rgba(56,189,248,0.5)]"></span> Low Trend
          </span>
        </div>

        <div className="w-full h-32 md:h-40">
          <svg 
            id="temp-trend-svg"
            viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} 
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="maxTempGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="minTempGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid vertical lines */}
            {daily.map((_, i) => {
              const x = paddingX + i * ((viewBoxWidth - paddingX * 2) / 6);
              return (
                <line
                  key={`v-grid-${i}`}
                  x1={x}
                  y1={0}
                  x2={x}
                  y2={viewBoxHeight}
                  stroke="#1e293b"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
              );
            })}

            {/* Filled Areas under the lines */}
            {maxPoints.length > 0 && (
              <path
                d={`${maxPath} L ${maxPoints[maxPoints.length - 1].x} ${viewBoxHeight} L ${maxPoints[0].x} ${viewBoxHeight} Z`}
                fill="url(#maxTempGrad)"
              />
            )}
            {minPoints.length > 0 && (
              <path
                d={`${minPath} L ${minPoints[minPoints.length - 1].x} ${viewBoxHeight} L ${minPoints[0].x} ${viewBoxHeight} Z`}
                fill="url(#minTempGrad)"
              />
            )}

            {/* Trend Lines */}
            <path
              d={maxPath}
              fill="none"
              stroke="#fbbf24"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="drop-shadow-[0_2px_8px_rgba(251,191,36,0.4)]"
            />
            <path
              d={minPath}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2"
              strokeLinecap="round"
              className="drop-shadow-[0_2px_8px_rgba(56,189,248,0.3)]"
            />

            {/* Data Nodes & Label Renderings */}
            {maxPoints.map((p, i) => {
              const isHovered = hoveredDayIdx === i;
              return (
                <g key={`max-node-${i}`} className="cursor-pointer">
                  {/* Glowing halo for hovered day */}
                  {isHovered && (
                    <circle cx={p.x} cy={p.y} r="8" fill="#fbbf24" fillOpacity="0.3" />
                  )}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isHovered ? "5" : "3.5"}
                    fill="#fbbf24"
                    stroke="#020617"
                    strokeWidth="1.5"
                    className="transition-all duration-200"
                  />
                  <text
                    x={p.x}
                    y={p.y - 8}
                    textAnchor="middle"
                    fill="#f8fafc"
                    fontSize="10"
                    fontWeight="600"
                    className="select-none font-mono"
                  >
                    {Math.round(daily[i].maxTemp)}°
                  </text>
                </g>
              );
            })}

            {/* Min points nodes and labels */}
            {minPoints.map((p, i) => {
              const isHovered = hoveredDayIdx === i;
              return (
                <g key={`min-node-${i}`} className="cursor-pointer">
                  {/* Glowing halo for hovered day */}
                  {isHovered && (
                    <circle cx={p.x} cy={p.y} r="8" fill="#38bdf8" fillOpacity="0.3" />
                  )}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isHovered ? "5" : "3.5"}
                    fill="#38bdf8"
                    stroke="#020617"
                    strokeWidth="1.5"
                    className="transition-all duration-200"
                  />
                  <text
                    x={p.x}
                    y={p.y + 13}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="10"
                    fontWeight="500"
                    className="select-none font-mono"
                  >
                    {Math.round(daily[i].minTemp)}°
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Row-Based Forecast Listing */}
      <div id="weekly-rows-list" className="space-y-2.5">
        {daily.map((day, i) => {
          const config = getWeatherUI(day.weatherCode);
          const WeatherIcon = config.icon;
          const isHovered = hoveredDayIdx === i;

          return (
            <div
              key={`row-${day.date}`}
              id={`forecast-row-${i}`}
              className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 ${
                isHovered
                  ? "bg-slate-800/80 border-slate-700/80 translate-x-1"
                  : "bg-slate-800/30 border-slate-800/40 hover:bg-slate-800/50"
              }`}
              onMouseEnter={() => setHoveredDayIdx(i)}
              onMouseLeave={() => setHoveredDayIdx(null)}
            >
              {/* Day Label & Date */}
              <div className="flex items-center gap-4 w-1/4 min-w-[90px]">
                <div>
                  <div className="font-semibold text-slate-100 text-sm leading-tight">
                    {formatDayName(day.date)}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {formatDateLabel(day.date)}
                  </div>
                </div>
              </div>

              {/* Weather Status & Icon */}
              <div className="flex items-center gap-2 w-1/3">
                <div className={`p-1.5 rounded-xl bg-slate-900/60 border border-slate-700/30 ${config.accentColor}`}>
                  <WeatherIcon className="w-5 h-5" />
                </div>
                <span className="text-xs text-slate-200 font-medium truncate hidden sm:inline">
                  {config.label}
                </span>
              </div>

              {/* Precipitation & Wind Quick Info */}
              <div className="flex items-center justify-end gap-4 w-1/4 text-right">
                {day.precipitationProbability > 0 && (
                  <div className="flex items-center gap-1 text-[11px] font-medium text-sky-400 font-mono">
                    <CloudRain className="w-3.5 h-3.5 shrink-0" />
                    <span>{day.precipitationProbability}%</span>
                  </div>
                )}
                <div className="hidden md:flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                  <Wind className="w-3.5 h-3.5 shrink-0" />
                  <span>{Math.round(day.maxWindSpeed)} km/h</span>
                </div>
              </div>

              {/* Min / Max Temperature badge */}
              <div className="flex items-center justify-end gap-2.5 pl-2 font-mono text-sm">
                <span className="font-semibold text-slate-100 min-w-[28px] text-right">
                  {Math.round(day.maxTemp)}°
                </span>
                <span className="text-slate-500 text-xs font-normal">/</span>
                <span className="text-slate-400 min-w-[28px] text-right">
                  {Math.round(day.minTemp)}°
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
