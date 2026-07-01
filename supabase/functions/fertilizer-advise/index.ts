import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const MODEL = "google/gemini-2.5-flash";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { crop, n, p, k, ph, language } = await req.json();
    const langName = { en: "English", hi: "Hindi", ta: "Tamil" }[(language || "en") as string] || "English";

    const sys = `You are an expert Indian agricultural extension officer. Reply in ${langName}.
Return STRICT JSON: {"summary":"1-2 sentences overview","items":[{"fertilizer":"name","quantity":"kg per acre","timing":"stage/day","note":"optional"}]}
Recommend 2-4 fertilizer items (basal + top-dressing). Use common Indian brands like Urea, DAP, MOP, SSP, Vermicompost, NPK 10:26:26. Consider soil deficiencies vs crop demand. Warn if pH is off (add lime/gypsum).`;

    const user = `Crop: ${crop}. Soil: N=${n}, P=${p}, K=${k}, pH=${ph}.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": LOVABLE_API_KEY },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "system", content: sys }, { role: "user", content: user }],
        response_format: { type: "json_object" },
      }),
    });
    if (!res.ok) throw new Error(`AI ${res.status}: ${await res.text()}`);
    const data = await res.json();
    const parsed = JSON.parse(data.choices[0].message.content);
    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
