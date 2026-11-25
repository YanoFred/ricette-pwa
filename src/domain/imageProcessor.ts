export const MAX_SOURCE_IMAGE_BYTES = 15 * 1024 * 1024; // 15 MB
export const TARGET_MAX_DIMENSION = 320;
export const TARGET_IMAGE_QUALITY = 0.82;
export const MAX_STORED_DATA_URL_LENGTH = 500_000;

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'image/gif',
]);

export type ImageValidationResult =
  | { ok: true }
  | { ok: false; error: string };

export function validateImageFile(
  file: Pick<File, 'type' | 'size' | 'name'>,
): ImageValidationResult {
  if (file.size <= 0) {
    return { ok: false, error: 'Il file selezionato è vuoto.' };
  }
  if (file.size > MAX_SOURCE_IMAGE_BYTES) {
    return {
      ok: false,
      error: 'La foto supera il limite di 15 MB. Prova con un’immagine più leggera.',
    };
  }
  const normalizedType = file.type.toLowerCase();
  const hasImageExtension = /\.(jpe?g|png|webp|heic|heif|gif)$/i.test(file.name);
  if (
    normalizedType.length > 0 &&
    !ALLOWED_IMAGE_MIME_TYPES.has(normalizedType)
  ) {
    return {
      ok: false,
      error: 'Formato immagine non supportato. Usa JPG, PNG o WebP.',
    };
  }
  if (normalizedType.length === 0 && !hasImageExtension) {
    return {
      ok: false,
      error: 'Seleziona un file immagine valido (JPG, PNG o WebP).',
    };
  }
  return { ok: true };
}

export function isSafePhotoDataUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  if (value.length === 0 || value.length > MAX_STORED_DATA_URL_LENGTH) {
    return false;
  }
  return /^data:image\/(webp|jpeg|jpg|png);base64,[A-Za-z0-9+/=]+$/.test(value);
}

export function calculateResizedDimensions(
  width: number,
  height: number,
  maxDimension = TARGET_MAX_DIMENSION,
): { width: number; height: number } {
  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    !Number.isFinite(maxDimension) ||
    width <= 0 ||
    height <= 0 ||
    maxDimension <= 0
  ) {
    throw new Error('Dimensioni immagine non valide.');
  }
  const largest = Math.max(width, height);
  if (largest <= maxDimension) {
    return { width: Math.round(width), height: Math.round(height) };
  }
  const scale = maxDimension / largest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

interface DecodedImage {
  source: CanvasImageSource;
  width: number;
  height: number;
  cleanup: () => void;
}

async function decodeImageFile(file: File): Promise<DecodedImage> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file);
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        cleanup: () => bitmap.close(),
      };
    } catch {
      // Fallback al caricamento via HTMLImageElement
    }
  }

  return new Promise<DecodedImage>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({
        source: img,
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
        cleanup: () => URL.revokeObjectURL(objectUrl),
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Impossibile leggere la foto selezionata.'));
    };
    img.src = objectUrl;
  });
}

export interface CompressOptions {
  maxDimension?: number;
  quality?: number;
}

export async function compressMedicationImage(
  file: File,
  options: CompressOptions = {},
): Promise<string> {
  const validation = validateImageFile(file);
  if (!validation.ok) {
    throw new Error(validation.error);
  }

  const maxDimension = options.maxDimension ?? TARGET_MAX_DIMENSION;
  const quality = options.quality ?? TARGET_IMAGE_QUALITY;

  const decoded = await decodeImageFile(file);
  try {
    const { width, height } = calculateResizedDimensions(
      decoded.width,
      decoded.height,
      maxDimension,
    );

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Contesto grafico del browser non disponibile.');
    }

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(decoded.source, 0, 0, width, height);

    const webpDataUrl = canvas.toDataURL('image/webp', quality);
    if (
      webpDataUrl.startsWith('data:image/webp;base64,') &&
      isSafePhotoDataUrl(webpDataUrl)
    ) {
      return webpDataUrl;
    }

    const jpegDataUrl = canvas.toDataURL('image/jpeg', quality);
    if (!isSafePhotoDataUrl(jpegDataUrl)) {
      throw new Error('La miniatura generata supera la dimensione massima consentita.');
    }
    return jpegDataUrl;
  } finally {
    decoded.cleanup();
  }
}
