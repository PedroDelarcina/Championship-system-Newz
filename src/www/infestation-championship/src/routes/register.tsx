import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
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
        content: "Crie sua conta de operativo e entre nos circuitos.",
      },
    ],
  }),
  component: RegisterPage,
});

const schema = z
  .object({
    userName: z.string().trim().min(3, "Mínimo 3 caracteres").max(100),
    nickname: z.string().trim().min(3, "Mínimo 3 caracteres").max(50),
    email: z.string().trim().email("E-mail inválido").max(255),
    password: z.string().min(6, "Mínimo 6 caracteres").max(100),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Senhas não conferem",
    path: ["confirmPassword"],
  });
type FormData = z.infer<typeof schema>;

function RegisterPage() {
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await mutateAsync({
        userName: data.userName,
        nickname: data.nickname,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      toast.success("Conta criada! Faça login para continuar.");
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
            New Recruit
          </p>
          <h1 className="font-display text-4xl md:text-5xl uppercase font-bold leading-none mb-8">
            Criar Conta
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <CyberInput
              label="Nome"
              placeholder="Seu nome"
              error={errors.userName?.message}
              {...register("userName")}
            />
            <CyberInput
              label="Nickname"
              placeholder="Seu nick no jogo"
              error={errors.nickname?.message}
              {...register("nickname")}
            />
            <CyberInput
              label="E-mail"
              type="email"
              autoComplete="email"
              placeholder="seu@email.com"
              error={errors.email?.message}
              {...register("email")}
            />
            <CyberInput
              label="Senha"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register("password")}
            />
            <CyberInput
              label="Confirmar Senha"
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
              Registrar
            </CyberButton>
          </form>

          <p className="text-sm text-muted-foreground mt-6 text-center uppercase tracking-wider">
            Já tem conta?{" "}
            <Link
              to="/login"
              className="text-blood-bright font-bold hover:underline"
            >
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
