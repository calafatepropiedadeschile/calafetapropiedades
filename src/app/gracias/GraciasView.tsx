'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/marketing/WhatsAppButton';
import { trackConversionThankYou } from '@/lib/marketing/analytics';

export default function GraciasView() {
  const searchParams = useSearchParams();

  const tipo = searchParams.get('tipo') === 'contacto' ? 'contacto' : 'lead';
  const proyecto = searchParams.get('proyecto')?.trim() ?? '';
  const slug = searchParams.get('slug')?.trim() ?? '';
  const eventId = searchParams.get('eid')?.trim() ?? undefined;

  const title = useMemo(() => (
    tipo === 'contacto'
      ? '¡Mensaje enviado!'
      : '¡Consulta recibida!'
  ), [tipo]);

  useEffect(() => {
    trackConversionThankYou(
      {
        conversion_type: tipo,
        property_slug: slug || undefined,
        property_title: proyecto || undefined,
      },
      { eventID: eventId, conversionType: tipo },
    );
  }, [tipo, slug, proyecto, eventId]);

  return (
    <>
      <Navbar />
      <main style={{
        paddingTop: 'calc(var(--nav-height) + var(--secondary-header-height))',
        minHeight: '70vh',
        background: 'var(--color-surface-2)',
        paddingBottom: 'var(--space-4xl)',
      }}
      >
        <div className="container" style={{ maxWidth: '640px', paddingTop: 'var(--space-4xl)', textAlign: 'center' }}>
          <div style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-3xl)',
            boxShadow: 'var(--shadow-card)',
          }}
          >
            <p style={{ color: 'var(--color-success)', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Calafate Propiedades
            </p>
            <h1 className="heading-2" style={{ margin: 'var(--space-md) 0' }}>{title}</h1>
            <p className="text-muted" style={{ lineHeight: 1.7, marginBottom: 'var(--space-xl)' }}>
              {proyecto
                ? `Recibimos tu interés en ${proyecto}. Gracias por ponerse en contacto con nosotros. En breve recibirá un correo electrónico nuestro.`
                : 'Gracias por ponerse en contacto con nosotros. En breve recibirá un correo electrónico nuestro.'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              <WhatsAppButton
                propertyTitle={proyecto || undefined}
                pageLabel={slug ? `/proyectos/${slug}` : '/gracias'}
                variant="primary"
              />
              {slug && (
                <Link href={`/proyectos/${slug}`} className="btn btn-outline">
                  Volver al proyecto
                </Link>
              )}
              <Link href="/propiedades" className="btn btn-outline">
                Ver más propiedades
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
