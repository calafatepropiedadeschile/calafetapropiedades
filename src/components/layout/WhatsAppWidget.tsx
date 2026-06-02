'use client';

import { useState, useEffect, useRef } from 'react';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { X, MessageCircle } from 'lucide-react';
import { trackWhatsAppClick } from '@/lib/marketing/analytics';
import { useSiteSettings } from '@/features/site-content/SiteSettingsProvider';

export default function WhatsAppWidget() {
  const { t, locale } = useI18n();
  const { whatsappNumber, whatsappHref } = useSiteSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const showTimer = setTimeout(() => {
      if (!isOpen) {
        setShowTooltip(true);
      }
    }, 4000);

    const hideTimer = setTimeout(() => {
      setShowTooltip(false);
    }, 12000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  function openWhatsApp() {
    trackWhatsAppClick({ placement: 'floating_widget' });
    const message = encodeURIComponent(t('whatsapp.defaultMessage') ?? 'Hola, me gustaría consultar por una propiedad.');
    window.open(`https://wa.me/56935406356?text=${message}`, '_blank', 'noopener,noreferrer');
    
    setIsOpen(false);
    setShowTooltip(false);
  }

  const toggleWidget = () => {
    setIsOpen(!isOpen);
    if (showTooltip) setShowTooltip(false);
  };

  return (
    <div className="whatsapp-widget-container" ref={widgetRef} id="whatsapp-widget">


      {showTooltip && !isOpen && (
        <div className="whatsapp-tooltip desktop-only-tooltip">
          <span>{t('whatsapp.tooltip')}</span>
          <button
            className="whatsapp-tooltip-close"
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(false);
            }}
            aria-label="Cerrar sugerencia"
          >
            <X size={12} />
          </button>
        </div>
      )}
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 768px) {
          .desktop-only-tooltip {
            display: none !important;
          }
        }
      ` }} />
      <button
        onClick={toggleWidget}
        className={`whatsapp-trigger-btn ${isOpen ? 'active' : ''}`}
        aria-label="Abrir WhatsApp de Calafate Propiedades"
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X size={24} className="whatsapp-icon-spin" />
        ) : (
          <svg
            viewBox="0 0 24 24"
            width="28"
            height="28"
            fill="currentColor"
            className="whatsapp-svg"
          >
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.588 1.977 14.128.951 11.5.951c-5.438 0-9.863 4.37-9.866 9.801-.002 1.84.498 3.631 1.448 5.218L2.08 21.93l6.023-1.564zm10.745-6.721c-.266-.134-1.579-.779-1.823-.867-.245-.089-.422-.134-.599.134-.177.268-.687.867-.843 1.045-.156.177-.311.2-.577.067-.266-.134-1.122-.413-2.137-1.32-.789-.704-1.323-1.574-1.479-1.842-.156-.268-.017-.413.117-.547.12-.12.266-.312.4-.467.133-.156.177-.267.266-.445.089-.178.045-.334-.022-.467-.067-.134-.599-1.447-.822-1.98-.216-.52-.454-.45-.623-.458-.16-.008-.343-.01-.527-.01-.184 0-.485.069-.739.347-.253.278-1.037 1.012-1.037 2.47 0 1.457 1.06 2.868 1.208 3.067.148.199 2.088 3.193 5.06 4.478.707.305 1.258.487 1.688.625.711.226 1.357.194 1.868.118.57-.085 1.579-.646 1.8-.1.223.134.422.378.422.822 0 .178-.089.334-.177.467-.089.134-.266.2-.533.066z" />
          </svg>
        )}
      </button>

      <div className={`whatsapp-card ${isOpen ? 'open' : ''}`}>
        <div className="whatsapp-card-header">
          <div className="whatsapp-header-info">
            <div className="whatsapp-header-logo-container">
              <MessageCircle size={20} color="#fff" />
            </div>
            <div>
              <h4 className="whatsapp-header-title">Chatea con nosotros</h4>
              <p className="whatsapp-header-status">
                <span className="whatsapp-status-pulse" />
                +56935406356
              </p>
            </div>
          </div>
          <button onClick={toggleWidget} className="whatsapp-card-close" aria-label="Cerrar widget">
            <X size={18} />
          </button>
        </div>

        <div className="whatsapp-card-body">
          <p className="whatsapp-card-subtitle">
            {locale === 'es'
              ? 'Escríbenos por WhatsApp y te respondemos a la brevedad.'
              : 'Message us on WhatsApp and we will reply shortly.'}
          </p>
          <button type="button" className="whatsapp-agent-item" onClick={openWhatsApp} style={{ width: '100%', border: 'none', cursor: 'pointer' }}>
            <div className="whatsapp-agent-avatar" style={{ backgroundColor: '#25D366' }}>
              CP
              <span className="whatsapp-agent-online-badge" />
            </div>
            <div className="whatsapp-agent-details">
              <span className="whatsapp-agent-name">Calafate Propiedades</span>
              <span className="whatsapp-agent-region">+56935406356</span>
            </div>
            <div className="whatsapp-agent-action">
              <MessageCircle size={18} className="whatsapp-msg-icon" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
