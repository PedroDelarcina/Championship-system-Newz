import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Trophy } from "lucide-react";
import { useCampeonatos } from "@/hooks/api";
import { CampeonatoCard } from "@/components/campeonato-card";
import { CyberButton } from "@/components/cyber-button";
import { ErrorBox, PageLoader, EmptyState } from "@/components/ui-blocks";
import { getApiErrorMessage } from "@/lib/api";
import { statusCampeonatoKind } from "@/lib/status";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Infestation Tournament" },
      {
        name: "description",
        content:
          "Veja os campeonatos ativos da comunidade Infestation: The New Z. Inscreva seu Clan e dispute pelo topo.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { data, isLoading, error } = useCampeonatos();
  const ativos =
    data?.filter(
      (c) => c.status != null && statusCampeonatoKind(c.status) !== "finished"
    ) ?? [];

  return (
    <>
      {/* HERO */}
      <section className="relative pt-32 md:pt-40 pb-24 md:pb-32 flex flex-col items-center justify-center min-h-[80dvh] bg-grid overflow-hidden">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blood/30 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blood-bright/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-[1440px] mx-auto px-6 w-full flex flex-col items-center text-center relative z-10">
          <div className="cyber-badge inline-block bg-obsidian-border border border-obsidian-border px-4 py-1.5 mb-8">
            <span className="text-blood-bright font-bold tracking-[0.2em] text-xs uppercase">
              Inscrições Abertas
            </span>
          </div>

          <h1 className="font-display text-6xl md:text-8xl lg:text-[9rem] font-bold uppercase leading-[0.85] tracking-tight mb-6 drop-shadow-2xl">
            Campeonatos e 
            <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blood-bright to-white">
              Torneios
            </span>
          </h1>

          <p className="max-w-[65ch] text-muted-foreground text-base md:text-xl font-medium tracking-wide mb-12 uppercase text-balance">
            A maior plataforma de gestão de campeonatos da comunidade Infestation: The New Z.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/campeonatos"
              className="cyber-cut bg-blood text-white font-bold uppercase tracking-widest text-base md:text-lg px-10 md:px-12 py-4 hover:bg-blood-bright transition-colors glow-blood inline-flex items-center gap-3"
            >
              Explorar Campeonatos <ArrowRight className="size-5" />
            </Link>
            <Link
              to="/meus-times/novo"
              className="cyber-cut bg-obsidian-light border border-obsidian-border text-white font-bold uppercase tracking-widest text-base md:text-lg px-10 md:px-12 py-4 hover:bg-obsidian-border transition-colors"
            >
              Criar Time
            </Link>
          </div>
        </div>
      </section>

      {/* CIRCUITOS ATIVOS */}
      <section className="py-20 bg-obsidian border-t border-obsidian-border">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <p className="text-blood-bright font-bold tracking-[0.25em] uppercase text-xs mb-2">
                Live Now
              </p>
              <h2 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-wide leading-none">
                Campeonatos Ativos
              </h2>
              <div className="h-1 w-24 bg-blood-bright mt-4" />
            </div>
            <Link
              to="/campeonatos"
              className="text-white border-b-2 border-blood-bright pb-1 font-bold uppercase tracking-wider text-sm hover:text-blood-bright transition-colors inline-flex items-center gap-2 self-start"
            >
              Ver todos <ArrowRight className="size-4" />
            </Link>
          </div>

          {isLoading && <PageLoader label="Carregando campeonatos…" />}
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
          {!isLoading && !error && ativos.length === 0 && (
            <EmptyState
              title="Nenhum campeonato ativo"
              description="Aguarde — novos campeonatos serão anunciados em breve."
            />
          )}
          {ativos.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {ativos.slice(0, 6).map((c) => (
                <CampeonatoCard key={c.id} c={c} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="cyber-cut-br bg-obsidian-light border border-obsidian-border p-10 md:p-16 text-center relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blood/20 blur-[120px] rounded-full pointer-events-none" />
            <Trophy className="size-12 text-blood-bright mx-auto mb-6 relative z-10" />
            <h2 className="font-display text-4xl md:text-6xl uppercase font-bold tracking-wide relative z-10">
              Pronto para a guerra?
            </h2>
            <p className="text-muted-foreground uppercase tracking-widest text-sm md:text-base mt-4 max-w-xl mx-auto relative z-10">
              Crie sua conta, monte seu squad e inscreva-se nos próximos circuitos.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <Link
                to="/register"
                className="cyber-cut bg-blood text-white font-bold uppercase tracking-widest px-10 py-4 hover:bg-blood-bright transition-colors glow-blood"
              >
                Criar Conta
              </Link>
              <Link
                to="/campeonatos"
                className="cyber-cut bg-transparent border border-obsidian-border text-white font-bold uppercase tracking-widest px-10 py-4 hover:bg-obsidian-border transition-colors"
              >
                Ver Campeonatos
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
