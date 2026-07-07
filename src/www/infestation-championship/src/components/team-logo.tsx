import { cn } from "@/lib/utils";
import { resolveAssetUrl } from "@/lib/api";

interface TeamLogoProps {
  url?: string | null;
  name: string;
  size?: number;
  className?: string;
}

export function TeamLogo({ url, name, size = 48, className }: TeamLogoProps) {
  const src = resolveAssetUrl(url);
  const initials = name.trim().slice(0, 2).toUpperCase() || "??";

  if (src) {
    return (
      <img
        src={src}
        alt={`Logo ${name}`}
        width={size}
        height={size}
        className={cn(
          "rounded object-cover border border-obsidian-border shrink-0 bg-obsidian",
          className,
        )}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded border border-obsidian-border bg-obsidian-light flex items-center justify-center font-display font-bold uppercase text-blood-bright shrink-0",
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.35 }}
      aria-hidden
    >
      {initials}
    </div>
  );
}
