import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

// Live daily mandi prices from data.gov.in (Agmarknet: "Current Daily Price of Various Commodities").
// Falls back to illustrative sample data when DATA_GOV_IN_API_KEY is not configured.
const RESOURCE = "9ef84268-d588-465a-a308-a864a43d0070";

type Rec = {
  commodity: string;
  market: string;
  state?: string;
  district?: string;
  min: number;
  max: number;
  modal: number;
  date: string;
};

const num = (v: unknown) => {
  const n = Number(String(v ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = await req.json().catch(() => ({}));
    const commodity = typeof body.commodity === "string" ? body.commodity.trim().slice(0, 60) : "";
    const state = typeof body.state === "string" ? body.state.trim().slice(0, 60) : "";
    const district = typeof body.district === "string" ? body.district.trim().slice(0, 60) : "";

    if (!commodity) {
      return new Response(JSON.stringify({ error: "commodity is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const KEY = Deno.env.get("DATA_GOV_IN_API_KEY");
    if (!KEY) {
      const today = new Date().toISOString().slice(0, 10);
      return new Response(JSON.stringify({
        source: "sample",
        note: "Add DATA_GOV_IN_API_KEY for live Agmarknet prices",
        records: [
          { commodity, market: "Local Mandi", state: state || "—", district: district || "—", min: 1800, max: 2400, modal: 2100, date: today },
          { commodity, market: "District Mandi", state: state || "—", district: district || "—", min: 1900, max: 2500, modal: 2200, date: today },
        ] satisfies Rec[],
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const titleCase = (s: string) => s.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase());

    const query = async (filters: Record<string, string>) => {
      const params = new URLSearchParams({ "api-key": KEY, format: "json", limit: "50" });
      for (const [k, v] of Object.entries(filters)) params.set(`filters[${k}]`, v);
      const r = await fetch(`https://api.data.gov.in/resource/${RESOURCE}?${params.toString()}`);
      if (!r.ok) throw new Error(`data.gov.in ${r.status}`);
      const j = await r.json();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return ((j.records || []) as any[]).map((rec): Rec => ({
        commodity: rec.commodity,
        market: rec.market,
        state: rec.state,
        district: rec.district,
        min: num(rec.min_price),
        max: num(rec.max_price),
        modal: num(rec.modal_price),
        date: rec.arrival_date,
      }));
    };

    const base: Record<string, string> = { commodity: titleCase(commodity) };
    if (state) base.state = titleCase(state);

    // Narrowest first: commodity + state + district, then relax.
    let records: Rec[] = [];
    let scope = "state";
    if (district) {
      records = await query({ ...base, district: titleCase(district) });
      if (records.length) scope = "district";
    }
    if (!records.length) records = await query(base);
    if (!records.length && state) {
      records = await query({ commodity: titleCase(commodity) });
      scope = "national";
    }

    records.sort((a, b) => (b.date || "").localeCompare(a.date || ""));

    return new Response(JSON.stringify({ source: "agmarknet", scope, records }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
