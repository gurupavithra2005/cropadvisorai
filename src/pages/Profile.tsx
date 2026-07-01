import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { MapPin, Loader2 } from "lucide-react";
import { LANGS, setLang } from "@/lib/i18n";

export default function Profile() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: "", phone: "", village: "", district: "", state: "",
    latitude: null as number | null, longitude: null as number | null,
    land_size_acres: "" as string | number, land_type: "", irrigation: "",
  });

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data) setForm({
        full_name: data.full_name || "", phone: data.phone || "",
        village: data.village || "", district: data.district || "", state: data.state || "",
        latitude: data.latitude, longitude: data.longitude,
        land_size_acres: data.land_size_acres || "",
        land_type: data.land_type || "", irrigation: data.irrigation || "",
      });
      setLoading(false);
    });
  }, [user]);

  const detect = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      (p) => setForm((f) => ({ ...f, latitude: p.coords.latitude, longitude: p.coords.longitude })),
      () => toast.error("Could not get location")
    );
  };

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      ...form,
      land_size_acres: form.land_size_acres ? Number(form.land_size_acres) : null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      land_type: (form.land_type || null) as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      irrigation: (form.irrigation || null) as any,
      language: i18n.language,
    }).eq("id", user.id);
    setSaving(false);
    if (error) toast.error(error.message); else toast.success("Saved");
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" /></div>;

  const set = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t("profile.title")}</h1>

      <Card className="p-4 space-y-3">
        <div>
          <Label>{t("auth.name")}</Label>
          <Input value={form.full_name} onChange={(e) => set("full_name", e.target.value)} className="h-12" />
        </div>
        <div>
          <Label>{t("auth.phone")}</Label>
          <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} className="h-12" />
        </div>
        <div>
          <Label>{t("profile.language")}</Label>
          <div className="grid grid-cols-3 gap-2 mt-1">
            {LANGS.map((l) => (
              <button key={l.code} type="button" onClick={() => setLang(l.code)}
                className={`h-11 rounded-xl border-2 text-sm font-medium ${
                  i18n.language === l.code ? "border-primary bg-primary/10 text-primary" : "border-border"
                }`}>{l.label}</button>
            ))}
          </div>
        </div>
      </Card>

      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>{t("profile.village")}</Label>
            <Input value={form.village} onChange={(e) => set("village", e.target.value)} className="h-12" />
          </div>
          <div>
            <Label>{t("profile.district")}</Label>
            <Input value={form.district} onChange={(e) => set("district", e.target.value)} className="h-12" />
          </div>
        </div>
        <div>
          <Label>{t("profile.state")}</Label>
          <Input value={form.state} onChange={(e) => set("state", e.target.value)} className="h-12" />
        </div>
        <Button variant="outline" onClick={detect} className="w-full">
          <MapPin className="mr-2" size={18} /> {t("profile.detectLocation")}
          {form.latitude && <span className="ml-2 text-xs opacity-70">({form.latitude.toFixed(2)}, {form.longitude?.toFixed(2)})</span>}
        </Button>
      </Card>

      <Card className="p-4 space-y-3">
        <div>
          <Label>{t("profile.landSize")}</Label>
          <Input type="number" step="0.1" value={form.land_size_acres}
            onChange={(e) => set("land_size_acres", e.target.value)} className="h-12" />
        </div>
        <div>
          <Label>{t("profile.landType")}</Label>
          <Select value={form.land_type} onValueChange={(v) => set("land_type", v)}>
            <SelectTrigger className="h-12"><SelectValue placeholder="—" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="dry">{t("profile.dry")}</SelectItem>
              <SelectItem value="wet">{t("profile.wet")}</SelectItem>
              <SelectItem value="garden">{t("profile.garden")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>{t("profile.irrigation")}</Label>
          <Select value={form.irrigation} onValueChange={(v) => set("irrigation", v)}>
            <SelectTrigger className="h-12"><SelectValue placeholder="—" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="borewell">{t("profile.borewell")}</SelectItem>
              <SelectItem value="canal">{t("profile.canal")}</SelectItem>
              <SelectItem value="rainfed">{t("profile.rainfed")}</SelectItem>
              <SelectItem value="drip">{t("profile.drip")}</SelectItem>
              <SelectItem value="sprinkler">{t("profile.sprinkler")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Button onClick={save} disabled={saving} className="w-full btn-tap">
        {saving ? <Loader2 className="animate-spin" /> : t("profile.save")}
      </Button>
    </div>
  );
}
