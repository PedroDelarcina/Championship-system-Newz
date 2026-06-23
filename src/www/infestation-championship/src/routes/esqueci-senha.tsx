import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { MailCheck } from "lucide-react";
import { useForgotPassword } from "@/hooks/api";
import { CyberInput } from "@/components/cyber-input";
import { CyberButton } from "@/components/cyber-button";
import { getApiErrorMessage } from "@/lib/api";

export const Route = createFileRoute("/esqueci-senha")({
  head: () => ({
    meta: [
      { title: "Esqueci minha senha — Infestation Tournament" },
      {
        name: "description",
        content: "Solicite o link de recuperação de senha da sua conta.",
      },
    ],
  }),
  component: EsqueciSenhaPage,
});

const schema = z.object({
  email: z.string().trim().email("E-mail inválido").max(255),
});
type FormData = z.infer<typeof schema>;

function EsqueciSenhaPage() {
  const { mutateAsync, isPending } = useForgotPassword();
  const [enviado, setEnviado] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await mutateAsync({ email: data.email });
      setMensagemSucesso(
        res.message ||
          "Se o e-mail existir em nossa base, você receberá instruções em breve.",
      );
      setEnviado(true);
      toast.success("Solicitação enviada");
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  return (
    <section className="min-h-dvh flex items-center justify-center px-4 pt-24 pb-16 bg-grid">
      <div className="w-full max-w-md">
        <div className="cyber-cut-br bg-obsidian-light border border-obsidian-border border-l-4 border-l-blood-bright p-8 md:p-10">
          <p className="text-blood-bright font-bold tracking-[0.25em] uppercase text-xs mb-2">
            Recovery Protocol
          </p>
          <h1 className="font-display text-4xl md:text-5xl uppercase font-bold leading-none mb-3">
            Esqueci minha senha
          </h1>
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-8">
            Informe o e-mail da sua conta. Enviaremos um link para redefinir a
            senha.
          </p>

          {enviado ? (
            <div className="cyber-cut bg-status-open/10 border border-status-open/40 p-6 text-center space-y-4">
              <MailCheck className="size-12 text-status-open mx-auto" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                {mensagemSucesso}
              </p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Verifique também a pasta de spam.
              </p>
              <Link
                to="/login"
                className="cyber-cut inline-block bg-blood text-white font-bold uppercase tracking-widest text-sm px-6 py-3 hover:bg-blood-bright transition-colors"
              >
                Voltar ao login
              </Link>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-5"
            >
              <CyberInput
                label="E-mail"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                error={errors.email?.message}
                {...register("email")}
              />
              <CyberButton
                type="submit"
                size="lg"
                loading={isPending}
                className="mt-2"
              >
                Enviar link de recuperação
              </CyberButton>
            </form>
          )}

          {!enviado && (
            <p className="text-sm text-muted-foreground mt-6 text-center uppercase tracking-wider">
              Lembrou a senha?{" "}
              <Link
                to="/login"
                className="text-blood-bright font-bold hover:underline"
              >
                Entrar
              </Link>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
