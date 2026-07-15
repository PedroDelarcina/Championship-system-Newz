import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import pt from "./locales/pt.json";
import en from "./locales/en.json";
import es from "./locales/es.json";

export const SUPPORTED_LANGUAGES = ["pt", "en", "es"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_FLAGS: Record<SupportedLanguage, string> = {
  pt: "🇧🇷",
  en: "🇺🇸",
  es: "🇪🇸",
};

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  pt: "Português",
  en: "English",
  es: "Español",
};

export const HTML_LANG: Record<SupportedLanguage, string> = {
  pt: "pt-BR",
  en: "en",
  es: "es",
};

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      pt: { translation: pt },
      en: { translation: en },
      es: { translation: es },
    },
    fallbackLng: "pt",
    supportedLngs: [...SUPPORTED_LANGUAGES],
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "locale",
    },
  });

i18n.on("languageChanged", (lng) => {
  if (typeof document !== "undefined") {
    const lang = SUPPORTED_LANGUAGES.includes(lng as SupportedLanguage)
      ? HTML_LANG[lng as SupportedLanguage]
      : HTML_LANG.pt;
    document.documentElement.lang = lang;
  }
});

if (typeof document !== "undefined") {
  const current = i18n.language?.split("-")[0] as SupportedLanguage;
  document.documentElement.lang =
    HTML_LANG[SUPPORTED_LANGUAGES.includes(current) ? current : "pt"];
}

export default i18n;
