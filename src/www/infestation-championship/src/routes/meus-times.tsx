import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Plus, Trophy, Users } from "lucide-react";
import { useMeusTimes } from "@/hooks/api";
import {
  EmptyState,
  ErrorBox,
  PageHeader,
  PageLoader,
} from "@/components/ui-blocks";
import { CyberButton } from "@/components/cyber-button";
import { getApiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export const Route = createFileRoute("/meus-times")({
  head: () => ({
    meta: [{ title: "Meus Times — Infestation Tournament" }],
  }),
  component: MeusTimesPage,
});

function MeusTimesPage() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const { user } = useAuthStore();
  const { data, isLoading, error } = useMeusTimes();

  useEffect(() => {
    if (!token) navigate({ to: "/login" });
  }, [token, navigate]);

  if (!token) return null;

  return (
    <section className="max-w-[1440px] mx-auto px-6 pb-20">
      <PageHeader
        eyebrow="Roster"
        title="Meus Times"
        description="Gerencie seu squad. Você pode pertencer a apenas um time."
        actions={
          (!data || data.length === 0) ? (
            <Link
              to="/meus-times/novo"
              className="cyber-cut bg-blood text-white font-bold uppercase tracking-widest text-sm px-6 py-3 hover:bg-blood-bright transition-colors glow-blood inline-flex items-center gap-2"
            >
              <Plus className="size-4" />
              Criar Time
            </Link>
          ) : undefined
        }
      />

      {isLoading && <PageLoader />}
      {error && (
        <ErrorBox
          message={getApiErrorMessage(error)}
          action={
            <CyberButton
              variant="secondary"
              size="sm"
              onClick={() => window.location.reload()}
            >
              Tentar novamente
            </CyberButton>
          }
        />
      )}
      {!isLoading && !error && (!data || data.length === 0) && (
        <EmptyState
          title="Você ainda não tem time"
          description="Crie um time para se inscrever em campeonatos."
          action={
            <Link
              to="/meus-times/novo"
              className="cyber-cut bg-blood text-white font-bold uppercase tracking-widest text-sm px-6 py-3 hover:bg-blood-bright transition-colors glow-blood inline-flex items-center gap-2"
            >
              <Plus className="size-4" /> Criar meu time
            </Link>
          }
        />
      )}

      {data && data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.map((t) => {
            const souLider = String(t.liderId) === String(user?.id);
            return (
              <Link
                key={t.id}
                to="/meus-times/$id"
                params={{ id: String(t.id) }}
                className="cyber-cut-br bg-obsidian-light border border-obsidian-border border-l-4 border-l-blood-bright p-6 flex flex-col gap-4 hover:bg-obsidian-border/40 transition-colors group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    {t.clanTag && (
                      <p className="text-blood-bright font-bold tracking-widest uppercase text-xs mb-1">
                        [{t.clanTag}]
                      </p>
                    )}
                    <h3 className="font-display text-3xl uppercase font-bold leading-none">
                      {t.nome}
                    </h3>
                  </div>
                  {souLider && (
                    <span className="cyber-badge bg-blood-bright text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                      Líder
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-6 mt-auto pt-4 border-t border-obsidian-border text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground uppercase tracking-wider text-xs">
                    <Users className="size-4" /> {t.totalJogadores}{" "}
                    jogadores
                  </div>
                  <div className="text-blood-bright font-bold uppercase tracking-widest text-xs ml-auto group-hover:translate-x-1 transition-transform">
                    Gerenciar →
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
