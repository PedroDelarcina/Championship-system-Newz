import { ptBR, enUS, es } from "date-fns/locale";
import type { Locale } from "date-fns";
import type { SupportedLanguage } from "@/i18n";

const DATE_LOCALES: Record<SupportedLanguage, Locale> = {
  pt: ptBR,
  en: enUS,
  es: es,
};

export function getDateLocale(language?: string): Locale {
  const lng = (language?.split("-")[0] ?? "pt") as SupportedLanguage;
  return DATE_LOCALES[lng] ?? ptBR;
}
