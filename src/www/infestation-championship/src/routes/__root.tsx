import {
  Outlet,
  Link,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { queryClient } from "@/lib/query-client";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-obsidian px-4 pt-24">
      <div className="max-w-md text-center">
        <h1 className="font-display text-9xl font-bold text-blood-bright leading-none">
          404
        </h1>
        <h2 className="mt-4 font-display text-3xl uppercase tracking-wide">
          Página não encontrada
        </h2>
        <p className="mt-2 text-sm text-muted-foreground uppercase tracking-wider">
          O recurso solicitado não existe ou foi movido.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="cyber-cut inline-flex items-center justify-center bg-blood text-white font-bold uppercase tracking-widest text-sm px-8 py-3 hover:bg-blood-bright transition-colors glow-blood"
          >
            Voltar para Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Infestation Tournament — Gestão de Campeonatos" },
      {
        name: "description",
        content:
          "Plataforma de gestão de campeonatos da comunidade Infestation: The New Z. Crie times, inscreva-se em torneios e dispute o topo.",
      },
      { name: "author", content: "Infestation Tournament" },
      {
        property: "og:title",
        content: "Infestation Tournament — Gestão de Campeonatos",
      },
      {
        property: "og:description",
        content: "Crie seu time, inscreva-se em torneios e domine a arena.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="bg-obsidian text-foreground antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-dvh flex flex-col bg-obsidian">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: "oklch(0.14 0.008 20)",
            border: "1px solid oklch(0.22 0.015 20)",
            color: "white",
            fontFamily: "Rajdhani, sans-serif",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            fontSize: "13px",
          },
        }}
      />
    </QueryClientProvider>
  );
}
