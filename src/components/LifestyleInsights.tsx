import React from "react";
import { Footprints, Zap, Sprout, Telescope } from "lucide-react";
import { WeatherIntelligence } from "../types";

interface LifestyleInsightsProps {
  intelligence: WeatherIntelligence | null;
  isLoading: boolean;
}

export default function LifestyleInsights({ intelligence, isLoading }: LifestyleInsightsProps) {
  // Safe default indices if AI response hasn't loaded yet
  const defaultIndices = {
    outdoorRunning: { index: 7, advice: "Calculate conditions by putting in your location. Perfect temperature for runs usually ranges between 10°C and 22°C." },
    energyUsage: { index: 8, advice: "Moderate ambient temperatures allow lower dependence on heating and cooling systems, saving utility costs." },
    gardening: { index: 6, advice: "Frost alerts and direct sun radiation dictate optimal watering and seedling placement. Check forecast trends." },
    stargazing: { index: 5, advice: "Cloud coverage and atmospheric moisture determine celestial visibility. Clear nights offer prime views." }
  };

  const data = intelligence?.lifestyleIndices ?? defaultIndices;

  const categories = [
    {
      id: "index-running",
      title: "Outdoor Running",
      index: data.outdoorRunning.index,
      advice: data.outdoorRunning.advice,
      icon: Footprints,
      color: "from-emerald-500/10 to-teal-500/10 border-emerald-500/20",
      accent: "text-emerald-400",
      progressColor: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]",
    },
    {
      id: "index-energy",
      title: "HVAC Energy Saver",
      index: data.energyUsage.index,
      advice: data.energyUsage.advice,
      icon: Zap,
      color: "from-amber-500/10 to-orange-500/10 border-amber-500/20",
      accent: "text-amber-400",
      progressColor: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]",
    },
    {
      id: "index-gardening",
      title: "Gardening & Crops",
      index: data.gardening.index,
      advice: data.gardening.advice,
      icon: Sprout,
      color: "from-green-500/10 to-emerald-500/10 border-green-500/20",
      accent: "text-green-400",
      progressColor: "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]",
    },
    {
      id: "index-stargazing",
      title: "Stargazing Visibility",
      index: data.stargazing.index,
      advice: data.stargazing.advice,
      icon: Telescope,
      color: "from-indigo-500/10 to-purple-500/10 border-indigo-500/20",
      accent: "text-indigo-400",
      progressColor: "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]",
    },
  ];

  return (
    <div id="lifestyle-insights-section" className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h3 id="lifestyle-header" className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <span className="w-1.5 h-5 rounded bg-indigo-500"></span>
          Environmental Lifestyle Indices
        </h3>
        {isLoading && (
          <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span>
            AI recalibrating...
          </div>
        )}
      </div>

      <div id="lifestyle-grid" className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <div
              key={cat.id}
              id={cat.id}
              className={`bg-gradient-to-br ${cat.color} border rounded-2xl p-4 flex flex-col justify-between hover:scale-[1.01] hover:bg-slate-800/20 transition-all duration-300 group`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${cat.accent}`} />
                    <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors">
                      {cat.title}
                    </span>
                  </div>
                  <span className={`text-base font-extrabold ${cat.accent} font-mono bg-slate-950/40 px-2.5 py-0.5 rounded-lg border border-slate-800`}>
                    {cat.index}<span className="text-[10px] text-slate-500 font-normal">/10</span>
                  </span>
                </div>
                
                {/* Horizontal progress bar */}
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden mb-3.5 border border-slate-800/40">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${cat.progressColor}`}
                    style={{ width: `${cat.index * 10}%` }}
                  ></div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                  {cat.advice}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
