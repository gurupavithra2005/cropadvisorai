import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const MODEL = "google/gemini-2.5-flash";

async function callAI(messages: unknown[], jsonMode = true) {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": LOVABLE_API_KEY,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`AI gateway ${res.status}: ${t}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { n, p, k, ph, season, profile, language } = await req.json();
    const langName = { en: "English", hi: "Hindi", ta: "Tamil" }[(language || "en") as string] || "English";

    const sys = `You are an expert Indian agricultural advisor. Reply in ${langName}.
Return STRICT JSON: {"recommendations":[{"crop":"…","confidence":"High/Medium/Low","reason":"…","tips":"…"}]}
Give 4 crops ranked best-first. Reasons concise (<= 30 words). Consider soil NPK, pH, season, land type, and irrigation. Prefer crops widely grown in the region.`;

    const user = `Soil: N=${n}, P=${p}, K=${k}, pH=${ph}. Season: ${season}.
Region: ${profile?.state || "India"}, ${profile?.district || ""}.
Land type: ${profile?.land_type || "unknown"}. Irrigation: ${profile?.irrigation || "unknown"}.`;

    const content = await callAI([{ role: "system", content: sys }, { role: "user", content: user }]);
    const parsed = JSON.parse(content);
    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
