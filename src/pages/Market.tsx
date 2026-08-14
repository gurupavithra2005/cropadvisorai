import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Trash2, Loader2, LineChart, MapPin, RefreshCw } from "lucide-react";
import { toast } from "sonner";

type Row = { id: string; commodity: string; market: string | null };
type Price = {
  commodity: string;
  market: string;
  state?: string;
  district?: string;
  min: number;
  max: number;
  modal: number;
  date: string;
};
type Result = { records: Price[]; source?: string; scope?: string };

export default function Market() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [state, setState] = useState<string | null>(null);
  const [district, setDistrict] = useState("");
  const [watch, setWatch] = useState<Row[]>([]);
  const [prices, setPrices] = useState<Record<string, Result>>({});
  const [newCrop, setNewCrop] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPrices = async (rows: Row[], st: string | null, dist: string) => {
    const results: Record<string, Result> = {};
    await Promise.all(
      rows.map(async (row) => {
        try {
          const { data } = await supabase.functions.invoke("market-prices", {
            body: { commodity: row.commodity, state: st, district: dist || row.market || "" },
          });
          results[row.id] = { records: data?.records || [], source: data?.source, scope: data?.scope };
        } catch {
          results[row.id] = { records: [] };
        }
      })
    );
    setPrices(results);
  };

  const load = async () => {
    if (!user) return;
    const { data: p } = await supabase
      .from("profiles")
      .select("state, district")
      .eq("id", user.id)
      .maybeSingle();
    setState(p?.state || null);
    const dist = p?.district || "";
    setDistrict((d) => d || dist);
    const { data: w } = await supabase.from("market_watchlist").select("*").eq("user_id", user.id);
    const rows = (w || []) as Row[];
    setWatch(rows);
    await fetchPrices(rows, p?.state || null, dist);
    setLoading(false);
  };
  useEffect(() => { load(); }, [user]); // eslint-disable-line

  const refresh = async () => {
    setRefreshing(true);
    await fetchPrices(watch, state, district.trim());
    setRefreshing(false);
  };

  const add = async () => {
    if (!newCrop.trim() || !user) return;
    const { error } = await supabase.from("market_watchlist").insert({
      user_id: user.id,
      commodity: newCrop.trim(),
      market: district.trim() || null,
    });
    if (error) return toast.error(error.message);
    setNewCrop("");
    load();
  };

  const remove = async (id: string) => {
    await supabase.from("market_watchlist").delete().eq("id", id);
    load();
  };

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">{t("market.title")}</h1>
          {state && (
            <p className="text-muted-foreground">
              {district ? `${district}, ${state}` : state}
            </p>
          )}
        </div>
        <Button variant="outline" size="icon" className="h-11 w-11" onClick={refresh} disabled={refreshing}>
          <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
        </Button>
      </div>

      <Card className="p-3 space-y-2">
        <div className="flex items-center gap-2">
          <MapPin size={18} className="text-primary shrink-0" />
          <Input
            placeholder="District (e.g. Coimbatore)"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            onBlur={refresh}
            onKeyDown={(e) => e.key === "Enter" && refresh()}
            className="h-12"
          />
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Onion, Tomato, Paddy…"
            value={newCrop}
            onChange={(e) => setNewCrop(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            className="h-12"
          />
          <Button onClick={add} className="h-12">
            <Plus /> {t("market.add")}
          </Button>
        </div>
      </Card>

      {watch.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">{t("market.noneYet")}</Card>
      ) : (
        <div className="space-y-3">
          {watch.map((row) => {
            const res = prices[row.id];
            return (
              <Card key={row.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-accent/15 text-accent flex items-center justify-center">
                      <LineChart size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-lg capitalize">{row.commodity}</div>
                      {res?.scope && (
                        <div className="text-xs text-muted-foreground capitalize">
                          {res.source === "sample" ? "Sample data" : `${res.scope}-level live prices`}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => remove(row.id)}>
                    <Trash2 size={18} />
                  </Button>
                </div>
                {res?.records?.length ? (
                  <div className="space-y-1.5 text-sm">
                    {res.records.slice(0, 5).map((p, i) => (
                      <div key={i} className="flex justify-between gap-2 p-2 rounded-lg bg-secondary">
                        <div>
                          <div className="font-medium">{p.market}</div>
                          <div className="text-xs text-muted-foreground">
                            {[p.district, p.date].filter(Boolean).join(" · ")}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-primary">₹{p.modal}</div>
                          <div className="text-xs text-muted-foreground">
                            ₹{p.min}–{p.max}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No prices found.</div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
