import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useCampeonatos } from "@/hooks/api";
import { CampeonatoCard } from "@/components/campeonato-card";
import { CyberButton } from "@/components/cyber-button";
import {
  EmptyState,
  ErrorBox,
  PageHeader,
  PageLoader,
} from "@/components/ui-blocks";
import { getApiErrorMessage } from "@/lib/api";
import { statusCampeonatoKind } from "@/lib/status";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/campeonatos")({
  head: () => ({
    meta: [
      { title: "Campeonatos — Infestation Tournament" },
      {
        name: "description",
        content:
          "Lista completa de campeonatos da comunidade Infestation: The New Z.",
      },
    ],
  }),
  component: CampeonatosPage,
});

type Filtro = "todos" | "open" | "running" | "finished";

const FILTROS: { value: Filtro; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "open", label: "Inscrições Abertas" },
  { value: "running", label: "Em Andamento" },
  { value: "finished", label: "Finalizados" },
];

function CampeonatosPage() {
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const { data, isLoading, error } = useCampeonatos();

  const filtrados = (data ?? []).filter((c) =>
    filtro === "todos" ? true : statusCampeonatoKind(c.status) === filtro,
  );

  return (
    <section className="max-w-[1440px] mx-auto px-6 pb-20">
      <PageHeader
        eyebrow="Data Grid"
        title="Campeonatos"
        description="Todos os circuitos disponíveis. Filtre por status para encontrar o seu próximo desafio."
      />

      <div className="flex flex-wrap gap-2 mb-8 border-b border-obsidian-border pb-4">
        {FILTROS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFiltro(f.value)}
            className={cn(
              "px-4 py-2 font-bold uppercase tracking-widest text-xs border-b-2 transition-colors",
              filtro === f.value
                ? "text-blood-bright border-blood-bright"
                : "text-muted-foreground border-transparent hover:text-white",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

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
      {!isLoading && !error && filtrados.length === 0 && (
        <EmptyState
          title="Nenhum campeonato encontrado"
          description="Ajuste o filtro ou aguarde novos torneios."
        />
      )}
      {filtrados.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filtrados.map((c) => (
            <CampeonatoCard key={c.id} c={c} />
          ))}
        </div>
      )}
    </section>
  );
}
