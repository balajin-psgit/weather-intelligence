import React from "react";
import { AlertOctagon, AlertTriangle, Info, CheckCircle2, ShieldAlert } from "lucide-react";
import { WeatherAlert } from "../types";

interface AlertsPanelProps {
  alerts: WeatherAlert[];
  isAiLoading?: boolean;
}

export default function AlertsPanel({ alerts, isAiLoading }: AlertsPanelProps) {
  const getSeverityStyles = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return {
          container: "bg-red-950/40 border-red-500/40 hover:border-red-500/80 text-red-100",
          badge: "bg-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.4)] animate-pulse",
          icon: AlertOctagon,
          color: "text-red-400"
        };
      case "high":
        return {
          container: "bg-orange-950/40 border-orange-500/40 hover:border-orange-500/80 text-orange-100",
          badge: "bg-orange-500 text-white shadow-[0_0_12px_rgba(249,115,22,0.4)]",
          icon: AlertTriangle,
          color: "text-orange-400"
        };
      case "medium":
        return {
          container: "bg-amber-950/30 border-amber-500/30 hover:border-amber-500/60 text-amber-100",
          badge: "bg-amber-500 text-slate-950",
          icon: AlertTriangle,
          color: "text-amber-400"
        };
      case "low":
      default:
        return {
          container: "bg-blue-950/20 border-blue-500/20 hover:border-blue-500/40 text-blue-100",
          badge: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
          icon: Info,
          color: "text-blue-400"
        };
    }
  };

  return (
    <div id="alerts-panel-section" className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 shadow-2xl">
      <h3 id="alerts-header" className="text-lg font-semibold text-slate-100 mb-6 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-5 rounded bg-amber-500 animate-pulse"></span>
          Extreme Conditions & Alerts
        </span>
        {alerts.length > 0 && (
          <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">
            {alerts.length} Active {alerts.length === 1 ? "Alert" : "Alerts"}
          </span>
        )}
      </h3>

      {alerts.length === 0 ? (
        <div id="alerts-empty-state" className="flex flex-col items-center justify-center py-8 px-4 text-center bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <span className="text-sm font-semibold text-slate-200">Conditions Stable</span>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            All systems normal. No extreme weather advisories, sudden temperature swings, or high UV threats detected.
          </p>
        </div>
      ) : (
        <div id="alerts-list" className="space-y-4">
          {alerts.map((alert, index) => {
            const styles = getSeverityStyles(alert.severity);
            const Icon = styles.icon;

            return (
              <div
                key={`alert-${index}`}
                id={`alert-card-${index}`}
                className={`p-5 rounded-2xl border transition-all duration-300 ${styles.container}`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`p-2 rounded-xl bg-slate-950/40 border border-slate-700/30 ${styles.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                      <h4 className="font-bold text-slate-100 text-sm md:text-base">
                        {alert.title}
                      </h4>
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full ${styles.badge}`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                      {alert.description}
                    </p>
                    
                    {alert.recommendedAction && (
                      <div className="mt-3.5 pt-3 border-t border-slate-800/60 flex items-start gap-2 text-xs text-slate-300 bg-slate-950/20 -mx-5 -mb-5 p-4 rounded-b-2xl">
                        <ShieldAlert className={`w-4.5 h-4.5 shrink-0 ${styles.color}`} />
                        <div>
                          <strong className="text-slate-200 font-semibold block mb-0.5">Recommended Safety Protocol:</strong>
                          {alert.recommendedAction}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isAiLoading && (
        <div className="mt-4 flex items-center justify-center gap-2 py-2 text-xs text-slate-400 border-t border-slate-800/40">
          <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping"></div>
          Analyzing deep weather pattern alerts via Gemini...
        </div>
      )}
    </div>
  );
}
