import React, { useState } from "react";
import { Sparkles, Calendar, Plus, RefreshCw, Send, CheckSquare, ShieldCheck, Footprints, Flame, CloudSun } from "lucide-react";
import { WeatherIntelligence } from "../types";

interface ActivityPlannerProps {
  intelligence: WeatherIntelligence | null;
  customActivity: string;
  setCustomActivity: (act: string) => void;
  onPlanRequest: () => void;
  isLoading: boolean;
}

export default function ActivityPlanner({
  intelligence,
  customActivity,
  setCustomActivity,
  onPlanRequest,
  isLoading,
}: ActivityPlannerProps) {
  const [inputText, setInputText] = useState("");

  const suggestedActivities = [
    { label: "Outdoor BBQ Party", prompt: "Planning a big family BBQ party" },
    { label: "Scenic Long Hike", prompt: "Going on a challenging mountain hike" },
    { label: "Wash Car", prompt: "Planning to wash my car" },
    { label: "Landscape Photography", prompt: "Looking for optimal lighting for landscape photography" },
    { label: "Run a Marathon", prompt: "Training and running a long-distance marathon" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    setCustomActivity(inputText);
    onPlanRequest();
  };

  const handleSelectSuggested = (prompt: string) => {
    if (isLoading) return;
    setInputText(prompt);
    setCustomActivity(prompt);
    // Directly trigger planning since state is updated
    setTimeout(() => {
      onPlanRequest();
    }, 100);
  };

  return (
    <div id="activity-planner-section" className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
      {/* Decorative accent background glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>

      <h3 id="planner-header" className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
        AI Weather Intelligence Planner
      </h3>

      <p className="text-xs text-slate-400 mb-6 leading-relaxed">
        Let Gemini analyze the upcoming 7-day forecast to find the perfect slot and prepare custom checklists for your planned activities.
      </p>

      {/* Suggestion Chips */}
      <div id="suggested-chips" className="flex flex-wrap gap-2 mb-6">
        {suggestedActivities.map((act) => (
          <button
            key={act.label}
            onClick={() => handleSelectSuggested(act.prompt)}
            disabled={isLoading}
            className={`text-xs px-3.5 py-1.5 rounded-full border transition-all duration-300 cursor-pointer ${
              customActivity === act.prompt
                ? "bg-indigo-600/30 border-indigo-500 text-indigo-200"
                : "bg-slate-800/40 border-slate-700/50 hover:border-slate-600 hover:bg-slate-800 text-slate-300"
            }`}
          >
            {act.label}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2.5 mb-6">
        <input
          id="planner-custom-input"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="E.g., planning an outdoor yoga session on Saturday..."
          disabled={isLoading}
          className="flex-1 bg-slate-950/60 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-2xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all duration-200"
        />
        <button
          id="planner-submit-btn"
          type="submit"
          disabled={isLoading || !inputText.trim()}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white rounded-2xl px-5 flex items-center justify-center gap-1.5 font-medium text-sm transition-all duration-200 shadow-lg shadow-indigo-600/20 cursor-pointer"
        >
          {isLoading ? (
            <RefreshCw className="w-4.5 h-4.5 animate-spin" />
          ) : (
            <>
              <span>Plan</span>
              <Send className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Recommendation Results Panel */}
      {isLoading ? (
        <div id="planner-loading-state" className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full border-2 border-indigo-500/20 border-t-indigo-400 animate-spin mb-4"></div>
          <span className="text-sm font-semibold text-slate-200">Analyzing Weekly Micro-Forecasts</span>
          <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
            Comparing daily temperatures, humidity rates, UV peaks, and sudden rain potentials against your plan...
          </p>
        </div>
      ) : intelligence ? (
        <div id="planner-results" className="space-y-5">
          {/* Main AI recommendation container */}
          <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-5 hover:border-slate-700/60 transition-all">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest leading-none">
                  {customActivity ? "Custom Activity Recommendation" : "Weekly Outdoor Recommendation"}
                </h4>
                <p className="text-slate-100 text-sm font-medium mt-1 leading-relaxed">
                  {customActivity ? `Optimized Plan for: "${customActivity}"` : "General Outing Forecast"}
                </p>
              </div>
            </div>

            <p className="text-xs md:text-sm text-slate-300 leading-relaxed bg-slate-900/30 p-4 border border-slate-800/40 rounded-xl">
              {intelligence.activityInsight}
            </p>
          </div>

          {/* Daily Suitability Overview */}
          <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-5">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              Optimal Weekly Scheduling Slots
            </h4>

            <div className="space-y-3">
              {intelligence.dailyRecommendations.slice(0, 5).map((day) => {
                const isOptimal = day.activitySuitability >= 80;
                const isModerate = day.activitySuitability >= 50 && day.activitySuitability < 80;

                const suitabilityBadgeColor = isOptimal
                  ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                  : isModerate
                  ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                  : "text-rose-400 bg-rose-500/10 border-rose-500/20";

                const formattedDate = new Date(day.date).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                });

                return (
                  <div
                    key={`recommendation-${day.date}`}
                    className="flex flex-col md:flex-row md:items-center justify-between p-3.5 bg-slate-900/40 border border-slate-800/40 hover:border-slate-700/30 rounded-xl transition-all gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-24 text-sm font-semibold text-slate-200">
                        {formattedDate}
                      </div>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border font-mono ${suitabilityBadgeColor}`}>
                        {day.activitySuitability}% Suitability
                      </span>
                    </div>

                    <div className="flex-1 md:px-4">
                      <p className="text-xs text-slate-300">
                        {day.suitabilityReason}
                      </p>
                      <div className="flex flex-wrap gap-2.5 mt-1.5 text-[10px] text-slate-400 font-medium">
                        <span className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                          👔 {day.clothingSuggestion}
                        </span>
                        <span className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                          ⏱️ Best: {day.bestTimeOfDay}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div id="planner-initial-state" className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-6 flex items-center gap-4 hover:border-slate-700 transition-all">
          <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-sm font-semibold text-slate-200">Select or describe an activity</span>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Try clicking a quick-suggestion chip above or enter a custom event to trigger custom weather recommendations!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
