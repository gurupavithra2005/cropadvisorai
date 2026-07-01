import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, FlaskConical } from "lucide-react";
import { SpeakButton } from "@/components/VoiceButtons";

type Plan = { fertilizer: string; quantity: string; timing: string; note?: string };

export default function Fertilizer() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [inputs, setInputs] = useState({ crop: "", n: "", p: "", k: "", ph: "6.5" });
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<{ summary: string; items: Plan[] } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("fertilizer-advise", {
        body: { ...inputs, language: i18n.language },
      });
      if (error) throw error;
      setPlan(data);
      await supabase.from("advisories").insert({ user_id: user!.id, kind: "fertilizer", input: inputs, output: data });
      await supabase.from("soil_reports").insert({
        user_id: user!.id, nitrogen: Number(inputs.n), phosphorus: Number(inputs.p),
        potassium: Number(inputs.k), ph: Number(inputs.ph), notes: inputs.crop,
      });
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toast.error((e as any)?.message || t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{t("fert.title")}</h1>
        <p className="text-muted-foreground">{t("fert.subtitle")}</p>
      </div>
      <Card className="p-4">
        <form onSubmit={submit} className="space-y-3">
          <div>
            <Label>{t("fert.crop")}</Label>
            <Input required value={inputs.crop} onChange={(e) => setInputs({ ...inputs, crop: e.target.value })}
              className="h-12" placeholder="e.g. Paddy, Tomato" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div><Label>{t("crops.n")}</Label><Input type="number" required value={inputs.n} onChange={(e) => setInputs({ ...inputs, n: e.target.value })} className="h-12" /></div>
            <div><Label>{t("crops.p")}</Label><Input type="number" required value={inputs.p} onChange={(e) => setInputs({ ...inputs, p: e.target.value })} className="h-12" /></div>
            <div><Label>{t("crops.k")}</Label><Input type="number" required value={inputs.k} onChange={(e) => setInputs({ ...inputs, k: e.target.value })} className="h-12" /></div>
          </div>
          <div>
            <Label>{t("crops.ph")}</Label>
            <Input type="number" step="0.1" required value={inputs.ph} onChange={(e) => setInputs({ ...inputs, ph: e.target.value })} className="h-12" />
          </div>
          <Button type="submit" disabled={loading} className="w-full btn-tap">
            {loading ? <Loader2 className="animate-spin" /> : t("fert.get")}
          </Button>
        </form>
      </Card>

      {plan && (
        <Card className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <p className="text-base">{plan.summary}</p>
            <SpeakButton text={plan.summary} />
          </div>
          <div className="space-y-2">
            {plan.items?.map((it, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl bg-secondary">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <FlaskConical size={20} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{it.fertilizer}</div>
                  <div className="text-sm">📦 {it.quantity}</div>
                  <div className="text-sm text-muted-foreground">🕒 {it.timing}</div>
                  {it.note && <div className="text-xs mt-1">{it.note}</div>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
