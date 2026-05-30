import type { DescriptionBlock } from '@/features/properties/property-description-content';

interface Props {
  blocks: DescriptionBlock[];
  limit?: number;
}

export default function PropertyDescriptionBlocks({ blocks, limit }: Props) {
  const visible = limit != null ? blocks.slice(0, limit) : blocks;

  if (visible.length === 0) {
    return null;
  }

  return (
    <div className="property-description-blocks">
      {visible.map((block, index) => {
        if (block.type === 'list') {
          return (
            <ul key={`list-${index}`} className="property-description-list">
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }

        return (
          <p key={`p-${index}-${block.text.slice(0, 24)}`} className="property-description-paragraph">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
