import sanitizeHtml from 'sanitize-html';

const CMS_HTML_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'p',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'ol',
    'li',
    'div',
    'br',
    'hr',
    'strong',
    'em',
    'b',
    'i',
    'u',
    'blockquote',
    'span',
    'a',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowProtocolRelative: false,
  disallowedTagsMode: 'discard',
  transformTags: {
    a: (_tagName, attribs) => ({
      tagName: 'a',
      attribs: {
        href: attribs.href,
        title: attribs.title,
        ...(attribs.target === '_blank' ? { target: '_blank' } : {}),
        rel: 'noopener noreferrer nofollow',
      },
    }),
  },
};

export function sanitizeCmsHtml(content: string): string {
  return sanitizeHtml(content, CMS_HTML_OPTIONS).trim();
}

export function sanitizeOptionalCmsHtml(content: string | null | undefined): string | null {
  if (content == null) return null;
  const sanitized = sanitizeCmsHtml(content);
  return sanitized.length > 0 ? sanitized : null;
}
