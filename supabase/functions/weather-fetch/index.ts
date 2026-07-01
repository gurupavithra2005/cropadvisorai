import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

// Uses Open-Meteo (no API key required). Reliable & free for global weather.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    let { lat, lon, place } = await req.json();

    // Geocode place name if no coordinates
    if ((lat == null || lon == null) && place) {
      const g = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(place)}&count=1&country=IN`);
      const gd = await g.json();
      const hit = gd.results?.[0];
      if (hit) { lat = hit.latitude; lon = hit.longitude; }
    }
    if (lat == null || lon == null) {
      return new Response(JSON.stringify({ error: "No location" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m` +
      `&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum` +
      `&timezone=auto&forecast_days=5`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`Weather ${r.status}`);
    const w = await r.json();

    const describe = (code: number): string => {
      if ([0].includes(code)) return "Clear sky";
      if ([1, 2, 3].includes(code)) return "Partly cloudy";
      if ([45, 48].includes(code)) return "Fog";
      if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
      if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Rain";
      if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snow";
      if ([95, 96, 99].includes(code)) return "Thunderstorm";
      return "Unknown";
    };

    const alerts: string[] = [];
    (w.daily?.precipitation_sum || []).forEach((mm: number, i: number) => {
      if (mm >= 40) alerts.push(`Heavy rain expected on ${w.daily.time[i]} (${mm}mm). Protect crops & delay spraying.`);
    });
    (w.daily?.temperature_2m_max || []).forEach((tmx: number, i: number) => {
      if (tmx >= 40) alerts.push(`Heatwave: ${Math.round(tmx)}°C on ${w.daily.time[i]}. Increase irrigation.`);
    });

    const payload = {
      current: {
        temp: w.current?.temperature_2m,
        description: describe(w.current?.weather_code ?? 0),
        humidity: w.current?.relative_humidity_2m,
        wind: w.current?.wind_speed_10m,
        alerts,
      },
      daily: (w.daily?.time || []).map((date: string, i: number) => ({
        date,
        min: w.daily.temperature_2m_min[i],
        max: w.daily.temperature_2m_max[i],
        description: describe(w.daily.weather_code[i]),
        rainMm: w.daily.precipitation_sum[i],
      })),
    };

    return new Response(JSON.stringify(payload), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
