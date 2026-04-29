import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect } from "react";
import { ShieldCheck } from "lucide-react";
import { usePerfil } from "@/hooks/api";
import { ErrorBox, PageHeader, PageLoader } from "@/components/ui-blocks";
import { getApiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export const Route = createFileRoute("/perfil")({
  head: () => ({ meta: [{ title: "Perfil — Infestation Tournament" }] }),
  component: PerfilPage,
});

function PerfilPage() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const { user } = useAuthStore();
  const { data, isLoading, error } = usePerfil();

  useEffect(() => {
    if (!token) navigate({ to: "/login" });
  }, [token, navigate]);

  if (!token) return null;
  if (isLoading) return <div className="pt-24"><PageLoader /></div>;
  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-6 pt-32">
        <ErrorBox message={getApiErrorMessage(error)} />
      </div>
    );
  }

  return (
    <section className="max-w-2xl mx-auto px-6 pb-20">
      <PageHeader
        eyebrow="Operative"
        title="Meu Perfil"
        description="Atualize suas informações de operativo."
      />
      {user?.isAdmin && (
        <div className="cyber-cut bg-blood/10 border border-blood-bright p-3 mb-6 flex items-center gap-2 text-xs uppercase tracking-wider text-blood-bright font-bold">
          <ShieldCheck className="size-4" /> Conta Administradora
        </div>
      )}
      <div className="cyber-cut-br bg-obsidian-light border border-obsidian-border p-8 grid gap-5">
        <Info label="Nickname" value={data?.nickName} />
        <Info label="E-mail" value={data?.email} />
        <Info label="ID" value={data?.id} />
        <Info
          label="Data de registro"
          value={
            data?.dataRegistro
              ? format(parseISO(data.dataRegistro), "dd/MM/yyyy HH:mm", {
                  locale: ptBR,
                })
              : "—"
          }
        />
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-2">
        {label}
      </p>
      <p className="bg-obsidian border border-obsidian-border px-4 py-3 text-white font-tech">
        {value || "—"}
      </p>
    </div>
  );
}
