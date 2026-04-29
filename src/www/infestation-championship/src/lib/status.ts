import type { StatusCampeonato, StatusInscricao } from "@/types/api";

export function statusCampeonatoLabel(s: StatusCampeonato): string {
  const map: Record<string, string> = {
    NaoIniciado: "Inscrições Abertas",
    EmAndamento: "Em Andamento",
    Finalizado: "Finalizado",
  };
  return map[s] ?? String(s);
}

export type StatusKind = "open" | "running" | "finished" | "other";

export function statusCampeonatoKind(s: StatusCampeonato): StatusKind {
  const v = String(s).toLowerCase();
  if (v.includes("naoiniciado") || v.includes("abert")) return "open";
  if (v.includes("andament")) return "running";
  if (v.includes("final")) return "finished";
  return "other";
}

export function statusInscricaoLabel(s: StatusInscricao): string {
  const map: Record<string, string> = {
    Pendente: "Pendente",
    Confirmado: "Confirmada",
    Cancelado: "Cancelada",
    Eliminado: "Eliminado",
    Campeao: "Campeão",
  };
  return map[s] ?? String(s);
}
