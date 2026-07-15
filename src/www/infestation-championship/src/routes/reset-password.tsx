import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useResetPassword } from "@/hooks/api";
import { CyberInput } from "@/components/cyber-input";
import { CyberButton } from "@/components/cyber-button";
import { getApiErrorMessage } from "@/lib/api";

type ResetPasswordSearch = {
  email?: string;
  token?: string;
};

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Redefinir senha — Infestation Tournament" },
      {
        name: "description",
        content: "Defina uma nova senha para sua conta.",
      },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): ResetPasswordSearch => ({
    email: typeof search.email === "string" ? search.email : undefined,
    token: typeof search.token === "string" ? search.token : undefined,
  }),
  component: ResetPasswordPage,
});

type FormData = {
  newPassword: string;
  confirmPassword: string;
};

function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { email = "", token = "" } = Route.useSearch();
  const { mutateAsync, isPending } = useResetPassword();
  const linkInvalido = !email.trim() || !token.trim();

  const schema = useMemo(
    () =>
      z
        .object({
          newPassword: z
            .string()
            .min(6, t("validation.minChars", { count: 6 }))
            .max(100)
            .regex(
              /^(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{6,}$/,
              t("validation.passwordComplexity"),
            ),
          confirmPassword: z.string(),
        })
        .refine((v) => v.newPassword === v.confirmPassword, {
          message: t("validation.passwordsMismatch"),
          path: ["confirmPassword"],
        }),
    [t],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    if (linkInvalido) {
      toast.error(t("auth.invalidRecoveryLink"));
      return;
    }

    try {
      const res = await mutateAsync({
        email: email.trim(),
        token: token.trim(),
        newPassword: data.newPassword,
      });
      toast.success(res.message || t("auth.passwordResetSuccess"));
      navigate({ to: "/login" });
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  return (
    <section className="min-h-dvh flex items-center justify-center px-4 pt-24 pb-16 bg-grid">
      <div className="w-full max-w-md">
        <div className="cyber-cut-br bg-obsidian-light border border-obsidian-border border-l-4 border-l-blood-bright p-8 md:p-10">
          <p className="text-blood-bright font-bold tracking-[0.25em] uppercase text-xs mb-2">
            {t("auth.passwordReset")}
          </p>
          <h1 className="font-display text-4xl md:text-5xl uppercase font-bold leading-none mb-3">
            {t("auth.resetTitle")}
          </h1>
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-8">
            {t("auth.resetDescription")}{" "}
            <span className="text-white font-bold normal-case">
              {email || t("auth.yourAccount")}
            </span>
          </p>

          {linkInvalido ? (
            <div className="cyber-cut bg-destructive/10 border border-destructive/40 p-6 text-center space-y-4">
              <AlertTriangle className="size-10 text-destructive mx-auto" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("auth.invalidLink")}
              </p>
              <Link
                to="/esqueci-senha"
                className="cyber-cut inline-block bg-blood text-white font-bold uppercase tracking-widest text-sm px-6 py-3 hover:bg-blood-bright transition-colors"
              >
                {t("auth.requestNewLink")}
              </Link>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-5"
            >
              <CyberInput
                label={t("auth.newPassword")}
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                error={errors.newPassword?.message}
                {...register("newPassword")}
              />
              <CyberInput
                label={t("auth.confirmNewPassword")}
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                error={errors.confirmPassword?.message}
                {...register("confirmPassword")}
              />
              <CyberButton
                type="submit"
                size="lg"
                loading={isPending}
                className="mt-2"
              >
                {t("auth.resetPassword")}
              </CyberButton>
            </form>
          )}

          <p className="text-sm text-muted-foreground mt-6 text-center uppercase tracking-wider">
            <Link
              to="/login"
              className="text-blood-bright font-bold hover:underline"
            >
              {t("auth.backToLogin")}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
