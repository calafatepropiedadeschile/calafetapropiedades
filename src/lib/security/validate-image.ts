export type AllowedImageFormat = {
  mime: string;
  extension: string;
  matches: (bytes: Uint8Array) => boolean;
};

const ALLOWED_IMAGE_FORMATS: AllowedImageFormat[] = [
  {
    mime: 'image/jpeg',
    extension: '.jpg',
    matches: (bytes) => bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
  },
  {
    mime: 'image/png',
    extension: '.png',
    matches: (bytes) =>
      bytes.length >= 8
      && bytes[0] === 0x89
      && bytes[1] === 0x50
      && bytes[2] === 0x4e
      && bytes[3] === 0x47
      && bytes[4] === 0x0d
      && bytes[5] === 0x0a
      && bytes[6] === 0x1a
      && bytes[7] === 0x0a,
  },
  {
    mime: 'image/webp',
    extension: '.webp',
    matches: (bytes) =>
      bytes.length >= 12
      && bytes[0] === 0x52
      && bytes[1] === 0x49
      && bytes[2] === 0x46
      && bytes[3] === 0x46
      && bytes[8] === 0x57
      && bytes[9] === 0x45
      && bytes[10] === 0x42
      && bytes[11] === 0x50,
  },
  {
    mime: 'image/avif',
    extension: '.avif',
    matches: (bytes) => {
      if (bytes.length < 12) return false;
      const boxType = String.fromCharCode(bytes[4], bytes[5], bytes[6], bytes[7]);
      if (boxType !== 'ftyp') return false;
      const brand = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
      return brand === 'avif' || brand === 'avis' || brand === 'mif1' || brand === 'miaf';
    },
  },
];

export const ALLOWED_IMAGE_MIME_TYPES = ALLOWED_IMAGE_FORMATS.map((format) => format.mime);

export function detectAllowedImageFormat(bytes: Uint8Array): AllowedImageFormat | null {
  return ALLOWED_IMAGE_FORMATS.find((format) => format.matches(bytes)) ?? null;
}

export function validateImageUpload(bytes: Uint8Array, declaredMime: string | null | undefined) {
  const format = detectAllowedImageFormat(bytes);

  if (!format) {
    return {
      ok: false as const,
      error: 'Solo se permiten imagenes JPG, PNG, WebP o AVIF.',
    };
  }

  if (declaredMime && declaredMime !== format.mime && declaredMime !== 'application/octet-stream') {
    return {
      ok: false as const,
      error: 'El tipo declarado del archivo no coincide con su contenido.',
    };
  }

  return {
    ok: true as const,
    mime: format.mime,
    extension: format.extension,
  };
}
