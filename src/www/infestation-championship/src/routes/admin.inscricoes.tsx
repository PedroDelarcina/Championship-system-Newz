import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import type { Locale } from "date-fns";
import { Award, Check, Skull, Trash2, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  useAprovarInscricao,
  useCampeonatos,
  useDefinirCampeao,
  useEliminarInscricao,
  useInscricoes,
  useRemoverInscricao,
  useReprovarInscricao,
} from "@/hooks/api";
import { CyberButton } from "@/components/cyber-button";
import { InscricaoStatusBadge } from "@/components/inscricao-status-badge";
import {
  EmptyState,
  ErrorBox,
  PageHeader,
  PageLoader,
} from "@/components/ui-blocks";
import { getApiErrorMessage } from "@/lib/api";
import { getDateLocale } from "@/lib/date-locale";
import { inscricaoStatusAtiva, statusInscricaoKind } from "@/lib/status";
import { useAuthStore } from "@/stores/auth-store";
import type { Inscricao, StatusInscricao } from "@/types/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/inscricoes")({
  head: () => ({
    meta: [{ title: "Admin · Inscrições — Infestation Tournament" }],
  }),
  component: AdminInscricoesPage,
});

type FiltroStatus =
  | "todas"
  | "Pendente"
  | "Confirmado"
  | "Cancelado"
  | "Eliminado"
  | "Campeao";

function safeFormat(d: string | undefined, locale: Locale) {
  if (!d) return "—";
  try {
    return format(parseISO(d), "dd/MM/yyyy HH:mm", { locale });
  } catch {
    return "—";
  }
}

function statusMatchesFiltro(status: StatusInscricao, filtro: FiltroStatus) {
  if (filtro === "todas") return true;
  return statusInscricaoKind(status) === statusInscricaoKind(filtro);
}

function AdminInscricoesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data, isLoading, error } = useInscricoes();
  const { data: campeonatos } = useCampeonatos();
  const aprovar = useAprovarInscricao();
  const reprovar = useReprovarInscricao();
  const eliminar = useEliminarInscricao();
  const campeao = useDefinirCampeao();
  const remover = useRemoverInscricao();

  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>("todas");
  const [filtroCampeonatoId, setFiltroCampeonatoId] = useState<string>("todos");

  const filtrosStatus = useMemo(
    () =>
      [
        { value: "todas" as const, label: t("status.registrationFilter.all") },
        {
          value: "Pendente" as const,
          label: t("status.registrationFilter.pending"),
        },
        {
          value: "Confirmado" as const,
          label: t("status.registrationFilter.confirmed"),
        },
        {
          value: "Cancelado" as const,
          label: t("status.registrationFilter.canceled"),
        },
        {
          value: "Eliminado" as const,
          label: t("status.registrationFilter.eliminated"),
        },
        {
          value: "Campeao" as const,
          label: t("status.registrationFilter.champion"),
        },
      ] satisfies { value: FiltroStatus; label: string }[],
    [t],
  );

  useEffect(() => {
    if (!user) navigate({ to: "/login" });
    else if (!user.isAdmin) navigate({ to: "/" });
  }, [user, navigate]);

  const filtradas = useMemo(() => {
    return (data ?? []).filter((i) => {
      const okStatus = statusMatchesFiltro(i.status, filtroStatus);
      const okCamp =
        filtroCampeonatoId === "todos" ||
        String(i.campeonatoId) === filtroCampeonatoId;
      return okStatus && okCamp;
    });
  }, [data, filtroStatus, filtroCampeonatoId]);

  const contagemPendentes = (data ?? []).filter(
    (i) => statusInscricaoKind(i.status) === "pending",
  ).length;

  if (!user?.isAdmin) return null;

  const handle = async (
    fn: { mutateAsync: (id: number) => Promise<unknown>; isPending: boolean },
    id: number,
    msg: string,
  ) => {
    try {
      await fn.mutateAsync(id);
      toast.success(msg);
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  const handleRemover = async (i: Inscricao) => {
    const msg = inscricaoStatusAtiva(i.status)
      ? t("admin.confirmRemoveActive", {
          team: i.timeNome,
          tournament: i.campeonatoNome,
        })
      : t("admin.confirmRemoveInactive", { team: i.timeNome });
    if (!confirm(msg)) return;
    try {
      await remover.mutateAsync(i.id);
      toast.success(t("admin.registrationRemoved"));
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  const anyPending =
    aprovar.isPending ||
    reprovar.isPending ||
    eliminar.isPending ||
    campeao.isPending ||
    remover.isPending;

  return (
    <section className="max-w-[1440px] mx-auto px-6 pb-20">
      <PageHeader
        eyebrow={t("admin.console")}
        title={t("admin.registrationsTitle")}
        description={t("admin.registrationsDescription")}
        actions={
          <Link
            to="/admin/campeonatos"
            className="cyber-cut bg-obsidian-light border border-obsidian-border text-white font-bold uppercase tracking-widest text-xs px-5 py-2.5 hover:bg-obsidian-border transition-colors"
          >
            {t("nav.tournaments")}
          </Link>
        }
      />

      {/* Filtros */}
      <div className="flex flex-col lg:flex-row lg:items-end gap-4 mb-8">
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">
            {t("common.status")}
            {contagemPendentes > 0 && (
              <span className="ml-2 text-amber-400">
                {t("admin.pendingCount", { count: contagemPendentes })}
              </span>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            {filtrosStatus.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFiltroStatus(f.value)}
                className={cn(
                  "px-3 py-1.5 font-bold uppercase tracking-widest text-[10px] border transition-colors",
                  filtroStatus === f.value
                    ? "bg-blood-bright text-white border-blood-bright"
                    : "bg-obsidian-light border-obsidian-border text-muted-foreground hover:text-white",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className="w-full lg:w-72">
          <label
            htmlFor="filtro-campeonato"
            className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2 block"
          >
            {t("nav.tournaments")}
          </label>
          <select
            id="filtro-campeonato"
            value={filtroCampeonatoId}
            onChange={(e) => setFiltroCampeonatoId(e.target.value)}
            className="w-full cyber-cut bg-obsidian border border-obsidian-border px-4 py-2.5 text-sm uppercase tracking-wider"
          >
            <option value="todos">{t("admin.allTournaments")}</option>
            {(campeonatos ?? []).map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading && <PageLoader />}
      {error && <ErrorBox message={getApiErrorMessage(error)} />}

      {!isLoading && !error && filtradas.length === 0 && (
        <EmptyState
          title={t("admin.noRegistrations")}
          description={t("admin.noRegistrationsDesc")}
        />
      )}

      {!isLoading && !error && filtradas.length > 0 && (
        <div className="cyber-cut-br bg-obsidian-light border border-obsidian-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-obsidian border-b border-obsidian-border">
                <tr>
                  <th className="text-left p-4 uppercase tracking-widest text-xs text-muted-foreground font-bold">
                    {t("nav.tournaments")}
                  </th>
                  <th className="text-left p-4 uppercase tracking-widest text-xs text-muted-foreground font-bold">
                    {t("admin.team")}
                  </th>
                  <th className="text-left p-4 uppercase tracking-widest text-xs text-muted-foreground font-bold">
                    {t("common.status")}
                  </th>
                  <th className="text-left p-4 uppercase tracking-widest text-xs text-muted-foreground font-bold">
                    {t("common.date")}
                  </th>
                  <th className="text-right p-4 uppercase tracking-widest text-xs text-muted-foreground font-bold">
                    {t("common.actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtradas.map((i) => (
                  <InscricaoRow
                    key={i.id}
                    inscricao={i}
                    disabled={anyPending}
                    onAprovar={() =>
                      handle(aprovar, i.id, t("admin.registrationApproved"))
                    }
                    onReprovar={() =>
                      handle(reprovar, i.id, t("admin.registrationRejected"))
                    }
                    onEliminar={() =>
                      handle(eliminar, i.id, t("admin.teamEliminated"))
                    }
                    onCampeao={() =>
                      handle(campeao, i.id, t("admin.championSet"))
                    }
                    onRemover={() => handleRemover(i)}
                    loadingAprovar={aprovar.isPending}
                    loadingReprovar={reprovar.isPending}
                    loadingEliminar={eliminar.isPending}
                    loadingCampeao={campeao.isPending}
                    loadingRemover={remover.isPending}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

function InscricaoRow({
  inscricao: i,
  disabled,
  onAprovar,
  onReprovar,
  onEliminar,
  onCampeao,
  onRemover,
  loadingAprovar,
  loadingReprovar,
  loadingEliminar,
  loadingCampeao,
  loadingRemover,
}: {
  inscricao: Inscricao;
  disabled: boolean;
  onAprovar: () => void;
  onReprovar: () => void;
  onEliminar: () => void;
  onCampeao: () => void;
  onRemover: () => void;
  loadingAprovar: boolean;
  loadingReprovar: boolean;
  loadingEliminar: boolean;
  loadingCampeao: boolean;
  loadingRemover: boolean;
}) {
  const { t, i18n } = useTranslation();
  const kind = statusInscricaoKind(i.status);

  return (
    <tr className="border-b border-obsidian-border hover:bg-obsidian/50 align-middle">
      <td className="p-4">
        <p className="font-bold">{i.campeonatoNome}</p>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
          ID #{i.campeonatoId}
        </p>
      </td>
      <td className="p-4">
        <p className="font-bold">{i.timeNome}</p>
        {i.timeTag && (
          <p className="text-xs text-muted-foreground">[{i.timeTag}]</p>
        )}
        <p className="text-[10px] text-muted-foreground tabular-nums">
          {t("admin.playersCount", { count: i.totalJogadores })}
        </p>
      </td>
      <td className="p-4">
        <InscricaoStatusBadge status={i.status} />
      </td>
      <td className="p-4 text-muted-foreground text-xs tabular-nums whitespace-nowrap">
        {safeFormat(i.dataInscricao, getDateLocale(i18n.language))}
      </td>
      <td className="p-4">
        <div className="flex flex-wrap justify-end gap-1.5">
          {kind === "pending" && (
            <>
              <CyberButton
                variant="success"
                size="sm"
                disabled={disabled}
                loading={loadingAprovar}
                onClick={onAprovar}
                title={t("admin.approveRegistration")}
              >
                <Check className="size-3.5" />
              </CyberButton>
              <CyberButton
                variant="danger"
                size="sm"
                disabled={disabled}
                loading={loadingReprovar}
                onClick={onReprovar}
                title={t("admin.rejectRegistration")}
              >
                <X className="size-3.5" />
              </CyberButton>
            </>
          )}
          {kind === "confirmed" && (
            <>
              <CyberButton
                variant="ghost"
                size="sm"
                disabled={disabled}
                loading={loadingEliminar}
                onClick={onEliminar}
                title={t("admin.eliminateTeam")}
              >
                <Skull className="size-3.5" />
              </CyberButton>
              <CyberButton
                variant="primary"
                size="sm"
                disabled={disabled}
                loading={loadingCampeao}
                onClick={onCampeao}
                title={t("admin.setChampion")}
              >
                <Award className="size-3.5" />
              </CyberButton>
            </>
          )}
          <CyberButton
            variant="danger"
            size="sm"
            disabled={disabled}
            loading={loadingRemover}
            onClick={onRemover}
            title={t("admin.removeRegistration")}
          >
            <Trash2 className="size-3.5" />
          </CyberButton>
        </div>
      </td>
    </tr>
  );
}
