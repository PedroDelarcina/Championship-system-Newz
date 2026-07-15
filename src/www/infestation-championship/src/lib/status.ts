import type { TFunction } from "i18next";
import type { StatusCampeonato, StatusInscricao } from "@/types/api";

const STATUS_CAMPEONATO_KEYS: Record<string, string> = {
  NaoIniciado: "status.tournament.open",
  EmAndamento: "status.tournament.running",
  Finalizado: "status.tournament.finished",
  Desativado: "status.tournament.disabled",
};

const STATUS_INSCRICAO_KEYS: Record<string, string> = {
  Pendente: "status.registration.pending",
  Confirmado: "status.registration.confirmed",
  Cancelado: "status.registration.canceled",
  Eliminado: "status.registration.eliminated",
  Campeao: "status.registration.champion",
};

export function statusCampeonatoLabel(
  s: StatusCampeonato | undefined,
  t: TFunction,
): string {
  const key = s == null ? "" : String(s);
  const i18nKey = STATUS_CAMPEONATO_KEYS[key];
  return i18nKey ? t(i18nKey) : s == null ? "—" : String(s);
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

export function statusInscricaoLabel(s: StatusInscricao, t: TFunction): string {
  const i18nKey = STATUS_INSCRICAO_KEYS[String(s)];
  return i18nKey ? t(i18nKey) : String(s);
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
