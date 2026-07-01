import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const MODEL = "google/gemini-2.5-flash";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { imageBase64, language } = await req.json();
    if (!imageBase64) throw new Error("Missing image");
    const langName = { en: "English", hi: "Hindi", ta: "Tamil" }[(language || "en") as string] || "English";

    const sys = `You are a plant pathologist. Diagnose pests or diseases from the leaf/plant photo.
Reply in ${langName}. Return STRICT JSON:
{"crop":"detected crop or ''","diagnosis":"pest/disease name","severity":"Mild|Moderate|Severe","treatment":"actionable steps incl. organic + chemical options","confidence":"High|Medium|Low"}
If not a plant, set diagnosis="Not a plant image".`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": LOVABLE_API_KEY },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: sys },
          { role: "user", content: [
            { type: "text", text: "Diagnose this leaf/plant." },
            { type: "image_url", image_url: { url: imageBase64 } },
          ] },
        ],
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
