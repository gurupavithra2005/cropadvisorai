// Shared helper: create embeddings through the Lovable AI Gateway (OpenAI-compatible).
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
export const EMBED_MODEL = "google/gemini-embedding-2";

export async function embed(input: string | string[]): Promise<number[][]> {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": LOVABLE_API_KEY },
    body: JSON.stringify({ model: EMBED_MODEL, input }),
  });
  if (!res.ok) throw new Error(`Embeddings ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return (data.data as { index: number; embedding: number[] }[])
    .sort((a, b) => a.index - b.index)
    .map((d) => d.embedding);
}
