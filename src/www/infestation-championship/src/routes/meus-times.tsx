import {
  createFileRoute,
  Link,
  Outlet,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { Plus, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useMeusTimes } from "@/hooks/api";
import {
  EmptyState,
  ErrorBox,
  PageHeader,
  PageLoader,
} from "@/components/ui-blocks";
import { CyberButton } from "@/components/cyber-button";
import { TeamLogo } from "@/components/team-logo";
import { getApiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export const Route = createFileRoute("/meus-times")({
  head: () => ({
    meta: [{ title: "Meus Times — Infestation Tournament" }],
  }),
  component: MeusTimesLayout,
});

function MeusTimesLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isLista =
    pathname === "/meus-times" || pathname === "/meus-times/";

  if (!isLista) {
    return <Outlet />;
  }

  return <MeusTimesLista />;
}

function MeusTimesLista() {
  const { t } = useTranslation();
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
        eyebrow={t("teams.roster")}
        title={t("teams.title")}
        description={t("teams.description")}
        actions={
          (!data || data.length === 0) ? (
            <Link
              to="/meus-times/novo"
              className="cyber-cut bg-blood text-white font-bold uppercase tracking-widest text-sm px-6 py-3 hover:bg-blood-bright transition-colors glow-blood inline-flex items-center gap-2"
            >
              <Plus className="size-4" />
              {t("teams.createTeam")}
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
              {t("common.tryAgain")}
            </CyberButton>
          }
        />
      )}
      {!isLoading && !error && (!data || data.length === 0) && (
        <EmptyState
          title={t("teams.noTeamYet")}
          description={t("teams.noTeamYetDesc")}
          action={
            <Link
              to="/meus-times/novo"
              className="cyber-cut bg-blood text-white font-bold uppercase tracking-widest text-sm px-6 py-3 hover:bg-blood-bright transition-colors glow-blood inline-flex items-center gap-2"
            >
              <Plus className="size-4" /> {t("teams.createMyTeam")}
            </Link>
          }
        />
      )}

      {data && data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.map((team) => {
            const souLider = String(team.liderId) === String(user?.id);
            return (
              <Link
                key={team.id}
                to="/meus-times/$id"
                params={{ id: String(team.id) }}
                className="cyber-cut-br bg-obsidian-light border border-obsidian-border border-l-4 border-l-blood-bright p-6 flex flex-col gap-4 hover:bg-obsidian-border/40 transition-colors group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    <TeamLogo url={team.logoUrl} name={team.nome} size={56} />
                    <div className="min-w-0">
                      {team.clanTag && (
                        <p className="text-blood-bright font-bold tracking-widest uppercase text-xs mb-1">
                          [{team.clanTag}]
                        </p>
                      )}
                      <h3 className="font-display text-3xl uppercase font-bold leading-none">
                        {team.nome}
                      </h3>
                    </div>
                  </div>
                  {souLider && (
                    <span className="cyber-badge bg-blood-bright text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                      {t("teams.leader")}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-6 mt-auto pt-4 border-t border-obsidian-border text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground uppercase tracking-wider text-xs">
                    <Users className="size-4" /> {team.totalJogadores}{" "}
                    {t("teams.players")}
                  </div>
                  <div className="text-blood-bright font-bold uppercase tracking-widest text-xs ml-auto group-hover:translate-x-1 transition-transform">
                    {t("teams.manage")}
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
