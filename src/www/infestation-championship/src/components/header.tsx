import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LogOut, Trophy, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

interface NavLink {
  to: string;
  label: string;
  exact?: boolean;
}

export function Header() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  const links: NavLink[] = [
    { to: "/", label: "Home", exact: true },
    { to: "/campeonatos", label: "Campeonatos" },
  ];
  if (user) {
    links.push({ to: "/meus-times", label: "Meus Times" });
    if (user.isAdmin) links.push({ to: "/admin/campeonatos", label: "Admin" });
    links.push({ to: "/perfil", label: "Perfil" });
  }

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/") || pathname.startsWith(to);

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-obsidian/85 backdrop-blur-xl border-b border-obsidian-border">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <Trophy className="size-6 md:size-7 text-blood-bright group-hover:scale-110 transition-transform" />
          <span className="font-display text-xl md:text-3xl font-bold tracking-wide uppercase mt-1 leading-none">
            Infestation <span className="text-blood-bright">Tournament</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                "font-bold tracking-widest uppercase text-sm pb-1 transition-colors border-b-2",
                isActive(l.to, l.exact)
                  ? "text-blood-bright border-blood-bright"
                  : "text-muted-foreground border-transparent hover:text-white",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <>
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                {user.nickName}
              </span>
              <button
                onClick={handleLogout}
                className="cyber-cut bg-obsidian-light border border-obsidian-border text-white font-bold uppercase tracking-widest text-xs px-5 py-2.5 hover:bg-blood hover:border-blood transition-colors flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="size-3.5" />
                Sair
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="cyber-cut bg-obsidian-light border border-obsidian-border text-white font-bold uppercase tracking-widest text-xs px-5 py-2.5 hover:bg-obsidian-border transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="cyber-cut bg-blood text-white font-bold uppercase tracking-widest text-xs px-5 py-2.5 hover:bg-blood-bright transition-colors glow-blood"
              >
                Registrar
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="lg:hidden text-white p-2"
          aria-label="Menu"
        >
          {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-obsidian-border bg-obsidian">
          <nav className="flex flex-col px-4 py-4 gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "font-bold tracking-widest uppercase text-sm py-3 px-3 border-l-2",
                  isActive(l.to, l.exact)
                    ? "text-blood-bright border-blood-bright bg-obsidian-light"
                    : "text-muted-foreground border-transparent",
                )}
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-3 mt-2 border-t border-obsidian-border flex flex-col gap-2">
              {user ? (
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="cyber-cut bg-blood text-white font-bold uppercase tracking-widest text-xs px-5 py-3 flex items-center justify-center gap-2"
                >
                  <LogOut className="size-3.5" /> Sair ({user.nickName})
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="cyber-cut bg-obsidian-light border border-obsidian-border text-white font-bold uppercase tracking-widest text-xs px-5 py-3 text-center"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="cyber-cut bg-blood text-white font-bold uppercase tracking-widest text-xs px-5 py-3 text-center"
                  >
                    Registrar
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
