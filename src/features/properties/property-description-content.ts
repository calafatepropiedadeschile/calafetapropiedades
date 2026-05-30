export type DescriptionBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] };

export type ParsedPropertyDescription = {
  lead: string | null;
  blocks: DescriptionBlock[];
  isCollapsible: boolean;
  previewBlockCount: number;
};

const COLLAPSE_CHAR_THRESHOLD = 480;
const COLLAPSE_BLOCK_THRESHOLD = 3;
const LEAD_MAX_CHARS = 280;
const PREVIEW_BLOCKS_COLLAPSED = 1;

const BULLET_PATTERN = /^(\s*[-–—•*]\s+|\s*\d+[.)]\s+)/;

function isBulletLine(line: string) {
  return BULLET_PATTERN.test(line.trim());
}

function stripBullet(line: string) {
  return line.trim().replace(BULLET_PATTERN, '').trim();
}

function extractFirstSentence(text: string) {
  const normalized = text.replace(/\s+/g, ' ').trim();
  const match = normalized.match(/^(.{40,280}?[.!?])(\s|$)/);
  if (match?.[1]) return match[1].trim();
  if (normalized.length <= LEAD_MAX_CHARS) return normalized;
  return `${normalized.slice(0, LEAD_MAX_CHARS).trim()}…`;
}

function parseBlock(block: string): DescriptionBlock {
  const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);

  if (lines.length === 0) {
    return { type: 'paragraph', text: '' };
  }

  const bulletLines = lines.filter(isBulletLine);
  if (bulletLines.length >= 2 && bulletLines.length === lines.length) {
    return { type: 'list', items: lines.map(stripBullet).filter(Boolean) };
  }

  if (lines.length === 1 && isBulletLine(lines[0])) {
    return { type: 'list', items: [stripBullet(lines[0])] };
  }

  return { type: 'paragraph', text: lines.join(' ') };
}

export function parsePropertyDescription(raw: string): ParsedPropertyDescription {
  const trimmed = raw.trim();

  if (!trimmed) {
    return {
      lead: null,
      blocks: [],
      isCollapsible: false,
      previewBlockCount: 0,
    };
  }

  const blocks = trimmed
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map(parseBlock)
    .filter((block) => block.type !== 'paragraph' || block.text.length > 0);

  const firstParagraph = blocks.find((block) => block.type === 'paragraph');
  const lead = firstParagraph && firstParagraph.type === 'paragraph' && firstParagraph.text.length <= LEAD_MAX_CHARS
    ? firstParagraph.text
    : extractFirstSentence(trimmed);

  const isCollapsible = trimmed.length > COLLAPSE_CHAR_THRESHOLD
    || blocks.length > COLLAPSE_BLOCK_THRESHOLD
    || blocks.some((block) => block.type === 'list' && block.items.length > 4);

  return {
    lead,
    blocks,
    isCollapsible,
    previewBlockCount: isCollapsible ? PREVIEW_BLOCKS_COLLAPSED : blocks.length,
  };
}
