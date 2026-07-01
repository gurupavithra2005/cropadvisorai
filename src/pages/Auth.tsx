import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { Sprout, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { LANGS, setLang } from "@/lib/i18n";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export default function Auth() {
  const { t, i18n } = useTranslation();
  const { session } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (session) navigate("/", { replace: true }); }, [session, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "up") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: name },
          },
        });
        if (error) throw error;
        toast.success("Account created!");
        // Update language on profile after signup
        await supabase.auth.getUser().then(async ({ data }) => {
          if (data.user) await supabase.from("profiles").update({ language: i18n.language }).eq("id", data.user.id);
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toast.error((err as any)?.message || t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="gradient-earth text-primary-foreground px-6 pt-12 pb-16 rounded-b-[2rem]">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-foreground/15 flex items-center justify-center backdrop-blur">
              <Sprout size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold leading-tight">{t("appName")}</h1>
              <p className="text-sm opacity-90">{t("tagline")}</p>
            </div>
          </div>
          <p className="text-lg opacity-95">{t("auth.welcome")}</p>
          <p className="text-sm opacity-80 mt-1">{t("auth.intro")}</p>
        </div>
      </div>

      <div className="max-w-md mx-auto w-full px-6 -mt-8">
        <Card className="p-6 card-lift">
          <div className="flex gap-2 mb-4">
            {LANGS.map((l) => (
              <button key={l.code} type="button" onClick={() => setLang(l.code)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium border-2 transition ${
                  i18n.language === l.code ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                }`}>
                {l.label}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === "up" && (
              <div>
                <Label>{t("auth.name")}</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required className="h-12 text-base" />
              </div>
            )}
            <div>
              <Label>{t("auth.email")}</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12 text-base" />
            </div>
            <div>
              <Label>{t("auth.password")}</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="h-12 text-base" />
            </div>
            <Button type="submit" disabled={loading} className="w-full btn-tap">
              {loading ? <Loader2 className="animate-spin" /> : mode === "in" ? t("auth.signIn") : t("auth.signUp")}
            </Button>
          </form>

          <button onClick={() => setMode(mode === "in" ? "up" : "in")}
            className="w-full mt-4 text-sm text-primary underline">
            {mode === "in" ? t("auth.noAccount") : t("auth.haveAccount")}
          </button>
        </Card>
      </div>
    </div>
  );
}
