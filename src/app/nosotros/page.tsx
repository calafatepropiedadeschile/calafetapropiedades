'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { siteConfig } from '@/config/site';

export default function NosotrosPage() {
  const { locale } = useI18n();
  const isEs = locale === 'es';
  const about = siteConfig.copy;
  const paragraphs = isEs ? about.aboutModelParagraphs.es : about.aboutModelParagraphs.en;

  return (
    <>
      <Navbar />
      <main style={{
        paddingTop: 'calc(var(--nav-height) + var(--secondary-header-height))',
        backgroundColor: '#FFFFFF',
        minHeight: '100vh',
        color: 'var(--color-text)'
      }}>
        <section style={{
          borderBottom: '1px solid var(--color-border-light)',
          padding: 'var(--space-4xl) 0 var(--space-3xl)',
          backgroundColor: '#FCFCFC'
        }}>
          <div className="container">
            <span style={{
              color: 'var(--color-primary)',
              fontFamily: 'var(--font-admin)',
              fontWeight: 700,
              fontSize: '0.85rem',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: 'var(--space-md)'
            }}>
              {isEs ? about.aboutEyebrow.es : about.aboutEyebrow.en}
            </span>
            <h1 className="heading-1" style={{
              fontFamily: 'var(--font-admin)',
              fontWeight: 800,
              fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
              lineHeight: 1.1,
              letterSpacing: '-1.5px',
              color: 'var(--color-dark)',
              maxWidth: '900px',
              marginBottom: 'var(--space-lg)'
            }}>
              {siteConfig.name}
            </h1>
            <p style={{
              color: 'var(--color-text-muted)',
              maxWidth: '750px',
              fontSize: '1.25rem',
              lineHeight: 1.6,
              margin: 0
            }}>
              {isEs ? about.aboutIntro.es : about.aboutIntro.en}
            </p>
          </div>
        </section>

        <section style={{ padding: 'var(--space-4xl) 0', borderBottom: '1px solid var(--color-border-light)' }}>
          <div className="container">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 'var(--space-3xl)'
            }}>
              <div>
                <h2 style={{
                  fontFamily: 'var(--font-admin)',
                  fontWeight: 800,
                  fontSize: '1.75rem',
                  letterSpacing: '-0.5px',
                  color: 'var(--color-dark)',
                  marginBottom: 'var(--space-md)'
                }}>
                  {isEs ? about.aboutModelTitle.es : about.aboutModelTitle.en}
                </h2>
                {paragraphs.map((paragraph) => (
                  <p key={paragraph} style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', lineHeight: '1.75', marginBottom: 'var(--space-md)' }}>
                    {paragraph}
                  </p>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2xl)' }}>
                {[
                  {
                    index: '01',
                    title: isEs ? 'Cartera seleccionada' : 'Curated portfolio',
                    text: isEs
                      ? 'Presentamos propiedades con informacion clara, fotos cuidadas y datos utiles para decidir.'
                      : 'We present properties with clear information, careful photos, and useful decision-making data.',
                  },
                  {
                    index: '02',
                    title: isEs ? 'Gestion transparente' : 'Transparent management',
                    text: isEs
                      ? 'Ordenamos consultas, visitas y seguimiento comercial desde el panel de administracion.'
                      : 'We organize inquiries, visits, and commercial follow-up from the admin panel.',
                  },
                  {
                    index: '03',
                    title: isEs ? 'Atencion directa' : 'Direct attention',
                    text: isEs
                      ? 'Centralizamos la comunicacion para que cada interesado tenga una respuesta rapida y consistente.'
                      : 'We centralize communication so every lead receives a fast and consistent response.',
                  },
                ].map((pillar) => (
                  <div key={pillar.index} style={{ borderLeft: '3px solid var(--color-primary)', paddingLeft: 'var(--space-md)' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>{pillar.index}</span>
                    <h3 style={{ fontFamily: 'var(--font-admin)', fontWeight: 700, fontSize: '1.15rem', color: 'var(--color-dark)', margin: '0 0 var(--space-xs)' }}>
                      {pillar.title}
                    </h3>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                      {pillar.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section style={{ padding: 'var(--space-4xl) 0 var(--space-5xl)', backgroundColor: '#FAFAFA' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-3xl)' }}>
              <span style={{
                color: 'var(--color-primary)',
                fontFamily: 'var(--font-admin)',
                fontWeight: 700,
                fontSize: '0.8rem',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: 'var(--space-xs)'
              }}>
                {isEs ? 'CONTACTO Y GESTION' : 'CONTACT AND MANAGEMENT'}
              </span>
              <h2 style={{
                fontFamily: 'var(--font-admin)',
                fontWeight: 800,
                fontSize: '2rem',
                letterSpacing: '-0.5px',
                color: 'var(--color-dark)',
                margin: 0
              }}>
                {isEs ? 'Equipo de atencion' : 'Advisory team'}
              </h2>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'var(--space-2xl)'
            }}>
              {siteConfig.offices.map((office) => (
                <div key={office.id} style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--color-border-light)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-xl)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.015)'
                }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--color-primary)',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: 'var(--space-sm)'
                  }}>
                    {isEs ? office.country.es : office.country.en}
                  </span>
                  <h3 style={{ fontFamily: 'var(--font-admin)', fontWeight: 800, fontSize: '1.3rem', color: 'var(--color-dark)', margin: '0 0 var(--space-xs)' }}>
                    {office.contactName}
                  </h3>
                  <p style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', margin: '0 0 var(--space-md)' }}>
                    {isEs ? office.role.es : office.role.en}
                  </p>
                  <div style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: 'var(--space-sm)', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    <p style={{ margin: '0 0 4px' }}><strong>Email:</strong> {office.email}</p>
                    <p style={{ margin: '0 0 4px' }}><strong>Tel:</strong> {office.phoneLabel}</p>
                    {office.scope && <p style={{ margin: '0 0 4px' }}><strong>Scope:</strong> {isEs ? office.scope.es : office.scope.en}</p>}
                    <p style={{ margin: 0 }}><strong>Addr:</strong> {office.addressLines.join(', ')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
