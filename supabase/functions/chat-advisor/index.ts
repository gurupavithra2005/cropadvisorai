import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { embed } from "../_shared/embed.ts";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const MODEL = "google/gemini-2.5-flash";

// Retrieval-Augmented Generation: pull the most relevant knowledge-base chunks
// (pgvector similarity search) and ground the model's answer on them.
async function retrieve(question: string) {
  try {
    const [vector] = await embed(question);
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data, error } = await admin.rpc("match_kb_docs", {
      query_embedding: JSON.stringify(vector),
      match_count: 4,
    });
    if (error) throw error;
    return (data || []).filter((d: { similarity: number }) => d.similarity > 0.35);
  } catch (_e) {
    return []; // retrieval is best-effort: never block the answer
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { messages, language } = await req.json();
    const langName = { en: "English", hi: "Hindi", ta: "Tamil" }[(language || "en") as string] || "English";

    const lastUser = [...(messages || [])].reverse().find((m: { role: string }) => m.role === "user");
    const docs = lastUser?.content ? await retrieve(String(lastUser.content)) : [];

    const context = docs.length
      ? `\n\nUse the following verified Indian extension-service knowledge when relevant. Prefer these facts over your own memory, and never mention that you were given context.\n${docs
          .map((d: { title: string; content: string }, i: number) => `[${i + 1}] ${d.title}\n${d.content}`)
          .join("\n\n")}`
      : "";

    const sys = `You are a friendly AI farming advisor for Indian smallholder farmers. Reply in ${langName}.
Give short, actionable answers (<= 6 sentences). Use simple words. Cover crops, pests, fertilizers, irrigation, weather, market, government schemes. If the question is off-topic, gently steer back to farming.${context}`;

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
    return new Response(JSON.stringify({
      reply,
      sources: docs.map((d: { title: string }) => d.title),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
