import React from 'react';
import Image from 'next/image';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Star, Trash2, GripVertical } from 'lucide-react';

interface Props {
  url: string;
  index: number;
  coverImage: string | null;
  totalImages: number;
  onSelectPrimary: (url: string) => void;
  onMoveToPosition: (url: string, index: 1 | 2) => void;
  onRemove: (url: string) => void;
}

export function SortableImageCard({
  url,
  index,
  coverImage,
  totalImages,
  onSelectPrimary,
  onMoveToPosition,
  onRemove,
}: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: url });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`image-preview-card ${coverImage === url ? 'is-primary' : ''}`}
    >
      <Image src={url} alt="Imagen de propiedad" fill sizes="160px" style={{ objectFit: 'cover' }} />
      
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        style={{
          position: 'absolute',
          top: 'var(--space-sm)',
          left: 'var(--space-sm)',
          background: 'rgba(0,0,0,0.5)',
          color: 'white',
          padding: '4px',
          borderRadius: '4px',
          cursor: 'grab',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <GripVertical size={16} />
      </div>

      <div className="image-position-badges">
        {coverImage === url && (
          <span className="image-position-badge is-primary">
            <Star size={13} fill="currentColor" />
            Principal
          </span>
        )}
        {coverImage !== url && index === 1 && (
          <span className="image-position-badge">Secundaria</span>
        )}
        {coverImage !== url && index === 2 && (
          <span className="image-position-badge">Tercera</span>
        )}
      </div>
      <div className="image-position-actions">
        {coverImage !== url && (
          <button
            type="button"
            className="image-position-btn"
            onClick={(e) => { e.stopPropagation(); onSelectPrimary(url); }}
            aria-label="Usar esta imagen como principal"
            title="Usar como principal"
          >
            <Star size={13} />
            Principal
          </button>
        )}
        {coverImage !== url && index !== 1 && totalImages > 1 && (
          <button
            type="button"
            className="image-position-btn"
            onClick={(e) => { e.stopPropagation(); onMoveToPosition(url, 1); }}
            aria-label="Usar esta imagen como secundaria"
            title="Usar como secundaria"
          >
            2da
          </button>
        )}
        {coverImage !== url && index !== 2 && totalImages > 2 && (
          <button
            type="button"
            className="image-position-btn"
            onClick={(e) => { e.stopPropagation(); onMoveToPosition(url, 2); }}
            aria-label="Usar esta imagen como tercera"
            title="Usar como tercera"
          >
            3ra
          </button>
        )}
      </div>
      <button 
        type="button" 
        className="image-remove-btn" 
        onClick={(e) => { e.stopPropagation(); onRemove(url); }} 
        aria-label="Eliminar imagen"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
