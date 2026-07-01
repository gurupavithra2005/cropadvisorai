import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Home, Sprout, FlaskConical, Bug, CloudSun, LineChart, LogOut, Globe, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { LANGS, setLang } from "@/lib/i18n";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChatFab } from "@/components/ChatFab";

const navItems = [
  { to: "/", icon: Home, key: "nav.home" },
  { to: "/crops", icon: Sprout, key: "nav.crops" },
  { to: "/fertilizer", icon: FlaskConical, key: "nav.fertilizer" },
  { to: "/pest", icon: Bug, key: "nav.pest" },
  { to: "/weather", icon: CloudSun, key: "nav.weather" },
  { to: "/market", icon: LineChart, key: "nav.market" },
];

export default function AppLayout() {
  const { t, i18n } = useTranslation();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur">
        <div className="max-w-2xl mx-auto flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl gradient-earth flex items-center justify-center">
              <Sprout className="text-primary-foreground" size={20} />
            </div>
            <span className="font-bold text-base leading-tight">{t("appName")}</span>
          </div>
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Language"><Globe size={20} /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {LANGS.map((l) => (
                  <DropdownMenuItem key={l.code} onClick={() => setLang(l.code)}
                    className={i18n.language === l.code ? "font-bold" : ""}>
                    {l.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" onClick={() => navigate("/profile")} aria-label="Profile">
              <User size={20} />
            </Button>
            <Button variant="ghost" size="icon" onClick={async () => { await signOut(); navigate("/auth"); }} aria-label="Sign out">
              <LogOut size={20} />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-24">
        <div className="max-w-2xl mx-auto px-4 py-4 animate-fade-in">
          <Outlet />
        </div>
      </main>

      <ChatFab />

      <nav className="fixed bottom-0 inset-x-0 z-40 border-t bg-card/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-2xl mx-auto grid grid-cols-6">
          {navItems.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === "/"}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`
              }>
              {({ isActive }) => (
                <>
                  <n.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  <span>{t(n.key)}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
