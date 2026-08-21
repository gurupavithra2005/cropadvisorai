import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, Camera, Upload, Bug } from "lucide-react";
import { SpeakButton } from "@/components/VoiceButtons";

type Scan = {
  id: string; image_url: string | null; crop: string | null;
  diagnosis: string | null; severity: string | null; treatment: string | null;
  created_at: string;
};

// Phone photos are 3-8 MB. Downscaling to 1024 px JPEG cuts the base64 payload
// (and therefore upload + model latency) by ~10x with no diagnostic loss.
async function compressImage(file: File, maxSide = 1024, quality = 0.72) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();
  const dataUrl = canvas.toDataURL("image/jpeg", quality);
  const blob: Blob = await new Promise((res) =>
    canvas.toBlob((b) => res(b as Blob), "image/jpeg", quality)
  );
  return { dataUrl, blob };
}


export default function Pest() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [current, setCurrent] = useState<{ img: string } & Partial<Scan> | null>(null);
  const [history, setHistory] = useState<Scan[]>([]);

  const loadHistory = async () => {
    if (!user) return;
    const { data } = await supabase.from("pest_scans").select("*")
      .eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
    setHistory((data || []) as Scan[]);
  };
  useEffect(() => { loadHistory(); }, [user]); // eslint-disable-line

  const scan = async (file: File) => {
    if (!user) return;
    setBusy(true);
    try {
      const { dataUrl, blob } = await compressImage(file);
      setCurrent({ img: dataUrl });

      const path = `${user.id}/${Date.now()}.jpg`;

      // Run the AI diagnosis and the storage upload in parallel so the farmer
      // sees the result as soon as the model answers.
      const aiPromise = supabase.functions.invoke("pest-detect", {
        body: { imageBase64: dataUrl, language: i18n.language },
      });
      const uploadPromise = (async () => {
        const { error: upErr } = await supabase.storage
          .from("pest-scans").upload(path, blob, { contentType: "image/jpeg" });
        if (upErr) return null;
        const { data: signed } = await supabase.storage
          .from("pest-scans").createSignedUrl(path, 60 * 60 * 24 * 30);
        return signed?.signedUrl ?? null;
      })();

      const [{ data, error }, signedUrl] = await Promise.all([aiPromise, uploadPromise]);
      if (error) throw error;

      setCurrent({ img: dataUrl, ...(data as Partial<Scan>) });

      const rec = {
        user_id: user.id, image_url: signedUrl,
        crop: data.crop || null, diagnosis: data.diagnosis || null,
        severity: data.severity || null, treatment: data.treatment || null,
        raw_response: data,
      };
      const { data: inserted } = await supabase.from("pest_scans").insert(rec).select().single();
      setCurrent({ img: dataUrl, ...(inserted as Scan) });
      loadHistory();
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toast.error((e as any)?.message || t("common.error"));
    } finally {
      setBusy(false);
    }
  };


  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{t("pest.title")}</h1>
        <p className="text-muted-foreground">{t("pest.subtitle")}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button onClick={() => camRef.current?.click()} className="btn-tap gradient-earth text-primary-foreground border-0" disabled={busy}>
          <Camera className="mr-2" /> {t("pest.capture")}
        </Button>
        <Button onClick={() => fileRef.current?.click()} variant="outline" className="btn-tap" disabled={busy}>
          <Upload className="mr-2" /> {t("pest.upload")}
        </Button>
        <input ref={camRef} type="file" accept="image/*" capture="environment" hidden
          onChange={(e) => e.target.files?.[0] && scan(e.target.files[0])} />
        <input ref={fileRef} type="file" accept="image/*" hidden
          onChange={(e) => e.target.files?.[0] && scan(e.target.files[0])} />
      </div>

      {busy && (
        <Card className="p-6 flex items-center justify-center gap-3 text-primary">
          <Loader2 className="animate-spin" /> {t("pest.scanning")}
        </Card>
      )}

      {current && !busy && (
        <Card className="p-4 space-y-3 card-lift">
          <img src={current.img} alt="Scan" className="w-full max-h-72 object-contain rounded-xl bg-secondary" />
          {current.diagnosis && (
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs uppercase text-muted-foreground">{t("pest.diagnosis")}</div>
                  <div className="text-lg font-bold flex items-center gap-2"><Bug className="text-warning" />{current.diagnosis}</div>
                  {current.crop && <div className="text-sm text-muted-foreground">{current.crop}</div>}
                </div>
                <SpeakButton text={`${current.diagnosis}. ${current.treatment || ""}`} />
              </div>
              {current.severity && (
                <div><span className="text-xs uppercase text-muted-foreground">{t("pest.severity")}: </span><span className="font-medium">{current.severity}</span></div>
              )}
              {current.treatment && (
                <div>
                  <div className="text-xs uppercase text-muted-foreground">{t("pest.treatment")}</div>
                  <p className="text-sm whitespace-pre-wrap">{current.treatment}</p>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {history.length > 0 && (
        <div>
          <h2 className="font-semibold text-lg mb-2">{t("pest.history")}</h2>
          <div className="grid grid-cols-3 gap-2">
            {history.map((h) => (
              <div key={h.id} className="aspect-square rounded-xl overflow-hidden bg-secondary relative">
                {h.image_url ? (
                  <img src={h.image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground"><Bug /></div>
                )}
                {h.diagnosis && (
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[10px] p-1 truncate">
                    {h.diagnosis}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
