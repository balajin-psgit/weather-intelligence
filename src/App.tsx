import React, { useState, useEffect } from "react";
import { 
  CloudSun, 
  Search, 
  MapPin, 
  Navigation, 
  AlertTriangle, 
  Sparkles, 
  CloudRain, 
  Thermometer, 
  Wind, 
  Droplets,
  RotateCcw,
  Settings,
  X,
  HelpCircle,
  Clock
} from "lucide-react";
import { 
  LocationData, 
  CurrentWeather, 
  DailyWeather, 
  WeatherAlert, 
  WeatherIntelligence 
} from "./types";
import { getWeatherUI, calculateLocalAlerts } from "./utils/weatherUtils";
import WeatherDetails from "./components/WeatherDetails";
import WeeklyForecast from "./components/WeeklyForecast";
import AlertsPanel from "./components/AlertsPanel";
import LifestyleInsights from "./components/LifestyleInsights";
import ActivityPlanner from "./components/ActivityPlanner";

// List of awesome default cities to populate if search is blank
const POPULAR_CITIES: LocationData[] = [
  { name: "San Francisco", country: "United States", admin1: "California", latitude: 37.7749, longitude: -122.4194, country_code: "US" },
  { name: "London", country: "United Kingdom", admin1: "England", latitude: 51.5074, longitude: -0.1278, country_code: "GB" },
  { name: "Tokyo", country: "Japan", admin1: "Tokyo", latitude: 35.6762, longitude: 139.6503, country_code: "JP" },
  { name: "Sydney", country: "Australia", admin1: "New South Wales", latitude: -33.8688, longitude: 151.2093, country_code: "AU" },
  { name: "Paris", country: "France", admin1: "Île-de-France", latitude: 48.8566, longitude: 2.3522, country_code: "FR" },
];

