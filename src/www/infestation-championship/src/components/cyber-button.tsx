import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "success";
type Size = "sm" | "md" | "lg";

interface CyberButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: ReactNode;
}

export function CyberButton({
  variant = "primary",
  size = "md",
  loading,
  children,
  className,
  disabled,
  ...props
}: CyberButtonProps) {
  const variants: Record<Variant, string> = {
    primary:
      "bg-blood text-white hover:bg-blood-bright glow-blood",
    secondary:
      "bg-obsidian-light border border-obsidian-border text-white hover:bg-obsidian-border",
    ghost:
      "bg-transparent border border-obsidian-border text-white hover:bg-obsidian-light",
    danger:
      "bg-destructive text-destructive-foreground hover:opacity-90",
    success:
      "bg-status-open text-obsidian hover:opacity-90",
  };
  const sizes: Record<Size, string> = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-2.5 text-sm",
    lg: "px-10 py-3.5 text-base",
  };
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        "cyber-cut font-bold uppercase tracking-widest transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
}
