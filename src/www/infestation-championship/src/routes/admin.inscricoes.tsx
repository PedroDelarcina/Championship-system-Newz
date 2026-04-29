import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { Award, Check, Skull, X } from "lucide-react";
import {
  useAprovarInscricao,
  useDefinirCampeao,
  useEliminarInscricao,
  useInscricoes,
  useReprovarInscricao,
} from "@/hooks/api";
import { CyberButton } from "@/components/cyber-button";
import {
  EmptyState,
  ErrorBox,
  PageHeader,
  PageLoader,
} from "@/components/ui-blocks";
import { getApiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export const Route = createFileRoute("/admin/inscricoes")({
  head: () => ({
    meta: [{ title: "Admin · Inscrições — Infestation Tournament" }],
  }),
  component: AdminInscricoesPage,
});

function AdminInscricoesPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data, isLoading, error } = useInscricoes();
  const aprovar = useAprovarInscricao();
  const reprovar = useReprovarInscricao();
  const eliminar = useEliminarInscricao();
  const campeao = useDefinirCampeao();

  useEffect(() => {
    if (!user) navigate({ to: "/login" });
    else if (!user.isAdmin) navigate({ to: "/" });
  }, [user, navigate]);

  if (!user?.isAdmin) return null;

  const inscricoesPendentes = (data ?? []).filter((i) => i.status === "Pendente");

  const handle = async (
    fn: typeof aprovar,
    id: string | number,
    msg: string,
  ) => {
    try {
      await fn.mutateAsync(id);
      toast.success(msg);
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  return (
    <section className="max-w-[1440px] mx-auto px-6 pb-20">
      <PageHeader
        eyebrow="Admin Console"
        title="Inscrições"
        description="Aprove ou reprove inscrições. Durante torneios, elimine times ou defina o campeão."
        actions={
          <Link
            to="/admin/campeonatos"
            className="cyber-cut bg-obsidian-light border border-obsidian-border text-white font-bold uppercase tracking-widest text-xs px-5 py-2.5 hover:bg-obsidian-border transition-colors"
          >
            Campeonatos
          </Link>
        }
      />

      {isLoading && <PageLoader />}
      {error && <ErrorBox message={getApiErrorMessage(error)} />}
      {!isLoading && !error && inscricoesPendentes.length === 0 && (
        <EmptyState
          title="Nenhuma inscrição pendente"
          description="Todas as inscrições foram processadas."
        />
      )}

      {inscricoesPendentes.length > 0 && (
        <div className="space-y-3">
          {inscricoesPendentes.map((i) => (
            <div
              key={i.id}
              className="cyber-cut-br bg-obsidian-light border border-obsidian-border border-l-4 border-l-blood-bright p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">
                  {i.campeonatoNome}
                </p>
                <h3 className="font-display text-2xl uppercase">
                  {i.timeNome}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <CyberButton
                  variant="success"
                  size="sm"
                  onClick={() => handle(aprovar, i.id, "Inscrição aprovada")}
                  loading={aprovar.isPending}
                >
                  <Check className="size-4" /> Aprovar
                </CyberButton>
                <CyberButton
                  variant="danger"
                  size="sm"
                  onClick={() => handle(reprovar, i.id, "Inscrição reprovada")}
                  loading={reprovar.isPending}
                >
                  <X className="size-4" /> Reprovar
                </CyberButton>
                <CyberButton
                  variant="ghost"
                  size="sm"
                  onClick={() => handle(eliminar, i.id, "Time eliminado")}
                  loading={eliminar.isPending}
                  title="Eliminar (durante o campeonato)"
                >
                  <Skull className="size-4" /> Eliminar
                </CyberButton>
                <CyberButton
                  variant="primary"
                  size="sm"
                  onClick={() => handle(campeao, i.id, "Campeão definido!")}
                  loading={campeao.isPending}
                  title="Definir campeão (final)"
                >
                  <Award className="size-4" /> Campeão
                </CyberButton>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
