import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useLogin } from "@/hooks/api";
import { CyberInput } from "@/components/cyber-input";
import { CyberButton } from "@/components/cyber-button";
import { getApiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { useEffect } from "react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — Infestation Tournament" },
      { name: "description", content: "Entre na sua conta de operativo." },
    ],
  }),
  component: LoginPage,
});

const schema = z.object({
  email: z.string().trim().email("E-mail inválido").max(255),
  password: z.string().min(1, "Informe a senha").max(100),
});
type FormData = z.infer<typeof schema>;

function LoginPage() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const { mutateAsync, isPending } = useLogin();
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
      toast.success("Acesso concedido");
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
            Auth Protocol
          </p>
          <h1 className="font-display text-4xl md:text-5xl uppercase font-bold leading-none mb-8">
            Acessar Sistema
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
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
              autoComplete="current-password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register("password")}
            />
            <CyberButton
              type="submit"
              size="lg"
              loading={isPending}
              className="mt-2"
            >
              Entrar
            </CyberButton>
          </form>

          <p className="text-sm text-muted-foreground mt-6 text-center uppercase tracking-wider">
            Ainda não tem conta?{" "}
            <Link
              to="/register"
              className="text-blood-bright font-bold hover:underline"
            >
              Registre-se
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
