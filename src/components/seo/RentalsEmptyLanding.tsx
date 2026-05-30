import Link from 'next/link';
import { Home, MessageCircle, Search } from 'lucide-react';
import { primaryContact } from '@/config/contact';
import { buildWhatsAppUrl } from '@/lib/marketing/whatsapp';

interface Props {
  contactHref?: string;
  salesHref?: string;
}

export default function RentalsEmptyLanding({
  contactHref = '/contacto',
  salesHref = '/propiedades',
}: Props) {
  const whatsappHref = buildWhatsAppUrl({
    message: 'Hola, me interesa conocer opciones de arriendo cuando tengan disponibilidad.',
  });

  return (
    <section
      className="rentals-empty-landing"
      aria-labelledby="rentals-empty-title"
      style={{
        marginTop: 'var(--space-2xl)',
        marginBottom: 'var(--space-3xl)',
      }}
    >
      <div
        style={{
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border-light)',
          background: 'linear-gradient(145deg, var(--color-surface-2) 0%, #fff 55%)',
          padding: 'clamp(var(--space-xl), 4vw, var(--space-3xl))',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            fontSize: '0.75rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--color-primary)',
            marginBottom: 'var(--space-md)',
          }}
        >
          Cartera en actualizacion
        </span>

        <h2
          id="rentals-empty-title"
          className="heading-3"
          style={{ marginBottom: 'var(--space-md)', maxWidth: '640px' }}
        >
          Por ahora no hay propiedades en arriendo publicadas
        </h2>

        <p
          className="text-muted"
          style={{ fontSize: '1.05rem', lineHeight: 1.75, maxWidth: '680px', marginBottom: 'var(--space-xl)' }}
        >
          Calafate Propiedades gestiona arriendos en el sur de Chile. En este momento no hay fichas
          activas en el sitio, pero puedes dejarnos tu consulta y te contactamos cuando haya una
          opcion acorde a lo que buscas.
        </p>

        <div
          style={{
            display: 'grid',
            gap: 'var(--space-md)',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            marginBottom: 'var(--space-2xl)',
          }}
        >
          {[
            {
              icon: MessageCircle,
              title: 'Cuéntanos qué necesitas',
              text: 'Zona, tipo de propiedad, plazo y presupuesto aproximado.',
            },
            {
              icon: Search,
              title: 'Revisamos disponibilidad',
              text: 'El equipo comercial confirma opciones vigentes fuera del catálogo web si aplica.',
            },
            {
              icon: Home,
              title: 'Publicamos en el sitio',
              text: 'Cuando una propiedad en arriendo se publique, aparecerá aquí con precio y detalles.',
            },
          ].map(({ icon: Icon, title, text }) => (
            <article
              key={title}
              style={{
                padding: 'var(--space-lg)',
                borderRadius: 'var(--radius-md)',
                background: '#fff',
                border: '1px solid var(--color-border-light)',
              }}
            >
              <Icon size={22} style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-sm)' }} />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: 'var(--space-xs)' }}>{title}</h3>
              <p className="text-sm text-muted" style={{ margin: 0, lineHeight: 1.6 }}>{text}</p>
            </article>
          ))}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
          <Link href={contactHref} className="btn btn-primary">
            Consultar disponibilidad
          </Link>
          <a href={whatsappHref} className="btn btn-outline" target="_blank" rel="noopener noreferrer">
            WhatsApp {primaryContact.displayPhone}
          </a>
          <Link href={salesHref} className="btn btn-ghost">
            Ver propiedades en venta
          </Link>
        </div>
      </div>
    </section>
  );
}
