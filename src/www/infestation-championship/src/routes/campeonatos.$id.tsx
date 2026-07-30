import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import type { Locale } from "date-fns";
import { Calendar, Trophy, Users, Award, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  useCampeonato,
  useInscreverCampeonato,
  useInscreverSolo,
  useMeusTimes,
} from "@/hooks/api";
import { CyberButton } from "@/components/cyber-button";
import { StatusBadge } from "@/components/status-badge";
import { TeamLogo } from "@/components/team-logo";
import { ErrorBox, PageLoader } from "@/components/ui-blocks";
import { getApiErrorMessage } from "@/lib/api";
import { getDateLocale } from "@/lib/date-locale";
import { useAuthStore } from "@/stores/auth-store";
import { statusCampeonatoKind, statusInscricaoLabel } from "@/lib/status";

export const Route = createFileRoute("/campeonatos/$id")({
  head: ({ params }) => ({
    meta: [
      {
        title: `Campeonato #${params.id} — Infestation Tournament`,
      },
      {
        name: "description",
        content: "Detalhes, regras e times inscritos no campeonato.",
      },
    ],
  }),
  component: CampeonatoDetalhePage,
});

function safeFormat(d: string | undefined, locale: Locale) {
  if (!d) return "—";
  try {
    return format(parseISO(d), "PPP", { locale });
  } catch {
    return "—";
  }
}

