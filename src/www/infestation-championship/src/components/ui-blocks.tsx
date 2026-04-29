import { Loader2, AlertTriangle, Inbox } from "lucide-react";
import type { ReactNode } from "react";

export function PageLoader({ label = "Carregando…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
      <Loader2 className="size-8 animate-spin text-blood-bright" />
      <p className="text-xs uppercase tracking-widest">{label}</p>
    </div>
  );
}

export function ErrorBox({
  title = "Erro ao carregar",
  message,
  action,
}: {
  title?: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <div className="cyber-cut bg-obsidian-light border border-destructive p-6 flex flex-col items-start gap-3">
      <div className="flex items-center gap-2 text-destructive">
        <AlertTriangle className="size-5" />
        <h3 className="font-display text-2xl uppercase">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
      {action}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="cyber-cut bg-obsidian-light border border-obsidian-border p-10 flex flex-col items-center text-center gap-4">
      <Inbox className="size-12 text-obsidian-border" />
      <h3 className="font-display text-3xl uppercase tracking-wide">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-md">{description}</p>
      )}
      {action}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pt-28">
      <div>
        {eyebrow && (
          <p className="text-blood-bright font-bold tracking-[0.25em] uppercase text-xs mb-2">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-5xl md:text-6xl font-bold uppercase tracking-wide leading-none">
          {title}
        </h1>
        <div className="h-1 w-24 bg-blood-bright mt-4" />
        {description && (
          <p className="text-muted-foreground mt-4 max-w-2xl text-sm">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex gap-3">{actions}</div>}
    </div>
  );
}
