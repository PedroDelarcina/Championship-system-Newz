import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Trophy, Users, Award, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  useCampeonato,
  useInscreverCampeonato,
  useMeusTimes,
} from "@/hooks/api";
import { CyberButton } from "@/components/cyber-button";
import { StatusBadge } from "@/components/status-badge";
import { ErrorBox, PageLoader } from "@/components/ui-blocks";
import { getApiErrorMessage } from "@/lib/api";
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

function safeFormat(d?: string) {
  if (!d) return "—";
  try {
    return format(parseISO(d), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  } catch {
    return "—";
  }
}

function CampeonatoDetalhePage() {
  const { id } = Route.useParams();
  const router = useRouter();
  const { data: c, isLoading, error } = useCampeonato(id);
  const { user } = useAuthStore();
  const { data: meusTimes } = useMeusTimes();
  const inscrever = useInscreverCampeonato();

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
          message={error ? getApiErrorMessage(error) : "Campeonato não encontrado"}
          action={
            <CyberButton
              variant="secondary"
              size="sm"
              onClick={() => router.invalidate()}
            >
              Tentar novamente
            </CyberButton>
          }
        />
      </div>
    );
  }

  const kind = statusCampeonatoKind(c.status);
  const totalInscritos = c.totalInscricoes ?? c.inscricoes?.length ?? 0;

  const meuTime = meusTimes?.[0];
  const souLider = meuTime ? String(meuTime.liderId) === String(user?.id) : false;
  const jaInscrito = meuTime
    ? c.inscricoes?.some((i) => i.timeNome === meuTime.nome)
    : false;

  const podeInscrever =
    !!user &&
    !!meuTime &&
    souLider &&
    !jaInscrito &&
    kind === "open";

  const handleInscrever = async () => {
    try {
      await inscrever.mutateAsync({
        campeonatoId: Number(c.id),
        timeId: Number(meuTime?.id),
      });
      toast.success("Inscrição enviada! Aguardando aprovação.");
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
            ← Voltar para campeonatos
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
                Regras
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
                Regras Extras
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
              Times Inscritos ({c.inscricoes?.length ?? 0})
            </h2>
            {!c.inscricoes || c.inscricoes.length === 0 ? (
              <p className="text-muted-foreground text-sm uppercase tracking-wider">
                Nenhum time inscrito ainda.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {c.inscricoes.map((i) => (
                  <div
                    key={i.id}
                    className="cyber-cut bg-obsidian-light border border-obsidian-border p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-white">
                        {i.timeNome}
                      </p>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">
                        {statusInscricaoLabel(i.status)}
                      </p>
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
                <Users className="size-3" /> Inscritos
              </p>
              <p className="font-display text-4xl">
                {totalInscritos}
              </p>
            </div>
            <div className="border-t border-obsidian-border pt-4">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1 flex items-center gap-1">
                <Calendar className="size-3" /> Início
              </p>
              <p className="font-bold">{safeFormat(c.dataInicio)}</p>
            </div>
            {c.dataFim && (
              <div className="border-t border-obsidian-border pt-4">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1 flex items-center gap-1">
                  <Calendar className="size-3" /> Fim
                </p>
                <p className="font-bold">{safeFormat(c.dataFim)}</p>
              </div>
            )}
            {c.campeao && (
              <div className="border-t border-obsidian-border pt-4">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1 flex items-center gap-1">
                  <Trophy className="size-3" /> Campeão atual
                </p>
                <p className="font-bold text-status-open">{c.campeao}</p>
              </div>
            )}
          </div>

          {/* CTA contextual */}
          {!user && (
            <Link
              to="/login"
              className="cyber-cut block text-center bg-blood text-white font-bold uppercase tracking-widest text-sm px-6 py-4 hover:bg-blood-bright transition-colors glow-blood"
            >
              Entrar para inscrever time
            </Link>
          )}
          {user && !meuTime && (
            <Link
              to="/meus-times/novo"
              className="cyber-cut block text-center bg-blood text-white font-bold uppercase tracking-widest text-sm px-6 py-4 hover:bg-blood-bright transition-colors glow-blood"
            >
              Criar time para participar
            </Link>
          )}
          {user && meuTime && !souLider && (
            <div className="cyber-cut bg-obsidian-light border border-obsidian-border p-4 text-center text-xs text-muted-foreground uppercase tracking-wider flex items-center justify-center gap-2">
              <ShieldCheck className="size-4" />
              Apenas o líder pode inscrever o time
            </div>
          )}
          {jaInscrito && (
            <div className="cyber-cut bg-status-open/10 border border-status-open p-4 text-center text-xs text-status-open uppercase tracking-wider font-bold">
              Seu time já está inscrito
            </div>
          )}
          {podeInscrever && (
            <CyberButton
              size="lg"
              loading={inscrever.isPending}
              onClick={handleInscrever}
              className="w-full"
            >
              Inscrever Time
            </CyberButton>
          )}
        </aside>
      </div>
    </article>
  );
}
