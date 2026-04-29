import { forwardRef } from "react";
import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
}

export const CyberInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & FieldProps
>(({ label, error, hint, className, ...props }, ref) => {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
        {label}
      </span>
      <input
        ref={ref}
        {...props}
        className={cn(
          "bg-obsidian border border-obsidian-border px-4 py-3 text-white font-tech focus:outline-none focus:border-blood-bright focus:ring-1 focus:ring-blood-bright transition-colors disabled:opacity-50",
          error && "border-destructive",
          className,
        )}
      />
      {hint && !error && (
        <span className="text-xs text-muted-foreground">{hint}</span>
      )}
      {error && (
        <span className="text-xs text-destructive font-bold uppercase tracking-wide">
          {error}
        </span>
      )}
    </label>
  );
});
CyberInput.displayName = "CyberInput";

export const CyberTextarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps
>(({ label, error, hint, className, ...props }, ref) => {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
        {label}
      </span>
      <textarea
        ref={ref}
        {...props}
        className={cn(
          "bg-obsidian border border-obsidian-border px-4 py-3 text-white font-tech focus:outline-none focus:border-blood-bright focus:ring-1 focus:ring-blood-bright transition-colors min-h-[100px] resize-y",
          error && "border-destructive",
          className,
        )}
      />
      {hint && !error && (
        <span className="text-xs text-muted-foreground">{hint}</span>
      )}
      {error && (
        <span className="text-xs text-destructive font-bold uppercase tracking-wide">
          {error}
        </span>
      )}
    </label>
  );
});
CyberTextarea.displayName = "CyberTextarea";
