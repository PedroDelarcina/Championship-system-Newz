import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import {
  LANGUAGE_FLAGS,
  LANGUAGE_LABELS,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from "@/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  className?: string;
  compact?: boolean;
}

export function LanguageSwitcher({ className, compact }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation();
  const current = (i18n.language?.split("-")[0] ?? "pt") as SupportedLanguage;
  const activeLang = SUPPORTED_LANGUAGES.includes(current) ? current : "pt";

  const changeLanguage = (lng: SupportedLanguage) => {
    void i18n.changeLanguage(lng);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "cyber-cut bg-obsidian-light border border-obsidian-border text-white font-bold uppercase tracking-widest text-xs px-3 py-2.5 hover:bg-obsidian-border transition-colors flex items-center gap-2 cursor-pointer",
            className,
          )}
          aria-label={t("language.label")}
        >
          {compact ? (
            <span className="text-base leading-none">{LANGUAGE_FLAGS[activeLang]}</span>
          ) : (
            <>
              <span className="text-base leading-none">{LANGUAGE_FLAGS[activeLang]}</span>
              {!compact && (
                <span className="hidden sm:inline">{LANGUAGE_LABELS[activeLang]}</span>
              )}
              <Globe className="size-3.5 opacity-60" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-obsidian-light border-obsidian-border min-w-[160px]"
      >
        {SUPPORTED_LANGUAGES.map((lng) => (
          <DropdownMenuItem
            key={lng}
            onClick={() => changeLanguage(lng)}
            className={cn(
              "cursor-pointer uppercase tracking-widest text-xs font-bold gap-3",
              activeLang === lng && "text-blood-bright bg-obsidian-border/50",
            )}
          >
            <span className="text-base">{LANGUAGE_FLAGS[lng]}</span>
            {LANGUAGE_LABELS[lng]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
