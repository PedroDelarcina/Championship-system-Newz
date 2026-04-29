import { cn } from "@/lib/utils";
import {
  statusCampeonatoKind,
  statusCampeonatoLabel,
} from "@/lib/status";
import type { StatusCampeonato } from "@/types/api";

export function StatusBadge({
  status,
  className,
}: {
  status: StatusCampeonato;
  className?: string;
}) {
  const kind = statusCampeonatoKind(status);
  const label = statusCampeonatoLabel(status);
  const styles: Record<string, string> = {
    open: "bg-status-open text-obsidian shadow-[0_0_10px_oklch(0.78_0.22_145/0.5)]",
    running:
      "bg-blood-bright text-white shadow-[0_0_10px_oklch(0.65_0.27_27/0.6)]",
    finished:
      "bg-obsidian border border-obsidian-border text-muted-foreground",
    other: "bg-obsidian-border text-white",
  };
  return (
    <span
      className={cn(
        "cyber-badge px-3 py-1.5 font-bold uppercase tracking-widest text-[10px] inline-block",
        styles[kind],
        className,
      )}
    >
      {label}
    </span>
  );
}
