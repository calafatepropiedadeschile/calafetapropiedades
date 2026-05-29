import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ContactForm from '@/components/forms/ContactForm';
import { DEFAULT_LOCALE } from '@/lib/i18n/config';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: `Contacto - ${siteConfig.name}`,
  description: `Ponte en contacto con ${siteConfig.name} para comprar, vender, alquilar o invertir en propiedades.`,
};

export default async function ContactPage() {
  const locale = DEFAULT_LOCALE;

  return (
    <>
      <Navbar />
      <main style={{
        paddingTop: 'calc(var(--nav-height) + var(--secondary-header-height))',
        backgroundColor: 'var(--color-surface-2)',
        minHeight: '100vh',
        paddingBottom: 'var(--space-4xl)'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #1A1A1A 0%, #2B2B2B 100%)',
          color: '#ffffff',
          padding: 'var(--space-4xl) 0',
          textAlign: 'center',
          marginBottom: 'var(--space-4xl)'
        }}>
          <div className="container">
            <h1 className="heading-1 heading-display" style={{
              color: '#ffffff',
              fontFamily: 'var(--font-admin)',
              fontWeight: 800,
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              marginBottom: 'var(--space-md)'
            }}>
              Contactanos
            </h1>
            <p className="text-muted" style={{
              color: 'rgba(255,255,255,0.7)',
              maxWidth: '680px',
              margin: '0 auto',
              fontSize: '1.15rem'
            }}>
              Estamos aqui para guiarte en cada paso. Escribenos y nuestro equipo te respondera con una propuesta concreta.
            </p>
          </div>
        </div>

        <div className="container">
          <div className="contact-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'var(--space-3xl)',
            alignItems: 'start'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
              <h2 className="heading-3" style={{
                fontFamily: 'var(--font-admin)',
                fontWeight: 700,
                color: 'var(--color-dark)',
                marginBottom: 'var(--space-xs)'
              }}>
                Contacto directo
              </h2>
              <p className="text-muted" style={{ marginBottom: 'var(--space-md)' }}>
                Recibe atencion personalizada para comprar, vender, alquilar o publicar una propiedad.
              </p>

              {siteConfig.offices.map((office) => (
                <div key={office.id} className="office-card" style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border-light)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-xl)',
                  boxShadow: 'var(--shadow-card)',
                  transition: 'transform var(--transition-base)'
                }}>
                  <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                    <div style={{
                      color: 'var(--color-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '48px',
                      height: '48px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--color-primary-light)',
                      flexShrink: 0
                    }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    </div>
                    <div>
                      <h3 style={{
                        fontFamily: 'var(--font-admin)',
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        marginBottom: 'var(--space-xs)'
                      }}>
                        {office.country.es}
                      </h3>
                      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600, marginBottom: 'var(--space-xs)' }}>
                        {office.brandName}
                      </p>
                      <p className="text-muted text-sm" style={{ marginBottom: 'var(--space-md)', lineHeight: 1.6 }}>
                        <strong>{office.role.es}:</strong> {office.contactName}
                      </p>
                      <p className="text-muted text-sm" style={{ marginBottom: 'var(--space-md)', lineHeight: 1.6 }}>
                        {office.addressLines.map((line) => (
                          <span key={line}>{line}<br /></span>
                        ))}
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                        <a href={office.phoneHref} style={{ color: 'var(--color-text)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }} className="contact-link">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                          {office.phoneLabel}
                        </a>
                        <a href={`mailto:${office.email}`} style={{ color: 'var(--color-text)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }} className="contact-link">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                          {office.email}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border-light)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-2xl)',
              boxShadow: 'var(--shadow-card)'
            }}>
              <ContactForm locale={locale} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
