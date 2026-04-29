import { Link } from "@tanstack/react-router";
import { Calendar, Users, Trophy } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { StatusBadge } from "@/components/status-badge";
import { statusCampeonatoKind } from "@/lib/status";
import type { Campeonato } from "@/types/api";
import { cn } from "@/lib/utils";

function safeFormat(d?: string) {
  if (!d) return "—";
  try {
    return format(parseISO(d), "dd MMM", { locale: ptBR }).toUpperCase();
  } catch {
    return "—";
  }
}

export function CampeonatoCard({ c }: { c: Campeonato }) {
  const kind = statusCampeonatoKind(c.status);
  const borderColor =
    kind === "open"
      ? "border-l-status-open"
      : kind === "running"
        ? "border-l-blood-bright"
        : "border-l-obsidian-border";

  const vagasRestantes = Math.max(0, c.totalInscricoes);

  return (
    <article
      className={cn(
        "group cyber-cut-br bg-obsidian-light border-l-4 flex flex-col relative overflow-hidden transition-transform duration-300 hover:-translate-y-1",
        borderColor,
        kind === "finished" && "opacity-80 hover:opacity-100",
      )}
    >
      <div className="h-44 bg-obsidian relative">
        <div className="w-full h-full flex items-center justify-center bg-grid">
          <Trophy className="size-16 text-obsidian-border" />
        </div>
        <div className="absolute inset-0 bg-linear-to-t from-obsidian-light to-transparent" />
        <div className="absolute top-4 right-4 z-10">
          <StatusBadge status={c.status} />
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        {c.tipo && (
          <p
            className={cn(
              "font-bold tracking-widest uppercase text-xs mb-2",
              kind === "open"
                ? "text-status-open"
                : kind === "running"
                  ? "text-blood-bright"
                  : "text-muted-foreground",
            )}
          >
            {c.tipo}
          </p>
        )}
        <h3 className="font-display text-3xl font-bold uppercase leading-tight mb-6 line-clamp-2">
          {c.nome}
        </h3>

        <div className="grid grid-cols-2 gap-3 mb-6 mt-auto">
          <div className="bg-obsidian border border-obsidian-border p-3">
            <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
              <Users className="size-3" /> Vagas
            </p>
            <p className="text-xl font-bold tracking-wider">
              {vagasRestantes}
              <span className="text-muted-foreground text-sm">
                inscritos
              </span>
            </p>
          </div>
          <div className="bg-obsidian border border-obsidian-border p-3">
            <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
              <Calendar className="size-3" /> Início
            </p>
            <p className="text-xl font-bold tracking-wider">
              {safeFormat(c.dataInicio)}
            </p>
          </div>
        </div>

        <Link
          to="/campeonatos/$id"
          params={{ id: String(c.id) }}
          className={cn(
            "cyber-cut w-full bg-obsidian-border text-white font-bold uppercase tracking-widest py-3 text-sm text-center transition-colors",
            kind === "open" && "group-hover:bg-status-open group-hover:text-obsidian",
            kind === "running" &&
              "group-hover:bg-blood-bright group-hover:text-white",
            kind === "finished" && "group-hover:bg-obsidian-light",
          )}
        >
          Ver Detalhes
        </Link>
      </div>
    </article>
  );
}
