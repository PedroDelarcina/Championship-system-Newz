import type { StatusCampeonato, StatusInscricao } from "@/types/api";

export function statusCampeonatoLabel(s: StatusCampeonato | undefined): string {
  const map: Record<string, string> = {
    NaoIniciado: "Inscrições Abertas",
    EmAndamento: "Em Andamento",
    Finalizado: "Finalizado",
    Desativado: "Desativado",
  };
  const key = s == null ? "" : String(s);
  return map[key] ?? (s == null ? "—" : String(s));
}

export type StatusKind = "open" | "running" | "finished" | "disabled" | "other";

export function statusCampeonatoKind(s: StatusCampeonato | undefined): StatusKind {
  const v = String(s ?? "").toLowerCase();
  if (v.includes("desativ")) return "disabled";
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
  return map[String(s)] ?? String(s);
}

export type InscricaoStatusKind =
  | "pending"
  | "confirmed"
  | "canceled"
  | "eliminated"
  | "champion"
  | "other";

export function statusInscricaoKind(s: StatusInscricao): InscricaoStatusKind {
  const v = String(s).toLowerCase();
  if (v.includes("pendent")) return "pending";
  if (v.includes("confirm")) return "confirmed";
  if (v.includes("cancel")) return "canceled";
  if (v.includes("elimin")) return "eliminated";
  if (v.includes("campe")) return "champion";
  return "other";
}

export function inscricaoStatusAtiva(s: StatusInscricao): boolean {
  const k = statusInscricaoKind(s);
  return k === "pending" || k === "confirmed" || k === "champion";
}
