interface Props {
  content: string;
  className?: string;
}

function looksLikeHtml(content: string) {
  return /<\s*(p|h[1-6]|ul|ol|li|div|br|strong|em|a)\b/i.test(content);
}

function renderPlainContent(content: string) {
  const blocks = content.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);

  if (blocks.length === 0) {
    return <p className="static-page-prose-empty">Sin contenido.</p>;
  }

  return blocks.map((block) => (
    <p key={block.slice(0, 40)} style={{ marginBottom: 'var(--space-md)', lineHeight: 1.75 }}>
      {block.split('\n').map((line, index, lines) => (
        <span key={`${index}-${line}`}>
          {line}
          {index < lines.length - 1 ? <br /> : null}
        </span>
      ))}
    </p>
  ));
}

export default function StaticPageContent({ content, className = '' }: Props) {
  if (looksLikeHtml(content)) {
    return (
      <div
        className={`static-page-prose ${className}`.trim()}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  return (
    <div className={`static-page-prose ${className}`.trim()}>
      {renderPlainContent(content)}
    </div>
  );
}
