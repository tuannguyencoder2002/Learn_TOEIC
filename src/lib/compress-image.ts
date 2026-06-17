/** Nén/resize ảnh trước khi gửi AI — giảm thời gian upload + OCR. */

const IMAGE_EXT = /\.(png|jpe?g|webp|gif|heic|heif)$/i;

const MAX_WIDTH = 1200;
const JPEG_QUALITY = 0.78;
const SKIP_BELOW_BYTES = 280_000;

export async function compressImageForImport(file: File): Promise<File> {
  const isImage =
    file.type.startsWith("image/") || IMAGE_EXT.test(file.name);
  if (!isImage) return file;
  if (file.size <= SKIP_BELOW_BYTES && file.type === "image/jpeg") return file;

  if (typeof createImageBitmap !== "function") return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_WIDTH / bitmap.width);
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }

    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY);
    });

    if (!blob) return file;

    const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
    return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
  } catch {
    return file;
  }
}

export async function compressImagesForImport(files: File[]): Promise<File[]> {
  return Promise.all(files.map((f) => compressImageForImport(f)));
}
