create extension if not exists vector;

create table if not exists public.kb_docs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  topic text,
  lang text not null default 'en',
  source text,
  embedding vector(3072),
  created_at timestamptz not null default now()
);

GRANT SELECT ON public.kb_docs TO authenticated;
GRANT SELECT ON public.kb_docs TO anon;
GRANT ALL ON public.kb_docs TO service_role;

ALTER TABLE public.kb_docs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Knowledge base is readable by everyone" ON public.kb_docs;
CREATE POLICY "Knowledge base is readable by everyone"
  ON public.kb_docs FOR SELECT USING (true);

create index if not exists kb_docs_embedding_idx
  on public.kb_docs using hnsw ((embedding::halfvec(3072)) halfvec_cosine_ops);

create or replace function public.match_kb_docs(query_embedding vector(3072), match_count int default 5)
returns table (id uuid, title text, content text, topic text, similarity float)
language sql stable
set search_path = public
as $$
  select d.id, d.title, d.content, d.topic,
         1 - (d.embedding::halfvec(3072) <=> query_embedding::halfvec(3072)) as similarity
  from public.kb_docs d
  where d.embedding is not null
  order by d.embedding::halfvec(3072) <=> query_embedding::halfvec(3072)
  limit match_count;
$$;

GRANT EXECUTE ON FUNCTION public.match_kb_docs(vector, int) TO authenticated, anon, service_role;