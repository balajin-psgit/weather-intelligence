import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini client to prevent app startup crashes when API key is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is missing. Please configure it in your Secrets settings.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Weather Intelligence / AI Planning Recommendation Endpoint
app.post("/api/weather/intelligence", async (req, res) => {
  try {
    const { currentWeather, dailyForecast, location, customActivity } = req.body;

    if (!currentWeather || !dailyForecast || !location) {
      return res.status(400).json({ error: "Missing required weather or location data." });
    }

    const ai = getGeminiClient();

    // Prepare prompt with detailed contextual data
    const prompt = `
You are an elite, highly precise Weather Intelligence Engine. Analyze the following weather forecast and location data to generate structural weather recommendations, tailored alerts, and custom activity suggestions.

LOCATION:
${location.name}, ${location.country} (Lat: ${location.latitude}, Lon: ${location.longitude})

CURRENT CONDITIONS:
- Temp: ${currentWeather.temp}°C (Apparent: ${currentWeather.apparent}°C)
- Weather Code: ${currentWeather.weatherCode}
- Humidity: ${currentWeather.humidity}%
- Wind Speed: ${currentWeather.windSpeed} km/h
- Cloud Cover: ${currentWeather.cloudCover}%

7-DAY FORECAST:
${dailyForecast.map((day: any, i: number) => `
Day ${i + 1} (${day.date}):
- Max Temp: ${day.maxTemp}°C, Min Temp: ${day.minTemp}°C
- Precipitation Prob: ${day.precipitationProbability}%
- Wind Speed Max: ${day.maxWindSpeed} km/h
- Weather Code: ${day.weatherCode}
- UV Index Max: ${day.maxUvIndex ?? "N/A"}
`).join("\n")}

${customActivity ? `USER ACTIVITY PLANNING INTENT:
The user is planning the following specific activity/event and wants you to optimize it based on the forecast: "${customActivity}"` : ""}

Analyze this data and return your evaluation in the strict JSON schema provided. Ensure all insights are actionable, highly descriptive, and custom-tailored to the weather conditions. Avoid generic advice.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a world-class professional meteorologist and personal activity assistant. You analyze weather forecasts with extreme precision, detect micro-alerts (such as high UV, sudden temperature drops, high wind, dense fog, or heavy precipitation), and write beautifully detailed, engaging, and context-specific recommendations.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            planningSummary: {
              type: Type.STRING,
              description: "A cohesive, inspiring, and concise weekly overview summary of what the weather means for outdoor life.",
            },
            extremeWeatherAlerts: {
              type: Type.ARRAY,
              description: "Custom intelligent alerts for any potential severe, extreme, or annoying weather conditions in the upcoming 7 days (e.g. storms, very high UV, severe wind, freezing temperatures, heavy rain, thick fog).",
              items: {
                type: Type.OBJECT,
                properties: {
                  severity: {
                    type: Type.STRING,
                    description: "Severity category: low, medium, high, or critical.",
                  },
                  title: {
                    type: Type.STRING,
                    description: "The alert name, e.g., 'Extreme UV Hazard' or 'High Wind Warning'.",
                  },
                  description: {
                    type: Type.STRING,
                    description: "Detailed description of the weather condition and why it triggers an alert.",
                  },
                  recommendedAction: {
                    type: Type.STRING,
                    description: "Specific protective action to take.",
                  },
                },
                required: ["severity", "title", "description", "recommendedAction"],
              },
            },
            dailyRecommendations: {
              type: Type.ARRAY,
              description: "Detailed analysis for each of the 7 forecast days.",
              items: {
                type: Type.OBJECT,
                properties: {
                  date: {
                    type: Type.STRING,
                    description: "The day's date string matching the daily forecast input.",
                  },
                  activitySuitability: {
                    type: Type.INTEGER,
                    description: "A score from 0 (completely unsuitable) to 100 (absolutely perfect weather) for general outdoor activities.",
                  },
                  suitabilityReason: {
                    type: Type.STRING,
                    description: "A friendly, custom explanation of why the day got this score.",
                  },
                  clothingSuggestion: {
                    type: Type.STRING,
                    description: "Precise layer recommendations (e.g., 'Thermal base + waterproof jacket', 'Light linen clothing + wide-brim hat').",
                  },
                  bestTimeOfDay: {
                    type: Type.STRING,
                    description: "The optimal window for outdoor tasks or leisure (e.g., 'Late afternoon', 'Morning before UV spikes', 'All day is pristine').",
                  },
                },
                required: ["date", "activitySuitability", "suitabilityReason", "clothingSuggestion", "bestTimeOfDay"],
              },
            },
            activityInsight: {
              type: Type.STRING,
              description: "If a custom activity was requested, analyze it in depth against the weekly forecast (which day is absolute best, which day to avoid, specific precautions). If no activity was requested, leave this as a general recommendation for outdoor hobbies.",
            },
            lifestyleIndices: {
              type: Type.OBJECT,
              description: "Weather-derived indices for special categories.",
              properties: {
                outdoorRunning: {
                  type: Type.OBJECT,
                  properties: {
                    index: { type: Type.INTEGER, description: "Rating from 1 (poor) to 10 (ideal)." },
                    advice: { type: Type.STRING, description: "Detailed running-specific comfort/safety advisory." },
                  },
                  required: ["index", "advice"],
                },
                energyUsage: {
                  type: Type.OBJECT,
                  properties: {
                    index: { type: Type.INTEGER, description: "Rating from 1 (very high HVAC demands) to 10 (natural temperature, low energy)." },
                    advice: { type: Type.STRING, description: "Advice on heating/cooling settings and draft management." },
                  },
                  required: ["index", "advice"],
                },
                gardening: {
                  type: Type.OBJECT,
                  properties: {
                    index: { type: Type.INTEGER, description: "Rating from 1 (risk of frost or severe drought) to 10 (excellent planting/watering weather)." },
                    advice: { type: Type.STRING, description: "Watering, pruning, or crop protection tip based on wind, sun, and rain forecast." },
                  },
                  required: ["index", "advice"],
                },
                stargazing: {
                  type: Type.OBJECT,
                  properties: {
                    index: { type: Type.INTEGER, description: "Rating from 1 (overcast, zero visibility) to 10 (exceptionally clear sky, low humidity)." },
                    advice: { type: Type.STRING, description: "Observational clarity summary and best night for celestial sights." },
                  },
                  required: ["index", "advice"],
                },
              },
              required: ["outdoorRunning", "energyUsage", "gardening", "stargazing"],
            },
          },
          required: ["planningSummary", "extremeWeatherAlerts", "dailyRecommendations", "activityInsight", "lifestyleIndices"],
        },
      },
    });

    const parsedData = JSON.parse(response.text?.trim() || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({
      error: error.message || "An unexpected error occurred while analyzing the weather.",
      isConfigError: error.message?.includes("GEMINI_API_KEY") || false,
    });
  }
});

// Express + Vite configuration for SPA routing
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Weather Intelligence server running on http://localhost:${PORT}`);
  });
}

startServer();
