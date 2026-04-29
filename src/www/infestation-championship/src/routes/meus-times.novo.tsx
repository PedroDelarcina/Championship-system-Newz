import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useCreateTime, useMeusTimes } from "@/hooks/api";
import { CyberInput } from "@/components/cyber-input";
import { CyberButton } from "@/components/cyber-button";
import { PageHeader } from "@/components/ui-blocks";
import { getApiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export const Route = createFileRoute("/meus-times/novo")({
  head: () => ({ meta: [{ title: "Criar Time — Infestation Tournament" }] }),
  component: NovoTimePage,
});

const schema = z.object({
  nome: z.string().trim().min(3, "Mínimo 3 caracteres").max(20),
  clanTag: z
    .string()
    .trim()
    .max(5, "Máximo 5 caracteres")
    .optional()
    .or(z.literal("")),
  logoUrl: z
    .string()
    .trim()
    .url("URL inválida")
    .max(500)
    .optional()
    .or(z.literal("")),
});
type FormData = z.infer<typeof schema>;

function NovoTimePage() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const { data: meusTimes } = useMeusTimes();
  const create = useCreateTime();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!token) navigate({ to: "/login" });
  }, [token, navigate]);

  const jaTemTime = meusTimes && meusTimes.length > 0;

  const onSubmit = async (data: FormData) => {
    try {
      const time = await create.mutateAsync({
        nome: data.nome,
        clanTag: data.clanTag || undefined,
        logoUrl: data.logoUrl || undefined,
      });
      toast.success("Time criado!");
      navigate({ to: "/meus-times/$id", params: { id: String(time.id) } });
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  if (!token) return null;

  return (
    <section className="max-w-2xl mx-auto px-6 pb-20">
      <PageHeader eyebrow="New Squad" title="Criar Time" />

      {jaTemTime ? (
        <div className="cyber-cut-br bg-obsidian-light border border-obsidian-border border-l-4 border-l-blood p-8">
          <h2 className="font-display text-2xl uppercase mb-3">
            Você já pertence a um time
          </h2>
          <p className="text-muted-foreground mb-6 text-sm">
            Cada operativo só pode pertencer a um único time. Saia ou delete o
            time atual antes de criar outro.
          </p>
          <Link
            to="/meus-times"
            className="cyber-cut inline-block bg-blood text-white font-bold uppercase tracking-widest text-sm px-6 py-3 hover:bg-blood-bright transition-colors"
          >
            Ver meus times
          </Link>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="cyber-cut-br bg-obsidian-light border border-obsidian-border p-8 flex flex-col gap-5"
        >
          <CyberInput
            label="Nome do Time"
            placeholder="Ex: Reapers"
            error={errors.nome?.message}
            {...register("nome")}
          />
          <CyberInput
            label="TAG (opcional)"
            placeholder="Ex: RPR"
              maxLength={5}
              error={errors.clanTag?.message}
              {...register("clanTag")}
          />
          <CyberInput
            label="Logo URL (opcional)"
            placeholder="https://..."
            error={errors.logoUrl?.message}
            {...register("logoUrl")}
          />
          <div className="flex gap-3 mt-2">
            <CyberButton type="submit" size="lg" loading={create.isPending}>
              Criar Time
            </CyberButton>
            <Link
              to="/meus-times"
              className="cyber-cut bg-obsidian-light border border-obsidian-border text-white font-bold uppercase tracking-widest text-sm px-8 py-3.5 hover:bg-obsidian-border transition-colors"
            >
              Cancelar
            </Link>
          </div>
        </form>
      )}
    </section>
  );
}
