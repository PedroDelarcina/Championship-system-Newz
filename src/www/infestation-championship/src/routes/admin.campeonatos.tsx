import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, X, Power } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  useCampeonatos,
  useCreateCampeonato,
  useDeleteCampeonato,
  useToggleCampeonatoStatus,
  useUpdateCampeonato,
  type CampeonatoFormData,
} from "@/hooks/api";
import { CyberInput, CyberSelect, CyberTextarea } from "@/components/cyber-input";
import { CyberButton } from "@/components/cyber-button";
import { StatusBadge } from "@/components/status-badge";
import { ErrorBox, PageHeader, PageLoader } from "@/components/ui-blocks";
import { getApiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import type { Campeonato } from "@/types/api";

export const Route = createFileRoute("/admin/campeonatos")({
  head: () => ({
    meta: [{ title: "Admin · Campeonatos — Infestation Tournament" }],
  }),
  component: AdminCampeonatosPage,
});

const TIPOS_CAMPEONATO = [
  "ClansxClans",
  "Solo",
  "Duplas",
  "Trios",
  "Times",
] as const;

const schema = z.object({
  nome: z.string().trim().min(2).max(120),
  tipoCampeonato: z.enum(TIPOS_CAMPEONATO, {
    errorMap: () => ({ message: "Selecione um tipo de campeonato" }),
  }),
  descricaoRegras: z.string().trim().min(1).max(5000),
  maxParticipantes: z.coerce.number().int().min(2).max(256),
  dataInicio: z.string().min(1),
  dataFim: z.string().min(1),
  regrasExtras: z.string().trim().max(2000).optional().or(z.literal("")),
});
type FormData = z.infer<typeof schema>;

function AdminCampeonatosPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data, isLoading, error } = useCampeonatos();
  const createMut = useCreateCampeonato();
  const updateMut = useUpdateCampeonato();
  const deleteMut = useDeleteCampeonato();
  const toggleStatusMut = useToggleCampeonatoStatus();
  const [editing, setEditing] = useState<Campeonato | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) navigate({ to: "/login" });
    else if (!user.isAdmin) navigate({ to: "/" });
  }, [user, navigate]);

  if (!user || !user.isAdmin) return null;

  const handleEdit = (c: Campeonato) => {
    setEditing(c);
    setOpen(true);
  };
  const handleNew = () => {
    setEditing(null);
    setOpen(true);
  };
  const handleDelete = async (c: Campeonato) => {
    if (!confirm(t("admin.confirmDeleteTournament", { name: c.nome }))) return;
    try {
      await deleteMut.mutateAsync(c.id);
      toast.success(t("admin.tournamentDeleted"));
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  return (
    <section className="max-w-[1440px] mx-auto px-6 pb-20">
      <PageHeader
        eyebrow={t("admin.console")}
        title={t("admin.tournamentsTitle")}
        description={t("admin.tournamentsDescription")}
        actions={
          <>
            <Link
              to="/admin/inscricoes"
              className="cyber-cut bg-obsidian-light border border-obsidian-border text-white font-bold uppercase tracking-widest text-xs px-5 py-2.5 hover:bg-obsidian-border transition-colors"
            >
              {t("nav.registrations")}
            </Link>
            <CyberButton onClick={handleNew}>
              <Plus className="size-4" /> {t("common.new")}
            </CyberButton>
          </>
        }
      />

      {isLoading && <PageLoader />}
      {error && <ErrorBox message={getApiErrorMessage(error)} />}

      {data && (
        <div className="cyber-cut-br bg-obsidian-light border border-obsidian-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-obsidian border-b border-obsidian-border">
                <tr>
                  <th className="text-left p-4 uppercase tracking-widest text-xs text-muted-foreground font-bold">
                    {t("common.name")}
                  </th>
                  <th className="text-left p-4 uppercase tracking-widest text-xs text-muted-foreground font-bold">
                    {t("common.type")}
                  </th>
                  <th className="text-left p-4 uppercase tracking-widest text-xs text-muted-foreground font-bold">
                    {t("admin.activeAdmin")}
                  </th>
                  <th className="text-left p-4 uppercase tracking-widest text-xs text-muted-foreground font-bold">
                    {t("common.status")}
                  </th>
                  <th className="text-left p-4 uppercase tracking-widest text-xs text-muted-foreground font-bold">
                    {t("admin.registrationsCount")}
                  </th>
                  <th className="text-right p-4 uppercase tracking-widest text-xs text-muted-foreground font-bold">
                    {t("common.actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-8 text-center text-muted-foreground uppercase tracking-wider text-xs"
                    >
                      {t("admin.noTournaments")}
                    </td>
                  </tr>
                )}
                {data.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-obsidian-border hover:bg-obsidian/50"
                  >
                    <td className="p-4 font-bold">{c.nome}</td>
                    <td className="p-4 text-muted-foreground">
                      {c.tipo}
                    </td>
                    <td className="p-4 text-muted-foreground tabular-nums">
                      {c.isAtivo ? t("common.yes") : t("common.no")}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="p-4 tabular-nums">
                      {c.totalInscricoes}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={async () => {
                            try {
                              await toggleStatusMut.mutateAsync(c.id);
                              toast.success(t("admin.statusToggled"));
                            } catch (e) {
                              toast.error(getApiErrorMessage(e));
                            }
                          }}
                          className="p-2 hover:bg-obsidian-border transition-colors"
                          aria-label={t("admin.toggleStatus")}
                          title={t("admin.toggleStatus")}
                        >
                          <Power className="size-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(c)}
                          className="p-2 hover:bg-obsidian-border transition-colors"
                          aria-label={t("common.edit")}
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c)}
                          className="p-2 hover:bg-destructive transition-colors text-destructive hover:text-white"
                          aria-label={t("admin.delete")}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {open && (
        <CampeonatoFormModal
          campeonato={editing}
          onClose={() => setOpen(false)}
          createMut={createMut}
          updateMut={updateMut}
        />
      )}
    </section>
  );
}

function CampeonatoFormModal({
  campeonato,
  onClose,
  createMut,
  updateMut,
}: {
  campeonato: Campeonato | null;
  onClose: () => void;
  createMut: ReturnType<typeof useCreateCampeonato>;
  updateMut: ReturnType<typeof useUpdateCampeonato>;
}) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: campeonato
      ? {
          nome: campeonato.nome,
          tipoCampeonato: campeonato.tipo as FormData["tipoCampeonato"],
          descricaoRegras: campeonato.descricaoRegras ?? "",
          maxParticipantes: Math.max(campeonato.totalInscricoes, 2),
          dataInicio: campeonato.dataInicio?.slice(0, 10) ?? "",
          dataFim: campeonato.dataFim?.slice(0, 10) ?? "",
          regrasExtras: campeonato.regrasExtras ?? "",
        }
      : { maxParticipantes: 16, tipoCampeonato: "ClansxClans", descricaoRegras: "" },
  });

  const onSubmit = async (data: FormData) => {
    const payload: CampeonatoFormData = {
      nome: data.nome,
      tipoCampeonato: data.tipoCampeonato,
      descricaoRegras: data.descricaoRegras,
      maxParticipantes: data.maxParticipantes,
      dataInicio: data.dataInicio,
      dataFim: data.dataFim,
      regrasExtras: data.regrasExtras || undefined,
    };
    try {
      if (campeonato) {
        await updateMut.mutateAsync({ id: campeonato.id, data: payload });
        toast.success(t("admin.tournamentUpdated"));
      } else {
        await createMut.mutateAsync(payload);
        toast.success(t("admin.tournamentCreated"));
      }
      onClose();
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  const isPending = createMut.isPending || updateMut.isPending;

  return (
    <div className="fixed inset-0 z-[60] bg-obsidian/80 backdrop-blur-sm flex items-start md:items-center justify-center p-4 overflow-y-auto">
      <div className="cyber-cut-br bg-obsidian-light border border-obsidian-border w-full max-w-2xl my-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-obsidian-border transition-colors z-10"
          aria-label={t("common.close")}
        >
          <X className="size-5" />
        </button>
        <form onSubmit={handleSubmit(onSubmit)} className="p-8 flex flex-col gap-4">
          <h2 className="font-display text-3xl uppercase mb-2">
            {campeonato ? t("admin.editTournament") : t("admin.newTournament")}
          </h2>

          <CyberInput
            label={t("common.name")}
            error={errors.nome?.message}
            {...register("nome")}
          />
          <div className="grid grid-cols-2 gap-4">
            <CyberSelect
              label={t("common.type")}
              error={errors.tipoCampeonato?.message}
              {...register("tipoCampeonato")}
            >
              <option value="" disabled>
                {t("admin.selectType")}
              </option>
              {TIPOS_CAMPEONATO.map((tipo) => (
                <option key={tipo} value={tipo} className="bg-obsidian">
                  {tipo}
                </option>
              ))}
            </CyberSelect>
            <CyberInput
              label={t("admin.maxParticipants")}
              type="number"
              min={2}
              error={errors.maxParticipantes?.message}
              {...register("maxParticipantes")}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <CyberInput
              label={t("admin.startDate")}
              type="date"
              error={errors.dataInicio?.message}
              {...register("dataInicio")}
            />
            <CyberInput
              label={t("admin.endDate")}
              type="date"
              error={errors.dataFim?.message}
              {...register("dataFim")}
            />
          </div>
          <CyberTextarea
            label={t("admin.rulesDescription")}
            error={errors.descricaoRegras?.message}
            {...register("descricaoRegras")}
          />
          <CyberTextarea
            label={t("admin.extraRules")}
            error={errors.regrasExtras?.message}
            {...register("regrasExtras")}
          />

          <div className="flex gap-3 pt-2">
            <CyberButton type="submit" loading={isPending}>
              {campeonato ? t("common.save") : t("common.create")}
            </CyberButton>
            <button
              type="button"
              onClick={onClose}
              className="cyber-cut bg-obsidian-light border border-obsidian-border text-white font-bold uppercase tracking-widest text-sm px-6 py-2.5 hover:bg-obsidian-border transition-colors"
            >
              {t("common.cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
