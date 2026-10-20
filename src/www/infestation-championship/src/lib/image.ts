const DEFAULT_MAX_DIMENSION = 512;
const DEFAULT_QUALITY = 0.85;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Não foi possível processar a imagem."));
    };
    img.src = url;
  });
}

function extensionFor(type: string): string {
  switch (type) {
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    default:
      return ".jpg";
  }
}

/**
 * Redimensiona e recomprime a imagem no próprio navegador antes do upload.
 *
 * Isso reduz drasticamente o tamanho do arquivo (ex.: logos de 1,8 MB passam a
 * ~100 KB) e evita que o proxy reverso de produção rejeite a requisição por
 * exceder o limite de corpo (`client_max_body_size`), o que o navegador
 * reporta como erro de CORS.
 *
 * GIFs são mantidos intactos para preservar a animação.
 */
export async function optimizeLogoImage(
  file: File,
  {
    maxDimension = DEFAULT_MAX_DIMENSION,
    quality = DEFAULT_QUALITY,
  }: { maxDimension?: number; quality?: number } = {},
): Promise<File> {
  if (file.type === "image/gif") return file;

  const img = await loadImage(file);
  const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return file;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, width, height);

  // WebP mantém transparência (importante para logos) e compacta bem melhor
  // que PNG. Se o navegador não suportar, o canvas cai para PNG.
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", quality),
  );

  // Se não foi possível recomprimir ou não houve ganho, mantém o original.
  if (!blob || blob.size >= file.size) return file;

  const baseName = file.name.replace(/\.[^.]+$/, "");
  return new File([blob], `${baseName}${extensionFor(blob.type)}`, {
    type: blob.type,
    lastModified: Date.now(),
  });
}
