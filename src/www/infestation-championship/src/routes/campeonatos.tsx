import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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
  component: CampeonatosLayout,
});

type Filtro = "todos" | "open" | "running" | "finished";

function CampeonatosLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isLista =
    pathname === "/campeonatos" || pathname === "/campeonatos/";

  if (!isLista) {
    return <Outlet />;
  }

  return <CampeonatosLista />;
}

function CampeonatosLista() {
  const { t } = useTranslation();
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const { data, isLoading, error } = useCampeonatos();

  const filtros = useMemo(
    () =>
      [
        { value: "todos" as const, label: t("status.filter.all") },
        { value: "open" as const, label: t("status.filter.open") },
        { value: "running" as const, label: t("status.filter.running") },
        { value: "finished" as const, label: t("status.filter.finished") },
      ] satisfies { value: Filtro; label: string }[],
    [t],
  );

  const filtrados = (data ?? []).filter((c) =>
    filtro === "todos" ? true : statusCampeonatoKind(c.status) === filtro,
  );

  return (
    <section className="max-w-[1440px] mx-auto px-6 pb-20">
      <PageHeader
        eyebrow={t("tournaments.dataGrid")}
        title={t("tournaments.title")}
        description={t("tournaments.description")}
      />

      <div className="flex flex-wrap gap-2 mb-8 border-b border-obsidian-border pb-4">
        {filtros.map((f) => (
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
              {t("common.tryAgain")}
            </CyberButton>
          }
        />
      )}
      {!isLoading && !error && filtrados.length === 0 && (
        <EmptyState
          title={t("tournaments.noneFound")}
          description={t("tournaments.noneFoundDesc")}
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
