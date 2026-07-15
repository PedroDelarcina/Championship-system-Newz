import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { MailCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
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

type FormData = {
  email: string;
};

function EsqueciSenhaPage() {
  const { t } = useTranslation();
  const { mutateAsync, isPending } = useForgotPassword();
  const [enviado, setEnviado] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState("");

  const schema = useMemo(
    () =>
      z.object({
        email: z.string().trim().email(t("validation.emailInvalid")).max(255),
      }),
    [t],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await mutateAsync({ email: data.email });
      setMensagemSucesso(
        res.message || t("auth.forgotSuccessFallback"),
      );
      setEnviado(true);
      toast.success(t("auth.requestSent"));
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  return (
    <section className="min-h-dvh flex items-center justify-center px-4 pt-24 pb-16 bg-grid">
      <div className="w-full max-w-md">
        <div className="cyber-cut-br bg-obsidian-light border border-obsidian-border border-l-4 border-l-blood-bright p-8 md:p-10">
          <p className="text-blood-bright font-bold tracking-[0.25em] uppercase text-xs mb-2">
            {t("auth.recoveryProtocol")}
          </p>
          <h1 className="font-display text-4xl md:text-5xl uppercase font-bold leading-none mb-3">
            {t("auth.forgotTitle")}
          </h1>
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-8">
            {t("auth.forgotDescription")}
          </p>

          {enviado ? (
            <div className="cyber-cut bg-status-open/10 border border-status-open/40 p-6 text-center space-y-4">
              <MailCheck className="size-12 text-status-open mx-auto" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                {mensagemSucesso}
              </p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                {t("auth.checkSpam")}
              </p>
              <Link
                to="/login"
                className="cyber-cut inline-block bg-blood text-white font-bold uppercase tracking-widest text-sm px-6 py-3 hover:bg-blood-bright transition-colors"
              >
                {t("auth.backToLogin")}
              </Link>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-5"
            >
              <CyberInput
                label={t("common.email")}
                type="email"
                autoComplete="email"
                placeholder={t("auth.emailPlaceholder")}
                error={errors.email?.message}
                {...register("email")}
              />
              <CyberButton
                type="submit"
                size="lg"
                loading={isPending}
                className="mt-2"
              >
                {t("auth.sendRecoveryLink")}
              </CyberButton>
            </form>
          )}

          {!enviado && (
            <p className="text-sm text-muted-foreground mt-6 text-center uppercase tracking-wider">
              {t("auth.rememberPassword")}{" "}
              <Link
                to="/login"
                className="text-blood-bright font-bold hover:underline"
              >
                {t("auth.enter")}
              </Link>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
