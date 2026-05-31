'use client';

import Image from 'next/image';
import { ChevronLeft, ChevronRight, Images, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n/config';
import { translate } from '@/lib/i18n/dictionaries';

interface Props {
  images: string[];
  title: string;
  locale?: Locale;
  youtubeUrl?: string | null;
}

function getYoutubeEmbedUrl(url?: string | null) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}?rel=0` : null;
}

export default function PropertyGallery({ images, title, locale = DEFAULT_LOCALE, youtubeUrl }: Props) {
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const galleryImages = useMemo(() => images.filter(Boolean), [images]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const isOpen = activeIndex !== null;
  const activeImage = activeIndex !== null ? galleryImages[activeIndex] : null;
  const displayIndex = activeIndex ?? 0;
  const canNavigate = galleryImages.length > 1;

  const showPrevious = useCallback(() => {
    setActiveIndex((current) => {
      if (current === null) return current;
      return current === 0 ? galleryImages.length - 1 : current - 1;
    });
  }, [galleryImages.length]);

  const showNext = useCallback(() => {
    setActiveIndex((current) => {
      if (current === null) return current;
      return current === galleryImages.length - 1 ? 0 : current + 1;
    });
  }, [galleryImages.length]);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setActiveIndex(null);
      }

      if (event.key === 'ArrowRight') {
        showNext();
      }

      if (event.key === 'ArrowLeft') {
        showPrevious();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, showNext, showPrevious]);

  function openImage(index: number) {
    setActiveIndex(index);
  }

  if (galleryImages.length === 0) {
    return null;
  }

  return (
    <>
      <div className="modern-floating-gallery">
        <button type="button" style={{ width: '100%', height: '100%', border: 'none', background: 'transparent', padding: 0 }} onClick={() => openImage(0)}>
          <Image
            src={galleryImages[0]}
            alt={title}
            fill
            sizes="(max-width: 1024px) 100vw, 66vw"
            className="modern-floating-gallery-img"
            priority
          />
        </button>
        <button type="button" className="modern-gallery-pill" onClick={() => openImage(0)}>
          <Images size={16} />
          {galleryImages.length > 1 ? `${galleryImages.length} Fotos` : t('gallery.viewPhoto')}
        </button>
      </div>

      {youtubeUrl && getYoutubeEmbedUrl(youtubeUrl) && (
        <div style={{ marginTop: 'var(--space-md)', position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}>
          <iframe 
            src={getYoutubeEmbedUrl(youtubeUrl) || ''} 
            title="YouTube video player" 
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }} 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          />
        </div>
      )}

      {isOpen && activeImage && (
        <div className="gallery-lightbox" role="dialog" aria-modal="true" aria-label={`${t('gallery.dialogLabel')} ${title}`}>
          <div className="gallery-lightbox-topbar">
            <p className="gallery-lightbox-counter">
              {displayIndex + 1} / {galleryImages.length}
            </p>
            <button type="button" className="gallery-lightbox-close" onClick={() => setActiveIndex(null)} aria-label={t('gallery.close')}>
              <X size={22} />
            </button>
          </div>

          {canNavigate && (
            <button type="button" className="gallery-lightbox-nav previous" onClick={showPrevious} aria-label={t('gallery.previous')}>
              <ChevronLeft size={30} />
            </button>
          )}

          <div className="gallery-lightbox-image">
            <Image
              src={activeImage}
              alt={`${title} ${t('gallery.photo')} ${displayIndex + 1}`}
              fill
              sizes="100vw"
              style={{ objectFit: 'contain' }}
              loading="eager"
            />
          </div>

          {canNavigate && (
            <button type="button" className="gallery-lightbox-nav next" onClick={showNext} aria-label={t('gallery.next')}>
              <ChevronRight size={30} />
            </button>
          )}

          {galleryImages.length > 1 && (
            <div className="gallery-lightbox-thumbs">
              {galleryImages.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  className={`gallery-lightbox-thumb ${activeIndex === index ? 'active' : ''}`}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`${t('gallery.viewPhoto')} ${index + 1}`}
                >
                  <Image
                    src={image}
                    alt={`${title} ${t('gallery.thumbnail')} ${index + 1}`}
                    fill
                    sizes="78px"
                    style={{ objectFit: 'cover' }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
