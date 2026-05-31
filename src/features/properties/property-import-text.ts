/**
 * Parsers for Word/DOCX property copy (migrate script + DB cleanup).
 */

const DISTANCE_HIGHLIGHT_PATTERN =
  /^\s*A\s+(?:prox\.?|aprox\.?)?\s*\d+[\d.,]*\s*(?:km|kil[oó]metros?|min(?:utos)?|mts?|metros?|m\b|hr|horas?)\b/i;

const DISTANCE_INLINE_PATTERN =
  /\bA\s+(?:prox\.?|aprox\.?)?\s*\d+[\d.,]*\s*(?:km|kil[oó]metros?|min(?:utos)?|mts?|metros?)\b[^.\n]{0,80}/gi;

function normalizeSpaces(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

/** Solo distancias reales (ej. "A 12 km de Puerto Montt"), no preposiciones "a" del texto. */
export function parseDistanceHighlightsFromText(text: string): string[] {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const fromLines = lines.filter((line) => DISTANCE_HIGHLIGHT_PATTERN.test(line));

  const fromInline = Array.from(text.matchAll(DISTANCE_INLINE_PATTERN), (match) =>
    normalizeSpaces(match[0]),
  );

  return [...new Set([...fromLines, ...fromInline])]
    .filter((item) => DISTANCE_HIGHLIGHT_PATTERN.test(item))
    .slice(0, 8);
}

/** Elimina falsos positivos ya guardados en BD (importación antigua). */
const DISTANCE_HIGHLIGHT_BLOCKLIST =
  /empalme|metros del terreno|mediante pozo|agua potable/i;

export function sanitizeDistanceHighlights(items: string[]): string[] {
  return items
    .map((item) => normalizeSpaces(item))
    .filter((item) => DISTANCE_HIGHLIGHT_PATTERN.test(item))
    .filter((item) => !DISTANCE_HIGHLIGHT_BLOCKLIST.test(item))
    .filter((item, index, arr) => arr.indexOf(item) === index)
    .slice(0, 8);
}

const DESCRIPTION_STOP_MARKERS = [
  /\bPORTALES\s+INMOBILIARIOS\b/i,
  /\bCARACTERISTICAS\b/i,
  /\bMedidas\s*:/i,
  /\bFacilidad\s+de\s+pago\b/i,
  /\bInformaci[oó]n\s+adicional\b/i,
  /\bDisponibles\s*:/i,
  /\bDisponibilidad\s*:/i,
  /\bReserva\s*:/i,
];

function formatDescriptionText(text: string) {
  return text
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Limpia descripciones importadas con bloques de portales o metadatos del DOCX. */
export function cleanImportedDescription(raw: string, title?: string): string {
  const original = raw.trim();
  if (!original) return original;

  let text = original.replace(/^PORTALES\s+INMOBILIARIOS[^\n]*\n?/i, '');

  const textoMatch = /\bTexto:\s*/i.exec(text);
  if (textoMatch && textoMatch.index < 800) {
    text = text.slice(textoMatch.index + textoMatch[0].length);
  }

  let cutAt = text.length;
  for (const marker of DESCRIPTION_STOP_MARKERS) {
    const match = marker.exec(text);
    if (match && match.index > 200 && match.index < cutAt) {
      cutAt = match.index;
    }
  }
  text = text.slice(0, cutAt);

  if (title) {
    const titleIndex = text.toLowerCase().indexOf(title.toLowerCase());
    if (titleIndex >= 0 && titleIndex < 160) {
      text = text.slice(titleIndex);
    }
  }

  text = formatDescriptionText(text);

  if (text.length < 80 && original.length >= 80) {
    const fallback = formatDescriptionText(
      original
        .replace(/^PORTALES\s+INMOBILIARIOS\s+\S+\s*/i, '')
        .replace(/^\s*Texto:\s*/i, ''),
    );
    return fallback.slice(0, 4500);
  }

  return text.slice(0, 4500);
}