export default function App() {
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Active weather data
  const [activeLocation, setActiveLocation] = useState<LocationData>(POPULAR_CITIES[0]);
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
  const [dailyForecast, setDailyForecast] = useState<DailyWeather[]>([]);
  const [isWeatherDataLoading, setIsWeatherDataLoading] = useState(false);

  // Intelligence state
  const [intelligence, setIntelligence] = useState<WeatherIntelligence | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [customActivity, setCustomActivity] = useState("");
  const [configError, setConfigError] = useState<string | null>(null);

  // Aggregate Alerts (calculated client-side + loaded from Gemini)
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);

  // Clock State for Header
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch weather data when active location changes
  useEffect(() => {
    fetchWeatherData(activeLocation);
  }, [activeLocation]);

  // Geocoding handler
  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (val.trim().length < 3) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(val)}&count=5&language=en&format=json`
      );
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const locations: LocationData[] = data.results.map((item: any) => ({
          name: item.name,
          country: item.country || "",
          admin1: item.admin1 || "",
          country_code: item.country_code || "",
          latitude: item.latitude,
          longitude: item.longitude,
        }));
        setSearchResults(locations);
        setShowDropdown(true);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Geocoding failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Select Location
  const selectLocation = (loc: LocationData) => {
    setActiveLocation(loc);
    setSearchQuery("");
    setShowDropdown(false);
    setCustomActivity(""); // Reset planner activity for new city
  };

  // Fetch weather data from Open-Meteo
  const fetchWeatherData = async (loc: LocationData) => {
    setIsWeatherDataLoading(true);
    setConfigError(null);
    try {
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,rain_sum,showers_sum,snowfall_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;
      
      const res = await fetch(weatherUrl);
      const data = await res.json();

      if (!data.current || !data.daily) {
        throw new Error("Invalid weather data response.");
      }

      const current: CurrentWeather = {
        temp: data.current.temperature_2m,
        apparent: data.current.apparent_temperature,
        weatherCode: data.current.weather_code,
        humidity: data.current.relative_humidity_2m,
        windSpeed: data.current.wind_speed_10m,
        windDirection: data.current.wind_direction_10m,
        cloudCover: data.current.cloud_cover,
        isDay: data.current.is_day === 1,
        time: data.current.time,
      };

      const forecast: DailyWeather[] = data.daily.time.map((timeStr: string, idx: number) => ({
        date: timeStr,
        maxTemp: data.daily.temperature_2m_max[idx],
        minTemp: data.daily.temperature_2m_min[idx],
        apparentMaxTemp: data.daily.apparent_temperature_max[idx],
        apparentMinTemp: data.daily.apparent_temperature_min[idx],
        weatherCode: data.daily.weather_code[idx],
        precipitationProbability: data.daily.precipitation_probability_max[idx] || 0,
        precipitationSum: data.daily.precipitation_sum[idx] || 0,
        maxWindSpeed: data.daily.wind_speed_10m_max[idx] || 0,
        maxUvIndex: data.daily.uv_index_max[idx] || 0,
        sunrise: data.daily.sunrise[idx],
        sunset: data.daily.sunset[idx],
      }));

      setCurrentWeather(current);
      setDailyForecast(forecast);

      // Perform local safety calculations immediately
      const clientAlerts = calculateLocalAlerts(current, forecast);
      setAlerts(clientAlerts);

      // Trigger AI recommendation flow based on weather data
      fetchAiIntelligence(current, forecast, loc, "");

    } catch (err: any) {
      console.error("Failed to load meteo forecast:", err);
    } finally {
      setIsWeatherDataLoading(false);
    }
  };

  // Fetch AI Planning & Intelligence Insights via Server Endpoint
  const fetchAiIntelligence = async (
    current: CurrentWeather,
    forecast: DailyWeather[],
    loc: LocationData,
    customAct: string
  ) => {
    setIsAiLoading(true);
    setConfigError(null);
    try {
      const response = await fetch("/api/weather/intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentWeather: current,
          dailyForecast: forecast,
          location: loc,
          customActivity: customAct,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.isConfigError) {
          setConfigError("Gemini API key is unconfigured. Showing standard local alerts.");
        } else {
          throw new Error(result.error || "Failed to analyze weather patterns.");
        }
        return;
      }

      setIntelligence(result);

      // Aggregate alerts: Combine local heuristics with Gemini-derived warnings, avoiding duplicates
      const localWarnings = calculateLocalAlerts(current, forecast);
      const aiWarnings: WeatherAlert[] = result.extremeWeatherAlerts || [];
      const combinedAlerts = [...localWarnings];

      aiWarnings.forEach((aiAlert) => {
        const isDuplicate = combinedAlerts.some(
          (locAlert) => 
            locAlert.title.toLowerCase().includes(aiAlert.title.toLowerCase()) ||
            aiAlert.title.toLowerCase().includes(locAlert.title.toLowerCase())
        );
        if (!isDuplicate) {
          combinedAlerts.push(aiAlert);
        }
      });

      setAlerts(combinedAlerts);

    } catch (err: any) {
      console.error("Failed to fetch AI insights:", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  // User manually triggers a custom planning task
  const handleCustomPlanRequest = () => {
    if (!currentWeather || dailyForecast.length === 0) return;
    fetchAiIntelligence(currentWeather, dailyForecast, activeLocation, customActivity);
  };

  const weatherConfig = currentWeather ? getWeatherUI(currentWeather.weatherCode, currentWeather.isDay) : null;
  const WeatherIcon = weatherConfig?.icon;

  return (
    <div className="min-h-screen bg-[#0b1329] text-slate-100 flex flex-col font-sans selection:bg-blue-500/30 selection:text-blue-200">
      
      {/* Upper Navigation Rail */}
      <header id="main-header" className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <CloudSun className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl md:text-2xl font-bold tracking-tight">
              METEO<span className="text-blue-500 font-light">INTEL</span>
            </span>
          </div>

          {/* Quick city presets */}
          <div id="popular-presets" className="hidden md:flex items-center gap-2">
            {POPULAR_CITIES.map((city) => (
              <button
                key={city.name}
                id={`preset-${city.name.toLowerCase().replace(" ", "-")}`}
                onClick={() => selectLocation(city)}
                className={`text-xs px-3.5 py-1.5 rounded-full border transition-all duration-200 cursor-pointer ${
                  activeLocation.name === city.name
                    ? "bg-blue-500/20 border-blue-500/40 text-blue-300 font-semibold"
                    : "bg-slate-800/40 border-slate-700/50 hover:border-slate-600 text-slate-400 hover:text-slate-200"
                }`}
              >
                {city.name}
              </button>
            ))}
          </div>

          {/* Date & Time Dynamic Output */}
          <div className="text-right shrink-0">
            <p className="text-[10px] md:text-xs text-slate-400 font-semibold uppercase tracking-widest leading-none">
              {currentTime.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
            </p>
            <p className="text-sm md:text-base font-bold text-white tracking-tight mt-1 font-mono leading-none">
              {currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </p>
          </div>
        </div>
      </header>

      {/* Main Responsive Grid Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6 md:space-y-8">
        
        {/* API Key Missing Graceful Warning Box */}
        {configError && (
          <div id="api-key-warning" className="bg-amber-950/20 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3 text-amber-200 text-xs">
            <AlertTriangle className="w-4.5 h-4.5 shrink-0 text-amber-400" />
            <div>
              <strong className="font-semibold text-amber-300">Weather Intelligence key is unconfigured:</strong>
              <p className="mt-1 leading-relaxed text-amber-300/80">
                You are currently viewing standard Open-Meteo weather parameters, temperature charts, and local safety rules. 
                To activate personalized weekly AI summaries, lifestyle optimizations, and custom activity scheduling, please open 
                <span className="font-semibold text-amber-300"> Settings &gt; Secrets</span> and set your <span className="font-mono bg-slate-900/60 px-1 py-0.5 rounded border border-slate-800">GEMINI_API_KEY</span>.
              </p>
            </div>
          </div>
        )}

        {/* Search, Status and Hero Board */}
        <section id="location-hero" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Search Form and Active Spot Summary */}
          <div className="lg:col-span-5 flex flex-col gap-6 h-full justify-between">
            
            {/* Elegant Search bar */}
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-5 relative shadow-lg">
              <label htmlFor="city-search-input" className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2.5">
                Forecast Location
              </label>
              
              <div className="relative">
                <input
                  id="city-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search city name..."
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2.5 pl-11 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
                />
                <Search className="absolute left-4 top-3 w-5 h-5 text-slate-400" />
                {isSearching && (
                  <div className="absolute right-4 top-3.5 w-4 h-4 border-2 border-slate-800 border-t-blue-500 rounded-full animate-spin"></div>
                )}
              </div>

              {/* Autocomplete Droplist */}
              {showDropdown && searchResults.length > 0 && (
                <div id="search-dropdown-menu" className="absolute left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50">
                  <div className="px-4 py-2 border-b border-slate-800 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Matching Locations
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {searchResults.map((item, idx) => (
                      <button
                        key={`result-${idx}`}
                        id={`search-result-${idx}`}
                        onClick={() => selectLocation(item)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800/60 text-left transition-all border-b border-slate-800/40 last:border-0 cursor-pointer"
                      >
                        <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                        <div>
                          <div className="text-sm font-semibold text-slate-100">{item.name}</div>
                          <div className="text-xs text-slate-400">
                            {[item.admin1, item.country].filter(Boolean).join(", ")}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Main Visual Current Temperature Board */}
            {currentWeather && weatherConfig && (
              <div 
                id="main-temperature-board"
                className={`bg-gradient-to-br ${weatherConfig.bgGradient} rounded-3xl p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden text-white min-h-[220px] transition-all duration-500`}
              >
                {/* Visual decoration overlay */}
                <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-white/5 rounded-full blur-xl pointer-events-none"></div>

                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full w-max text-[11px] font-semibold border border-white/10 uppercase tracking-wider">
                      <Navigation className="w-3 h-3 fill-current rotate-45" />
                      <span>{activeLocation.name}</span>
                    </div>
                    <span className="text-xs text-white/70 block mt-2 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Lat: {activeLocation.latitude.toFixed(2)}, Lon: {activeLocation.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold tracking-widest uppercase bg-white/20 border border-white/15 px-2.5 py-0.5 rounded-full">
                      {weatherConfig.label}
                    </span>
                  </div>
                </div>

                <div className="flex items-end justify-between mt-8 relative z-10">
                  <div className="flex items-baseline gap-1">
                    <h1 id="hero-temp-text" className="text-6xl md:text-7xl font-black tracking-tighter leading-none font-mono">
                      {Math.round(currentWeather.temp)}
                    </h1>
                    <span className="text-3xl font-light">°C</span>
                  </div>

                  <div className="flex flex-col items-center">
                    {WeatherIcon && (
                      <WeatherIcon className="w-16 h-16 drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)] animate-pulse" />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: AI weekly briefing cards */}
          <div className="lg:col-span-7 h-full">
            <div id="ai-briefing-panel" className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 shadow-2xl h-full flex flex-col justify-between">
              <div>
                <h3 id="briefing-header" className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  AI Weekly Meteorological Intelligence
                </h3>

                {isWeatherDataLoading || isAiLoading ? (
                  <div className="space-y-4 py-8">
                    <div className="h-4 bg-slate-800 rounded-full w-2/3 animate-pulse"></div>
                    <div className="h-3 bg-slate-800 rounded-full w-full animate-pulse"></div>
                    <div className="h-3 bg-slate-800 rounded-full w-5/6 animate-pulse"></div>
                    <div className="h-3 bg-slate-800 rounded-full w-4/5 animate-pulse"></div>
                  </div>
                ) : intelligence ? (
                  <div id="briefing-content">
                    <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/40 p-4 border border-slate-800/80 rounded-2xl">
                      {intelligence.planningSummary}
                    </p>
                    
                    {/* Key takeaways chips */}
                    <div className="flex flex-wrap gap-2.5 mt-5">
                      <span className="text-[11px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-3 py-1 rounded-full">
                        🏃‍♂️ Run Score: {intelligence.lifestyleIndices.outdoorRunning.index}/10
                      </span>
                      <span className="text-[11px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-3 py-1 rounded-full">
                        🌱 Gardening: {intelligence.lifestyleIndices.gardening.index}/10
                      </span>
                      <span className="text-[11px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20 px-3 py-1 rounded-full">
                        🔋 Energy Efficiency: {intelligence.lifestyleIndices.energyUsage.index}/10
                      </span>
                      <span className="text-[11px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-3 py-1 rounded-full">
                        🌌 Stargazing clear: {intelligence.lifestyleIndices.stargazing.index}/10
                      </span>
                    </div>
                  </div>
                ) : (
                  <div id="briefing-unconfigured-fallback" className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/20">
                    <CloudSun className="w-12 h-12 text-slate-500 mb-3" />
                    <span className="text-sm font-semibold text-slate-300">Meteorological analysis offline</span>
                    <p className="text-xs text-slate-400 max-w-sm mt-1">
                      Setup your Gemini API key inside secrets to unlock daily atmospheric summaries and predictive travel indexes.
                    </p>
                  </div>
                )}
              </div>

              {currentWeather && (
                <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>Last update: {new Date(currentWeather.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <button 
                    onClick={() => fetchWeatherData(activeLocation)}
                    disabled={isWeatherDataLoading}
                    className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${isWeatherDataLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Detailed Dashboard Widgets Grid */}
        <section id="dashboard-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
          
          {/* Left Column widgets (7-day forecast & Weather Details) */}
          <div className="lg:col-span-7 flex flex-col gap-6 md:gap-8">
            {dailyForecast.length > 0 && (
              <WeeklyForecast daily={dailyForecast} />
            )}

            {currentWeather && (
              <WeatherDetails current={currentWeather} todayForecast={dailyForecast[0]} />
            )}
          </div>

          {/* Right Column widgets (Alerts, Lifestyle, Custom Planner) */}
          <div className="lg:col-span-5 flex flex-col gap-6 md:gap-8">
            
            {/* Extreme Conditions alerts panel */}
            <AlertsPanel alerts={alerts} isAiLoading={isAiLoading} />

            {/* Lifestyle Optimization Indices */}
            <LifestyleInsights intelligence={intelligence} isLoading={isAiLoading} />

            {/* Smart Activity Planner AI module */}
            <ActivityPlanner
              intelligence={intelligence}
              customActivity={customActivity}
              setCustomActivity={setCustomActivity}
              onPlanRequest={handleCustomPlanRequest}
              isLoading={isAiLoading}
            />

          </div>
        </section>

      </main>

      {/* Humble, visually polished page footer */}
      <footer id="main-footer" className="border-t border-slate-800 bg-slate-900/60 backdrop-blur-md mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          <p>© 2026 Weather Intelligence. Meteorological forecasts served via Open-Meteo. Smart planning recommendations by Google Gemini 3.5 Flash.</p>
          <div className="mt-2.5 flex items-center justify-center gap-4 text-[11px]">
            <a href="https://open-meteo.com/" target="_blank" rel="noreferrer" className="hover:text-slate-300 underline">Open-Meteo API</a>
            <span>•</span>
            <span className="text-slate-600">Secure Full-Stack Node Proxied Environment</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
