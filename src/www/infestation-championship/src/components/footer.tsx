import { Trophy } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-obsidian-border bg-obsidian mt-24">
      <div className="max-w-[1440px] mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Trophy className="size-5 text-blood-bright" />
          <span className="font-display text-xl uppercase tracking-wide">
            Infestation <span className="text-blood-bright">Tournament</span>
          </span>
        </div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          © {new Date().getFullYear()} Community Tournaments • All Rights Reserved
        </p>
      </div>
    </footer>
  );
}