function CampeonatoDetalhePage() {
  const { t, i18n } = useTranslation();
  const { id } = Route.useParams();
  const router = useRouter();
  const { data: c, isLoading, error } = useCampeonato(id);
  const { user } = useAuthStore();
  const { data: meusTimes } = useMeusTimes();
  const inscrever = useInscreverCampeonato();
  const inscreverSolo = useInscreverSolo();
  const dateLocale = getDateLocale(i18n.language);

  if (isLoading) {
    return (
      <div className="pt-24">
        <PageLoader />
      </div>
    );
  }
  if (error || !c) {
    return (
      <div className="max-w-3xl mx-auto px-6 pt-32">
        <ErrorBox
          message={error ? getApiErrorMessage(error) : t("tournaments.notFound")}
          action={
            <CyberButton
              variant="secondary"
              size="sm"
              onClick={() => router.invalidate()}
            >
              {t("common.tryAgain")}
            </CyberButton>
          }
        />
      </div>
    );
  }

  const kind = statusCampeonatoKind(c.status);
  const totalInscritos = c.totalInscricoes ?? c.inscricoes?.length ?? 0;

  const isSolo = c.tipo === "Solo";
  const meuTime = meusTimes?.[0];
  const souLider = meuTime ? String(meuTime.liderId) === String(user?.id) : false;

  const jaInscrito = isSolo
    ? c.inscricoes?.some(
        (i) =>
          String(i.usuarioId) === String(user?.id) &&
          String(i.status).toLowerCase() !== "cancelado",
      )
    : meuTime
      ? c.inscricoes?.some((i) => {
          const mesmoTime =
            (typeof i.timeId === "number" &&
              i.timeId > 0 &&
              i.timeId === meuTime.id) ||
            (!i.timeId && i.timeNome === meuTime.nome);
          return (
            mesmoTime && String(i.status).toLowerCase() !== "cancelado"
          );
        })
      : false;

  const podeInscreverTime =
    !!user &&
    !!meuTime &&
    souLider &&
    !jaInscrito &&
    kind === "open" &&
    c.isAtivo !== false &&
    !isSolo;

  const podeInscreverSolo =
    !!user &&
    isSolo &&
    !jaInscrito &&
    kind === "open" &&
    c.isAtivo !== false;

  const handleInscrever = async () => {
    try {
      if (isSolo) {
        await inscreverSolo.mutateAsync(Number(c.id));
      } else {
        await inscrever.mutateAsync({
          campeonatoId: Number(c.id),
          timeId: Number(meuTime?.id),
        });
      }
      toast.success(t("tournaments.registrationSent"));
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  return (
    <article className="pb-20">
      {/* Hero */}
      <div className="relative h-[300px] md:h-[420px] overflow-hidden bg-obsidian-light">
        <div className="absolute inset-0 bg-grid" />
        <div className="absolute inset-0 bg-linear-to-t from-obsidian via-obsidian/60 to-obsidian/30" />
        <div className="absolute inset-x-0 bottom-0 max-w-[1440px] mx-auto px-6 pb-10 pt-24">
          <Link
            to="/campeonatos"
            className="text-xs uppercase tracking-widest text-muted-foreground hover:text-white mb-4 inline-block"
          >
            {t("tournaments.backToList")}
          </Link>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <StatusBadge status={c.status} />
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold">
              {c.tipo}
            </span>
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-bold uppercase tracking-wide leading-none">
            {c.nome}
          </h1>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Conteúdo principal */}
        <div className="lg:col-span-2 space-y-8">
          {c.descricaoRegras && (
            <section>
              <h2 className="font-display text-2xl uppercase mb-3 text-blood-bright">
                {t("tournaments.rules")}
              </h2>
              <div className="cyber-cut-br bg-obsidian-light border border-obsidian-border p-6">
                <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-tech leading-relaxed">
                  {c.descricaoRegras}
                </pre>
              </div>
            </section>
          )}
          {c.regrasExtras && (
            <section>
              <h2 className="font-display text-2xl uppercase mb-3 text-blood-bright">
                {t("tournaments.extraRules")}
              </h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {c.regrasExtras}
              </p>
            </section>
          )}

          {/* Times inscritos */}
          <section>
            <h2 className="font-display text-2xl uppercase mb-3 text-blood-bright flex items-center gap-2">
              <Users className="size-5" />
              {t("tournaments.registeredTeams", {
                count: c.inscricoes?.length ?? 0,
              })}
            </h2>
            {!c.inscricoes || c.inscricoes.length === 0 ? (
              <p className="text-muted-foreground text-sm uppercase tracking-wider">
                {t("tournaments.noRegisteredTeams")}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {c.inscricoes.map((i) => (
                  <div
                    key={i.id}
                    className="cyber-cut bg-obsidian-light border border-obsidian-border p-4 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <TeamLogo
                        url={i.logoUrl}
                        name={i.timeNome}
                        size={44}
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate">
                          {i.timeNome}
                        </p>
                        {i.timeTag && (
                          <p className="text-xs text-blood-bright uppercase tracking-wider">
                            [{i.timeTag}]
                          </p>
                        )}
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">
                          {statusInscricaoLabel(i.status, t)}
                        </p>
                      </div>
                    </div>
                    {String(i.status).toLowerCase().includes("campe") && (
                      <Award className="size-6 text-status-open" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="cyber-cut-br bg-obsidian-light border border-obsidian-border border-l-4 border-l-blood-bright p-6 space-y-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1 flex items-center gap-1">
                <Users className="size-3" /> {t("tournaments.registeredCount")}
              </p>
              <p className="font-display text-4xl">
                {totalInscritos}
              </p>
            </div>
            <div className="border-t border-obsidian-border pt-4">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1 flex items-center gap-1">
                <Calendar className="size-3" /> {t("tournaments.start")}
              </p>
              <p className="font-bold">{safeFormat(c.dataInicio, dateLocale)}</p>
            </div>
            {c.dataFim && (
              <div className="border-t border-obsidian-border pt-4">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1 flex items-center gap-1">
                  <Calendar className="size-3" /> {t("tournaments.end")}
                </p>
                <p className="font-bold">{safeFormat(c.dataFim, dateLocale)}</p>
              </div>
            )}
            {c.campeao && (
              <div className="border-t border-obsidian-border pt-4">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1 flex items-center gap-1">
                  <Trophy className="size-3" /> {t("tournaments.currentChampion")}
                </p>
                <p className="font-bold text-status-open">{c.campeao}</p>
              </div>
            )}
          </div>

          {/* CTA contextual */}
          {kind === "disabled" && (
            <div className="cyber-cut bg-destructive/10 border border-destructive/40 p-4 text-center text-xs text-destructive uppercase tracking-wider font-bold">
              {t("tournaments.disabledByAdmin")}
            </div>
          )}
          {!user && (
            <Link
              to="/login"
              className="cyber-cut block text-center bg-blood text-white font-bold uppercase tracking-widest text-sm px-6 py-4 hover:bg-blood-bright transition-colors glow-blood"
            >
              {t("tournaments.loginToRegister")}
            </Link>
          )}
          {user && !isSolo && !meuTime && (
            <Link
              to="/meus-times/novo"
              className="cyber-cut block text-center bg-blood text-white font-bold uppercase tracking-widest text-sm px-6 py-4 hover:bg-blood-bright transition-colors glow-blood"
            >
              {t("tournaments.createTeamToJoin")}
            </Link>
          )}
          {user && !isSolo && meuTime && !souLider && (
            <div className="cyber-cut bg-obsidian-light border border-obsidian-border p-4 text-center text-xs text-muted-foreground uppercase tracking-wider flex items-center justify-center gap-2">
              <ShieldCheck className="size-4" />
              {t("tournaments.leaderOnlyRegister")}
            </div>
          )}
          {jaInscrito && (
            <div className="cyber-cut bg-status-open/10 border border-status-open p-4 text-center text-xs text-status-open uppercase tracking-wider font-bold">
              {t("tournaments.alreadyRegistered")}
            </div>
          )}
          {podeInscreverTime && (
            <CyberButton
              size="lg"
              loading={inscrever.isPending}
              onClick={handleInscrever}
              className="w-full"
            >
              {t("tournaments.registerTeam")}
            </CyberButton>
          )}
          {podeInscreverSolo && (
            <CyberButton
              size="lg"
              loading={inscreverSolo.isPending}
              onClick={handleInscrever}
              className="w-full"
            >
              {t("tournaments.registerNow")}
            </CyberButton>
          )}
        </aside>
      </div>
    </article>
  );
}
