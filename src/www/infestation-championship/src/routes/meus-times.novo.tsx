import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ImagePlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCreateTime, useMeusTimes, useUploadLogo } from "@/hooks/api";
import { CyberInput } from "@/components/cyber-input";
import { CyberButton } from "@/components/cyber-button";
import { TeamLogo } from "@/components/team-logo";
import { PageHeader } from "@/components/ui-blocks";
import { getApiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/meus-times/novo")({
  head: () => ({ meta: [{ title: "Criar Time — Infestation Tournament" }] }),
  component: NovoTimePage,
});

const MAX_LOGO_BYTES = 2 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

type FormData = {
  nome: string;
  clanTag?: string;
};

function NovoTimePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const { data: meusTimes } = useMeusTimes();
  const create = useCreateTime();
  const uploadLogo = useUploadLogo();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const schema = useMemo(
    () =>
      z.object({
        nome: z
          .string()
          .trim()
          .min(3, t("validation.minChars", { count: 3 }))
          .max(20),
        clanTag: z
          .string()
          .trim()
          .max(5, t("validation.maxChars", { count: 5 }))
          .optional()
          .or(z.literal("")),
      }),
    [t],
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const nome = watch("nome");

  useEffect(() => {
    if (!token) navigate({ to: "/login" });
  }, [token, navigate]);

  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  const jaTemTime = meusTimes && meusTimes.length > 0;

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error(t("teams.invalidFormat"));
      e.target.value = "";
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      toast.error(t("teams.maxFileSize"));
      e.target.value = "";
      return;
    }

    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const clearLogo = () => {
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (data: FormData) => {
    try {
      let logoUrl: string | undefined;
      if (logoFile) {
        logoUrl = await uploadLogo.mutateAsync(logoFile);
      }

      const time = await create.mutateAsync({
        nome: data.nome,
        clanTag: data.clanTag || undefined,
        logoUrl,
      });
      toast.success(t("teams.teamCreated"));
      navigate({ to: "/meus-times/$id", params: { id: String(time.id) } });
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  const isSubmitting = create.isPending || uploadLogo.isPending;

  if (!token) return null;

  return (
    <section className="max-w-2xl mx-auto px-6 pb-20">
      <PageHeader eyebrow={t("teams.newSquad")} title={t("teams.createTeam")} />

      {jaTemTime ? (
        <div className="cyber-cut-br bg-obsidian-light border border-obsidian-border border-l-4 border-l-blood p-8">
          <h2 className="font-display text-2xl uppercase mb-3">
            {t("teams.alreadyInTeam")}
          </h2>
          <p className="text-muted-foreground mb-6 text-sm">
            {t("teams.alreadyInTeamDesc")}
          </p>
          <Link
            to="/meus-times"
            className="cyber-cut inline-block bg-blood text-white font-bold uppercase tracking-widest text-sm px-6 py-3 hover:bg-blood-bright transition-colors"
          >
            {t("teams.viewMyTeams")}
          </Link>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="cyber-cut-br bg-obsidian-light border border-obsidian-border p-8 flex flex-col gap-5"
        >
          <CyberInput
            label={t("teams.teamName")}
            placeholder={t("teams.teamNamePlaceholder")}
            error={errors.nome?.message}
            {...register("nome")}
          />
          <CyberInput
            label={t("teams.tagOptional")}
            placeholder={t("teams.tagPlaceholder")}
            maxLength={5}
            error={errors.clanTag?.message}
            {...register("clanTag")}
          />

          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
              {t("teams.logoOptional")}
            </span>
            <div className="flex items-center gap-4">
              <TeamLogo
                url={logoPreview}
                name={nome || t("teams.createTeam")}
                size={72}
                className="rounded-md"
              />
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleLogoSelect}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className={cn(
                    "cyber-cut inline-flex items-center gap-2 bg-obsidian border border-obsidian-border text-white font-bold uppercase tracking-widest text-xs px-4 py-2.5 hover:border-blood-bright transition-colors cursor-pointer",
                    isSubmitting && "opacity-50 pointer-events-none",
                  )}
                >
                  <ImagePlus className="size-4" />
                  {t("teams.chooseImage")}
                </label>
                {logoFile && (
                  <button
                    type="button"
                    onClick={clearLogo}
                    disabled={isSubmitting}
                    className="text-xs text-muted-foreground hover:text-destructive uppercase tracking-wider text-left"
                  >
                    {t("teams.removeLogo")}
                  </button>
                )}
                <span className="text-xs text-muted-foreground">
                  {t("teams.logoHint")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-2">
            <CyberButton type="submit" size="lg" loading={isSubmitting}>
              {t("teams.createTeam")}
            </CyberButton>
            <Link
              to="/meus-times"
              className="cyber-cut bg-obsidian-light border border-obsidian-border text-white font-bold uppercase tracking-widest text-sm px-8 py-3.5 hover:bg-obsidian-border transition-colors"
            >
              {t("common.cancel")}
            </Link>
          </div>
        </form>
      )}
    </section>
  );
}
