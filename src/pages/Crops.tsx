import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, Sprout } from "lucide-react";
import { SpeakButton } from "@/components/VoiceButtons";

type Rec = { crop: string; reason: string; confidence?: string; tips?: string };

export default function Crops() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [inputs, setInputs] = useState({ n: "", p: "", k: "", ph: "6.5", season: "kharif" });
  const [loading, setLoading] = useState(false);
  const [recs, setRecs] = useState<Rec[]>([]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: profile } = await supabase.from("profiles")
        .select("state,district,land_type,irrigation").eq("id", user!.id).maybeSingle();
      const { data, error } = await supabase.functions.invoke("crop-recommend", {
        body: { ...inputs, profile, language: i18n.language },
      });
      if (error) throw error;
      setRecs(data.recommendations || []);
      await supabase.from("advisories").insert({
        user_id: user!.id, kind: "crop", input: inputs, output: data,
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
        <h1 className="text-2xl font-bold">{t("crops.title")}</h1>
        <p className="text-muted-foreground">{t("crops.subtitle")}</p>
      </div>

      <Card className="p-4">
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div><Label>{t("crops.n")}</Label><Input type="number" required value={inputs.n} onChange={(e) => setInputs({ ...inputs, n: e.target.value })} className="h-12" /></div>
            <div><Label>{t("crops.p")}</Label><Input type="number" required value={inputs.p} onChange={(e) => setInputs({ ...inputs, p: e.target.value })} className="h-12" /></div>
            <div><Label>{t("crops.k")}</Label><Input type="number" required value={inputs.k} onChange={(e) => setInputs({ ...inputs, k: e.target.value })} className="h-12" /></div>
          </div>
          <div>
            <Label>{t("crops.ph")}</Label>
            <Input type="number" step="0.1" required value={inputs.ph} onChange={(e) => setInputs({ ...inputs, ph: e.target.value })} className="h-12" />
          </div>
          <div>
            <Label>{t("crops.season")}</Label>
            <Select value={inputs.season} onValueChange={(v) => setInputs({ ...inputs, season: v })}>
              <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="kharif">{t("crops.kharif")}</SelectItem>
                <SelectItem value="rabi">{t("crops.rabi")}</SelectItem>
                <SelectItem value="zaid">{t("crops.zaid")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={loading} className="w-full btn-tap">
            {loading ? <><Loader2 className="animate-spin mr-2" />{t("crops.saving")}</> : t("crops.get")}
          </Button>
        </form>
      </Card>

      {recs.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-lg">{t("crops.top")}</h2>
          {recs.map((r, i) => (
            <Card key={i} className="p-4 card-lift">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${i === 0 ? "bg-success text-success-foreground" : "bg-secondary text-secondary-foreground"}`}>
                    <Sprout size={22} />
                  </div>
                  <div>
                    <div className="font-bold text-lg">{r.crop}</div>
                    {r.confidence && <div className="text-xs text-muted-foreground">{r.confidence}</div>}
                  </div>
                </div>
                <SpeakButton text={`${r.crop}. ${r.reason}`} />
              </div>
              <p className="text-sm mt-2">{r.reason}</p>
              {r.tips && <p className="text-sm mt-1 text-muted-foreground">💡 {r.tips}</p>}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
