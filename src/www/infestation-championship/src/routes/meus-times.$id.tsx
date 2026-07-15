import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Crown, Plus, Trash2, UserPlus } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  useAddJogador,
  useDeleteTime,
  useRemoveJogador,
  useTime,
} from "@/hooks/api";
import { CyberButton } from "@/components/cyber-button";
import { CyberInput } from "@/components/cyber-input";
import { TeamLogo } from "@/components/team-logo";
import { ErrorBox, PageHeader, PageLoader } from "@/components/ui-blocks";
import { getApiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export const Route = createFileRoute("/meus-times/$id")({
  head: ({ params }) => ({
    meta: [{ title: `Time #${params.id} — Infestation Tournament` }],
  }),
  component: TimeDetalhePage,
});

type JogadorForm = {
  usuarioId: string;
};

function TimeDetalhePage() {
  const { t } = useTranslation();
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: time, isLoading, error } = useTime(id);
  const addJogador = useAddJogador();
  const removeJogador = useRemoveJogador();
  const deleteTime = useDeleteTime();

  const jogadorSchema = useMemo(
    () =>
      z.object({
        usuarioId: z.string().trim().min(1, t("validation.playerIdRequired")),
      }),
    [t],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JogadorForm>({ resolver: zodResolver(jogadorSchema) });

  if (isLoading) return <div className="pt-24"><PageLoader /></div>;
  if (error || !time) {
    return (
      <div className="max-w-3xl mx-auto px-6 pt-32">
        <ErrorBox
          message={error ? getApiErrorMessage(error) : t("teams.teamNotFound")}
        />
      </div>
    );
  }

  const souLider = String(time.liderId) === String(user?.id);
  const podeAdmin = souLider || user?.isAdmin;

  const onAdd = async (data: JogadorForm) => {
    try {
      await addJogador.mutateAsync({
        timeId: time.id,
        usuarioId: data.usuarioId,
      });
      toast.success(t("teams.playerAdded"));
      reset();
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  const onRemove = async (jogadorId: string | number) => {
    if (!confirm(t("teams.confirmRemovePlayer"))) return;
    try {
      await removeJogador.mutateAsync({ timeId: time.id, jogadorId });
      toast.success(t("teams.playerRemoved"));
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  const onDelete = async () => {
    if (!confirm(t("teams.confirmDeleteTeam", { name: time.nome }))) return;
    try {
      await deleteTime.mutateAsync(time.id);
      toast.success(t("teams.teamDeleted"));
      navigate({ to: "/meus-times" });
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  return (
    <section className="max-w-[1440px] mx-auto px-6 pb-20">
      <div className="flex items-start gap-6 mb-8">
        <TeamLogo url={time.logoUrl} name={time.nome} size={80} className="rounded-md" />
        <PageHeader
          eyebrow={time.clanTag ? `[${time.clanTag}]` : t("teams.squad")}
          title={time.nome}
          description={souLider ? t("teams.youAreLeader") : undefined}
          actions={
            podeAdmin ? (
              <CyberButton
                variant="danger"
                size="sm"
                onClick={onDelete}
                loading={deleteTime.isPending}
              >
                <Trash2 className="size-4" /> {t("teams.deleteTeam")}
              </CyberButton>
            ) : undefined
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Jogadores */}
        <div className="lg:col-span-2">
          <h2 className="font-display text-2xl uppercase mb-4 text-blood-bright">
            {t("teams.playersTitle", { count: time.jogadores?.length ?? 0 })}
          </h2>
          <div className="space-y-3">
            {(!time.jogadores || time.jogadores.length === 0) && (
              <p className="text-muted-foreground text-sm uppercase tracking-wider">
                {t("teams.noPlayersYet")}
              </p>
            )}
            {time.jogadores?.map((j) => {
              const eLider = String(j.id) === String(time.liderId);
              return (
                <div
                  key={j.id}
                  className="cyber-cut bg-obsidian-light border border-obsidian-border p-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {eLider && (
                      <Crown className="size-5 text-blood-bright shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="font-bold truncate">{j.nickName}</p>
                      {j.email && (
                        <p className="text-xs text-muted-foreground truncate">
                          {j.email}
                        </p>
                      )}
                    </div>
                  </div>
                  {souLider && !eLider && (
                    <button
                      onClick={() => onRemove(j.id)}
                      className="text-destructive hover:text-white transition-colors p-2"
                      aria-label={t("teams.removePlayer")}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {souLider && (
            <form
              onSubmit={handleSubmit(onAdd)}
              className="cyber-cut-br bg-obsidian-light border border-obsidian-border p-6 mt-8 flex flex-col gap-4"
            >
              <h3 className="font-display text-xl uppercase flex items-center gap-2">
                <UserPlus className="size-5 text-blood-bright" />
                {t("teams.addPlayer")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CyberInput
                  label={t("teams.playerId")}
                  placeholder={t("teams.playerIdPlaceholder")}
                  hint={t("teams.playerIdHint")}
                  error={errors.usuarioId?.message}
                  {...register("usuarioId")}
                />
              </div>
              <CyberButton type="submit" loading={addJogador.isPending}>
                <Plus className="size-4" /> {t("teams.add")}
              </CyberButton>
            </form>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <Link
            to="/meus-times"
            className="text-xs uppercase tracking-widest text-muted-foreground hover:text-white inline-block"
          >
            {t("teams.backToTeams")}
          </Link>
        </aside>
      </div>
    </section>
  );
}
