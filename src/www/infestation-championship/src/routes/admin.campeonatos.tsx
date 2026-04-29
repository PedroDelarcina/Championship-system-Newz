import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import {
  useCampeonatos,
  useCreateCampeonato,
  useDeleteCampeonato,
  useToggleCampeonatoStatus,
  useUpdateCampeonato,
  type CampeonatoFormData,
} from "@/hooks/api";
import { CyberInput, CyberTextarea } from "@/components/cyber-input";
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

const schema = z.object({
  nome: z.string().trim().min(2).max(120),
  tipoCampeonato: z.string().trim().min(2).max(50),
  descricaoRegras: z.string().trim().min(1).max(5000),
  maxParticipantes: z.coerce.number().int().min(2).max(256),
  dataInicio: z.string().min(1),
  dataFim: z.string().min(1),
  regrasExtras: z.string().trim().max(2000).optional().or(z.literal("")),
});
type FormData = z.infer<typeof schema>;

function AdminCampeonatosPage() {
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
    if (!confirm(`Deletar campeonato "${c.nome}"?`)) return;
    try {
      await deleteMut.mutateAsync(c.id);
      toast.success("Campeonato deletado");
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  return (
    <section className="max-w-[1440px] mx-auto px-6 pb-20">
      <PageHeader
        eyebrow="Admin Console"
        title="Campeonatos"
        description="CRUD completo de campeonatos."
        actions={
          <>
            <Link
              to="/admin/inscricoes"
              className="cyber-cut bg-obsidian-light border border-obsidian-border text-white font-bold uppercase tracking-widest text-xs px-5 py-2.5 hover:bg-obsidian-border transition-colors"
            >
              Inscrições
            </Link>
            <CyberButton onClick={handleNew}>
              <Plus className="size-4" /> Novo
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
                    Nome
                  </th>
                  <th className="text-left p-4 uppercase tracking-widest text-xs text-muted-foreground font-bold">
                    Tipo
                  </th>
                  <th className="text-left p-4 uppercase tracking-widest text-xs text-muted-foreground font-bold">
                    Status
                  </th>
                  <th className="text-left p-4 uppercase tracking-widest text-xs text-muted-foreground font-bold">
                    Inscrições
                  </th>
                  <th className="text-right p-4 uppercase tracking-widest text-xs text-muted-foreground font-bold">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-8 text-center text-muted-foreground uppercase tracking-wider text-xs"
                    >
                      Nenhum campeonato cadastrado.
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
                              toast.success("Status alternado");
                            } catch (e) {
                              toast.error(getApiErrorMessage(e));
                            }
                          }}
                          className="p-2 hover:bg-obsidian-border transition-colors"
                          aria-label="Alternar status"
                          title="Alternar status"
                        >
                          <Plus className="size-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(c)}
                          className="p-2 hover:bg-obsidian-border transition-colors"
                          aria-label="Editar"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c)}
                          className="p-2 hover:bg-destructive transition-colors text-destructive hover:text-white"
                          aria-label="Deletar"
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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: campeonato
      ? {
          nome: campeonato.nome,
          tipoCampeonato: campeonato.tipo,
          descricaoRegras: campeonato.descricaoRegras ?? "",
          maxParticipantes: Math.max(campeonato.totalInscricoes, 2),
          dataInicio: campeonato.dataInicio?.slice(0, 10) ?? "",
          dataFim: campeonato.dataFim?.slice(0, 10) ?? "",
          regrasExtras: campeonato.regrasExtras ?? "",
        }
      : { maxParticipantes: 16, tipoCampeonato: "ClanxClan", descricaoRegras: "" },
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
        toast.success("Campeonato atualizado");
      } else {
        await createMut.mutateAsync(payload);
        toast.success("Campeonato criado");
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
          aria-label="Fechar"
        >
          <X className="size-5" />
        </button>
        <form onSubmit={handleSubmit(onSubmit)} className="p-8 flex flex-col gap-4">
          <h2 className="font-display text-3xl uppercase mb-2">
            {campeonato ? "Editar" : "Novo"} Campeonato
          </h2>

          <CyberInput
            label="Nome"
            error={errors.nome?.message}
            {...register("nome")}
          />
          <div className="grid grid-cols-2 gap-4">
            <CyberInput
              label="Tipo"
              placeholder="Ex: ClanxClan"
              error={errors.tipoCampeonato?.message}
              {...register("tipoCampeonato")}
            />
            <CyberInput
              label="Máximo de participantes"
              type="number"
              min={2}
              error={errors.maxParticipantes?.message}
              {...register("maxParticipantes")}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <CyberInput
              label="Data Início"
              type="date"
              error={errors.dataInicio?.message}
              {...register("dataInicio")}
            />
            <CyberInput
              label="Data Fim"
              type="date"
              error={errors.dataFim?.message}
              {...register("dataFim")}
            />
          </div>
          <CyberTextarea
            label="Descrição das regras"
            error={errors.descricaoRegras?.message}
            {...register("descricaoRegras")}
          />
          <CyberTextarea
            label="Regras extras"
            error={errors.regrasExtras?.message}
            {...register("regrasExtras")}
          />

          <div className="flex gap-3 pt-2">
            <CyberButton type="submit" loading={isPending}>
              {campeonato ? "Salvar" : "Criar"}
            </CyberButton>
            <button
              type="button"
              onClick={onClose}
              className="cyber-cut bg-obsidian-light border border-obsidian-border text-white font-bold uppercase tracking-widest text-sm px-6 py-2.5 hover:bg-obsidian-border transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
