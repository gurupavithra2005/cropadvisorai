import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { CloudSun, Sprout, FlaskConical, Bug, LineChart, MapPin, AlertTriangle, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SpeakButton } from "@/components/VoiceButtons";

type Weather = { temp?: number; description?: string; icon?: string; alerts?: string[] };

export default function Home() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loadingW, setLoadingW] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name, latitude, longitude, village, district").eq("id", user.id).maybeSingle()
      .then(async ({ data }) => {
        setName(data?.full_name?.split(" ")[0] || "");
        const lat = data?.latitude, lon = data?.longitude;
        try {
          const { data: w } = await supabase.functions.invoke("weather-fetch", {
            body: { lat, lon, place: data?.district || data?.village },
          });
          if (w) setWeather(w.current);
        } catch { /* noop */ }
        setLoadingW(false);
      });
  }, [user]);

  const actions = [
    { key: "crops", icon: Sprout, to: "/crops", color: "bg-success/15 text-success" },
    { key: "fertilizer", icon: FlaskConical, to: "/fertilizer", color: "bg-primary/10 text-primary" },
    { key: "pest", icon: Bug, to: "/pest", color: "bg-warning/15 text-warning" },
    { key: "weather", icon: CloudSun, to: "/weather", color: "bg-accent/15 text-accent" },
    { key: "market", icon: LineChart, to: "/market", color: "bg-secondary text-secondary-foreground" },
  ] as const;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">{t("home.hello", { name: name || "🌾" })}</h1>
        <p className="text-muted-foreground">{t("tagline")}</p>
      </div>

      <Card className="p-5 gradient-earth text-primary-foreground border-0 card-lift">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm opacity-90">{t("home.today")}</div>
            {loadingW ? (
              <div className="text-lg opacity-90">{t("home.loadingWeather")}</div>
            ) : weather?.temp !== undefined ? (
              <>
                <div className="text-4xl font-bold">{Math.round(weather.temp)}°C</div>
                <div className="opacity-90 capitalize">{weather.description}</div>
              </>
            ) : (
              <div className="text-lg opacity-90">
                <MapPin className="inline mr-1" size={16} />
                <button onClick={() => navigate("/profile")} className="underline">Set your location</button>
              </div>
            )}
          </div>
          <CloudSun size={64} className="opacity-80" />
        </div>
      </Card>

      <div>
        <h2 className="font-semibold mb-2 text-lg">{t("home.quickActions")}</h2>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((a) => (
            <button key={a.key} onClick={() => navigate(a.to)}
              className="card-lift bg-card rounded-2xl p-4 flex flex-col items-start gap-2 active:scale-[0.98] transition">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${a.color}`}>
                <a.icon size={26} />
              </div>
              <span className="font-semibold text-base">{t(`nav.${a.key}`)}</span>
            </button>
          ))}
          <button onClick={() => document.querySelector<HTMLButtonElement>('[aria-label="Advisor"]')?.click()}
            className="card-lift gradient-sun text-white rounded-2xl p-4 flex flex-col items-start gap-2 active:scale-[0.98] transition">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <MessageCircle size={26} />
            </div>
            <span className="font-semibold text-base">{t("home.askAdvisor")}</span>
          </button>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-lg">{t("home.recentAlerts")}</h2>
          {weather?.description && <SpeakButton text={`${weather.description}. ${Math.round(weather.temp || 0)} degrees`} />}
        </div>
        {weather?.alerts && weather.alerts.length > 0 ? (
          <div className="space-y-2">
            {weather.alerts.map((a, i) => (
              <Card key={i} className="p-3 flex items-start gap-3 border-warning/40 bg-warning/5">
                <AlertTriangle className="text-warning shrink-0 mt-0.5" />
                <div className="text-sm">{a}</div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-4 text-muted-foreground text-center">{t("home.noAlerts")}</Card>
        )}
      </div>
    </div>
  );
}
