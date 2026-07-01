import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Trash2, Loader2, LineChart } from "lucide-react";
import { toast } from "sonner";

type Row = { id: string; commodity: string; market: string | null };
type Price = { commodity: string; market: string; state?: string; min: number; max: number; modal: number; date: string };

export default function Market() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [state, setState] = useState<string | null>(null);
  const [watch, setWatch] = useState<Row[]>([]);
  const [prices, setPrices] = useState<Record<string, Price[]>>({});
  const [newCrop, setNewCrop] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    const { data: p } = await supabase.from("profiles").select("state").eq("id", user.id).maybeSingle();
    setState(p?.state || null);
    const { data: w } = await supabase.from("market_watchlist").select("*").eq("user_id", user.id);
    setWatch((w || []) as Row[]);
    // Fetch prices for each
    const results: Record<string, Price[]> = {};
    await Promise.all((w || []).map(async (row) => {
      try {
        const { data } = await supabase.functions.invoke("market-prices", {
          body: { commodity: row.commodity, state: p?.state },
        });
        results[row.id] = data?.records || [];
      } catch { /* noop */ }
    }));
    setPrices(results);
    setLoading(false);
  };
  useEffect(() => { load(); }, [user]); // eslint-disable-line

  const add = async () => {
    if (!newCrop.trim() || !user) return;
    const { error } = await supabase.from("market_watchlist").insert({
      user_id: user.id, commodity: newCrop.trim(), market: null,
    });
    if (error) return toast.error(error.message);
    setNewCrop("");
    load();
  };

  const remove = async (id: string) => {
    await supabase.from("market_watchlist").delete().eq("id", id);
    load();
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{t("market.title")}</h1>
        {state && <p className="text-muted-foreground">{state}</p>}
      </div>

      <Card className="p-3 flex gap-2">
        <Input placeholder="Onion, Tomato, Paddy…" value={newCrop} onChange={(e) => setNewCrop(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()} className="h-12" />
        <Button onClick={add} className="h-12"><Plus /> {t("market.add")}</Button>
      </Card>

      {watch.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">{t("market.noneYet")}</Card>
      ) : (
        <div className="space-y-3">
          {watch.map((row) => (
            <Card key={row.id} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-accent/15 text-accent flex items-center justify-center">
                    <LineChart size={20} />
                  </div>
                  <div className="font-bold text-lg capitalize">{row.commodity}</div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => remove(row.id)}><Trash2 size={18} /></Button>
              </div>
              {prices[row.id]?.length ? (
                <div className="space-y-1.5 text-sm">
                  {prices[row.id].slice(0, 5).map((p, i) => (
                    <div key={i} className="flex justify-between gap-2 p-2 rounded-lg bg-secondary">
                      <div>
                        <div className="font-medium">{p.market}</div>
                        <div className="text-xs text-muted-foreground">{p.date}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary">₹{p.modal}</div>
                        <div className="text-xs text-muted-foreground">₹{p.min}–{p.max}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No prices found.</div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
