import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useRegister } from "@/hooks/api";
import { CyberInput } from "@/components/cyber-input";
import { CyberButton } from "@/components/cyber-button";
import { getApiErrorMessage } from "@/lib/api";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Registrar — Infestation Tournament" },
      {
        name: "description",
        content: "Crie sua conta de operativo e entre nos desafios.",
      },
    ],
  }),
  component: RegisterPage,
});

type FormData = {
  nome: string;
  nickname: string;
  email: string;
  password: string;
  confirmPassword: string;
};

function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useRegister();

  const schema = useMemo(
    () =>
      z
        .object({
          nome: z
            .string()
            .trim()
            .min(3, t("validation.minChars", { count: 3 }))
            .max(100),
          nickname: z
            .string()
            .trim()
            .min(3, t("validation.minChars", { count: 3 }))
            .max(50),
          email: z.string().trim().email(t("validation.emailInvalid")).max(255),
          password: z
            .string()
            .min(6, t("validation.minChars", { count: 6 }))
            .max(100),
          confirmPassword: z.string(),
        })
        .refine((v) => v.password === v.confirmPassword, {
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
    try {
      await mutateAsync({
        nome: data.nome,
        nickname: data.nickname,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      toast.success(t("auth.accountCreated"));
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
            {t("auth.newRecruit")}
          </p>
          <h1 className="font-display text-4xl md:text-5xl uppercase font-bold leading-none mb-8">
            {t("auth.registerTitle")}
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <CyberInput
              label={t("common.name")}
              placeholder={t("auth.namePlaceholder")}
              error={errors.nome?.message}
              {...register("nome")}
            />
            <CyberInput
              label={t("auth.nickname")}
              placeholder={t("auth.nicknamePlaceholder")}
              error={errors.nickname?.message}
              {...register("nickname")}
            />
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
              autoComplete="new-password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register("password")}
            />
            <CyberInput
              label={t("auth.confirmPassword")}
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
              {t("nav.register")}
            </CyberButton>
          </form>

          <p className="text-sm text-muted-foreground mt-6 text-center uppercase tracking-wider">
            {t("auth.hasAccount")}{" "}
            <Link
              to="/login"
              className="text-blood-bright font-bold hover:underline"
            >
              {t("auth.enter")}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
