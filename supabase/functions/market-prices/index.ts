import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

// Uses data.gov.in Agmarknet daily prices dataset.
// If DATA_GOV_IN_API_KEY isn't set, returns illustrative sample data so the app remains usable.
const RESOURCE = "9ef84268-d588-465a-a308-a864a43d0070";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { commodity, state } = await req.json();
    const KEY = Deno.env.get("DATA_GOV_IN_API_KEY");

    if (!KEY) {
      // Sample fallback so UI still shows something
      const today = new Date().toISOString().slice(0, 10);
      return new Response(JSON.stringify({
        source: "sample",
        records: [
          { commodity, market: "Local Mandi", state: state || "—", min: 1800, max: 2400, modal: 2100, date: today },
          { commodity, market: "District Mandi", state: state || "—", min: 1900, max: 2500, modal: 2200, date: today },
        ],
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const params = new URLSearchParams({
      "api-key": KEY, format: "json", limit: "20",
      "filters[commodity]": commodity,
      ...(state ? { "filters[state]": state } : {}),
    });
    const url = `https://api.data.gov.in/resource/${RESOURCE}?${params.toString()}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`data.gov.in ${r.status}`);
    const j = await r.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const records = (j.records || []).map((rec: any) => ({
      commodity: rec.commodity, market: rec.market, state: rec.state,
      min: Number(rec.min_price), max: Number(rec.max_price), modal: Number(rec.modal_price),
      date: rec.arrival_date,
    }));
    return new Response(JSON.stringify({ source: "agmarknet", records }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
