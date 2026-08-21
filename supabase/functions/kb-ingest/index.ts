import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { embed } from "../_shared/embed.ts";
import { KB_SEED } from "../_shared/kb-seed.ts";

// Seeds / re-embeds the agricultural knowledge base used for RAG retrieval.
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    const body = await req.json().catch(() => ({}));
    const force = body?.force === true;
    const extra = Array.isArray(body?.docs) ? body.docs : [];

    const { count } = await admin.from("kb_docs").select("id", { count: "exact", head: true });
    if ((count ?? 0) > 0 && !force && extra.length === 0) {
      return new Response(JSON.stringify({ skipped: true, count }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (force) await admin.from("kb_docs").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    const docs = [...(force || (count ?? 0) === 0 ? KB_SEED : []), ...extra];
    if (docs.length === 0) {
      return new Response(JSON.stringify({ inserted: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Google embeddings accept at most 100 inputs per request.
    let inserted = 0;
    for (let i = 0; i < docs.length; i += 50) {
      const batch = docs.slice(i, i + 50);
      const vectors = await embed(batch.map((d) => `${d.title}\n${d.content}`));
      const rows = batch.map((d, j) => ({
        title: d.title,
        content: d.content,
        topic: d.topic ?? null,
        source: d.source ?? null,
        lang: d.lang ?? "en",
        embedding: JSON.stringify(vectors[j]),
      }));
      const { error } = await admin.from("kb_docs").insert(rows);
      if (error) throw error;
      inserted += rows.length;
    }

    return new Response(JSON.stringify({ inserted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
