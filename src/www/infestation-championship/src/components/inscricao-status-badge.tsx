import { cn } from "@/lib/utils";
import {
  statusInscricaoKind,
  statusInscricaoLabel,
} from "@/lib/status";
import type { StatusInscricao } from "@/types/api";

export function InscricaoStatusBadge({
  status,
  className,
}: {
  status: StatusInscricao;
  className?: string;
}) {
  const kind = statusInscricaoKind(status);
  const label = statusInscricaoLabel(status);
  const styles: Record<string, string> = {
    pending:
      "bg-amber-500/15 border border-amber-500/50 text-amber-400",
    confirmed:
      "bg-status-open/15 border border-status-open/50 text-status-open",
    canceled:
      "bg-obsidian border border-obsidian-border text-muted-foreground",
    eliminated:
      "bg-destructive/10 border border-destructive/40 text-destructive",
    champion:
      "bg-blood-bright/15 border border-blood-bright/50 text-blood-bright",
    other: "bg-obsidian-border text-white",
  };

  return (
    <span
      className={cn(
        "cyber-badge px-2.5 py-1 font-bold uppercase tracking-widest text-[10px] inline-block",
        styles[kind],
        className,
      )}
    >
      {label}
    </span>
  );
}
