import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLogin } from "@/hooks/api";
import { CyberInput } from "@/components/cyber-input";
import { CyberButton } from "@/components/cyber-button";
import { getApiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — Infestation Tournament" },
      { name: "description", content: "Entre na sua conta de operativo." },
    ],
  }),
  component: LoginPage,
});

type FormData = {
  email: string;
  password: string;
};

function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const { mutateAsync, isPending } = useLogin();

  const schema = useMemo(
    () =>
      z.object({
        email: z.string().trim().email(t("validation.emailInvalid")).max(255),
        password: z
          .string()
          .min(1, t("validation.passwordRequired"))
          .max(100),
      }),
    [t],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (token) navigate({ to: "/" });
  }, [token, navigate]);

  const onSubmit = async (data: FormData) => {
    try {
      await mutateAsync(data);
      toast.success(t("auth.accessGranted"));
      navigate({ to: "/" });
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  return (
    <section className="min-h-dvh flex items-center justify-center px-4 pt-24 pb-16 bg-grid">
      <div className="w-full max-w-md">
        <div className="cyber-cut-br bg-obsidian-light border border-obsidian-border border-l-4 border-l-blood-bright p-8 md:p-10">
          <p className="text-blood-bright font-bold tracking-[0.25em] uppercase text-xs mb-2">
            {t("auth.authProtocol")}
          </p>
          <h1 className="font-display text-4xl md:text-5xl uppercase font-bold leading-none mb-8">
            {t("auth.loginTitle")}
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <CyberInput
              label={t("common.email")}
              type="email"
              autoComplete="email"
              placeholder={t("auth.emailPlaceholder")}
              error={errors.email?.message}
              {...register("email")}
            />
            <CyberInput
              label={t("common.password")}
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register("password")}
            />
            <div className="text-right -mt-2">
              <Link
                to="/esqueci-senha"
                className="text-xs uppercase tracking-widest text-blood-bright font-bold hover:underline"
              >
                {t("auth.forgotPassword")}
              </Link>
            </div>
            <CyberButton
              type="submit"
              size="lg"
              loading={isPending}
              className="mt-2"
            >
              {t("auth.enter")}
            </CyberButton>
          </form>

          <p className="text-sm text-muted-foreground mt-6 text-center uppercase tracking-wider">
            {t("auth.noAccount")}{" "}
            <Link
              to="/register"
              className="text-blood-bright font-bold hover:underline"
            >
              {t("auth.signUp")}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
