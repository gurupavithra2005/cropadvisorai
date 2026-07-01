import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { ListenButton, SpeakButton } from "@/components/VoiceButtons";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };

export function ChatFab() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("chat-advisor", {
        body: { messages: next, language: i18n.language },
      });
      if (error) throw error;
      setMessages([...next, { role: "assistant", content: data.reply || "…" }]);
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msg = (e as any)?.message || t("common.error");
      toast.error(msg);
      setMessages([...next, { role: "assistant", content: t("common.error") }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label={t("chat.title")}
          className="fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full gradient-sun shadow-lg text-white flex items-center justify-center active:scale-95 transition">
          <MessageCircle size={26} />
        </button>
      )}
      {open && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col animate-fade-in">
          <div className="flex items-center justify-between border-b px-4 h-14 bg-card">
            <div className="font-bold text-lg">{t("chat.title")}</div>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}><X /></Button>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground mt-8 text-lg">
                🌱 {t("auth.intro")}
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-base whitespace-pre-wrap ${
                  m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                }`}>
                  {m.content}
                  {m.role === "assistant" && <div className="mt-1 -mb-1"><SpeakButton text={m.content} /></div>}
                </div>
              </div>
            ))}
            {loading && <div className="text-muted-foreground text-sm">…</div>}
          </div>
          <div className="border-t p-3 flex gap-2 items-center bg-card">
            <ListenButton onText={(txt) => { setInput(txt); send(txt); }} />
            <Input value={input} onChange={(e) => setInput(e.target.value)}
              placeholder={t("chat.placeholder")}
              onKeyDown={(e) => e.key === "Enter" && send()}
              className="h-12 text-base rounded-full" />
            <Button size="icon" className="rounded-full h-12 w-12" onClick={() => send()} disabled={loading}>
              <Send size={20} />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
