import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const MODEL = "google/gemini-2.5-flash";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { messages, language } = await req.json();
    const langName = { en: "English", hi: "Hindi", ta: "Tamil" }[(language || "en") as string] || "English";

    const sys = `You are a friendly AI farming advisor for Indian smallholder farmers. Reply in ${langName}.
Give short, actionable answers (<= 6 sentences). Use simple words. Cover crops, pests, fertilizers, irrigation, weather, market, government schemes. If the question is off-topic, gently steer back to farming.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": LOVABLE_API_KEY },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "system", content: sys }, ...(messages || [])],
      }),
    });
    if (!res.ok) throw new Error(`AI ${res.status}: ${await res.text()}`);
    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content ?? "";
    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
