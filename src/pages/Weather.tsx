import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { CloudSun, CloudRain, Cloud, Sun, AlertTriangle, Loader2, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

type Day = { date: string; min: number; max: number; description: string; rainMm?: number; icon?: string };
type Payload = { current: { temp: number; description: string; humidity?: number; wind?: number; alerts?: string[] }; daily: Day[] };

function iconFor(desc: string) {
  const d = desc.toLowerCase();
  if (d.includes("rain") || d.includes("drizzle") || d.includes("thunder")) return CloudRain;
  if (d.includes("cloud")) return Cloud;
  if (d.includes("clear") || d.includes("sun")) return Sun;
  return CloudSun;
}

export default function Weather() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [noLoc, setNoLoc] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("latitude,longitude,village,district").eq("id", user.id).maybeSingle()
      .then(async ({ data: p }) => {
        if (!p?.latitude && !p?.district) { setNoLoc(true); setLoading(false); return; }
        try {
          const { data: w } = await supabase.functions.invoke("weather-fetch", {
            body: { lat: p?.latitude, lon: p?.longitude, place: p?.district || p?.village },
          });
          setData(w);
        } catch { /* noop */ }
        setLoading(false);
      });
  }, [user]);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" /></div>;
  if (noLoc) return (
    <Card className="p-6 text-center">
      <MapPin className="mx-auto mb-2 text-primary" />
      <p className="mb-2">Set your location to see local weather.</p>
      <Link to="/profile" className="underline text-primary">Open profile</Link>
    </Card>
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t("weather.title")}</h1>

      {data?.current && (() => {
        const Icon = iconFor(data.current.description);
        return (
          <Card className="p-5 gradient-earth text-primary-foreground border-0 card-lift">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-5xl font-bold">{Math.round(data.current.temp)}°C</div>
                <div className="capitalize opacity-95">{data.current.description}</div>
                <div className="text-sm opacity-80 mt-1">
                  {data.current.humidity != null && `💧 ${data.current.humidity}% `}
                  {data.current.wind != null && `💨 ${data.current.wind} m/s`}
                </div>
              </div>
              <Icon size={72} className="opacity-90" />
            </div>
          </Card>
        );
      })()}

      {data?.current.alerts && data.current.alerts.length > 0 && (
        <div className="space-y-2">
          <h2 className="font-semibold">{t("weather.alerts")}</h2>
          {data.current.alerts.map((a, i) => (
            <Card key={i} className="p-3 flex items-start gap-2 border-warning/40 bg-warning/5">
              <AlertTriangle className="text-warning shrink-0 mt-0.5" size={20} />
              <div className="text-sm">{a}</div>
            </Card>
          ))}
        </div>
      )}

      {data?.daily && (
        <div>
          <h2 className="font-semibold mb-2">{t("weather.forecast")}</h2>
          <Card className="divide-y">
            {data.daily.map((d, i) => {
              const Icon = iconFor(d.description);
              return (
                <div key={i} className="flex items-center gap-3 p-3">
                  <Icon className="text-primary shrink-0" size={28} />
                  <div className="flex-1">
                    <div className="font-medium">{d.date}</div>
                    <div className="text-sm text-muted-foreground capitalize">{d.description}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{Math.round(d.max)}° <span className="text-muted-foreground font-normal">{Math.round(d.min)}°</span></div>
                    {d.rainMm != null && d.rainMm > 0 && <div className="text-xs text-primary">💧 {d.rainMm}mm</div>}
                  </div>
                </div>
              );
            })}
          </Card>
        </div>
      )}
    </div>
  );
}
