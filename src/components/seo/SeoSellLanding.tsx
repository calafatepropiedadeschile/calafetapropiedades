import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import type { SeoLandingPageConfig } from '@/config/seo-pages';
import type { StaticPageView } from '@/features/site-content/static-page';
import type { Locale } from '@/lib/i18n/config';
import SeoInfoGridSection from '@/components/seo/SeoInfoGridSection';
import SellLandingHeroActions from '@/components/seo/SellLandingHeroActions';
import ContactForm from '@/components/forms/ContactForm';
import WhatsAppButton from '@/components/marketing/WhatsAppButton';
import CtaBanner from '@/components/ui/CtaBanner';
import FaqStructuredData from '@/components/seo/FaqStructuredData';
import StaticPageContent from '@/components/site/StaticPageContent';
import { buildSellWhatsAppMessage } from '@/lib/marketing/whatsapp';
import { primaryContact } from '@/config/contact';

interface Props {
  config: SeoLandingPageConfig;
  cmsPage?: StaticPageView | null;
  locale: Locale;
}

export default function SeoSellLanding({ config, cmsPage, locale }: Props) {
  const isEs = locale === 'es';
  const title = cmsPage?.title ?? config.title;
  const description = config.description;
  const contact = config.contactSection;

  return (
    <>
      <section className="section container sell-landing-hero">
        <span className="section-eyebrow">{config.eyebrow}</span>
        <div className="sell-landing-hero__grid">
          <div>
            <h1 className="heading-2 heading-display sell-landing-hero__title">{title}</h1>
            <p className="text-muted sell-landing-hero__description">{description}</p>
            <SellLandingHeroActions
              locale={locale}
              primaryLabel={config.primaryCta.label}
              secondaryLabel={config.secondaryCta.label}
            />
          </div>

          {config.highlights.length > 0 && (
            <aside className="sell-landing-hero__aside" aria-labelledby="sell-highlights-title">
              <h2 id="sell-highlights-title" className="sell-landing-hero__aside-title">
                {config.highlightsTitle ?? (isEs ? 'Qué incluye el servicio' : 'What the service includes')}
              </h2>
              <ul className="sell-landing-highlights">
                {config.highlights.map((item) => (
                  <li key={item} className="sell-landing-highlights__item">
                    <CheckCircle2 size={18} strokeWidth={2} aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </div>
      </section>

      {cmsPage?.content ? (
        <div className="container" style={{ maxWidth: '860px', margin: '0 auto var(--space-3xl)' }}>
          <StaticPageContent content={cmsPage.content} />
        </div>
      ) : null}

      {config.infoGrids?.map((grid, index) => (
        <SeoInfoGridSection
          key={grid.title}
          grid={grid}
          className={index % 2 === 1 ? 'sell-landing-section--alt' : ''}
        />
      ))}

      {config.asideNote ? (
        <section className="section sell-landing-section--alt">
          <div className="container">
            <div className="trust-stats-cta sell-landing-aside">
              <div className="trust-stats-cta-copy">
                <p className="trust-stats-cta-kicker">{config.asideNote.kicker}</p>
                <p className="trust-stats-cta-text">{config.asideNote.text}</p>
              </div>
              <div className="trust-stats-cta-buttons">
                <Link href="#vender-solicitud" className="btn btn-primary">
                  {config.primaryCta.label}
                </Link>
                <Link href={primaryContact.phoneHref} className="btn btn-outline">
                  {primaryContact.displayPhone}
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {contact ? (
        <section
          id="vender-solicitud"
          className="section sell-landing-contact"
          aria-labelledby="vender-solicitud-title"
        >
          <div className="container">
            <div className="sell-landing-contact__header">
              <h2 id="vender-solicitud-title" className="heading-2 services-title">
                {contact.title}
              </h2>
              <p className="text-muted services-subtitle">{contact.description}</p>
            </div>

            <div className="sell-landing-contact__grid">
              <div className="sell-landing-contact__info">
                <p className="text-muted" style={{ lineHeight: 1.75, margin: 0 }}>
                  {isEs
                    ? 'Preferimos que nos cuentes ubicación, tipo de propiedad y condiciones comerciales. Con eso podemos orientarte antes de una visita o publicación.'
                    : 'We prefer location, property type, and commercial terms. That lets us guide you before a visit or listing goes live.'}
                </p>
                <ul className="sell-landing-highlights" style={{ marginTop: 'var(--space-xl)' }}>
                  <li className="sell-landing-highlights__item">
                    <CheckCircle2 size={18} strokeWidth={2} aria-hidden />
                    <span>{isEs ? 'Respuesta por email o teléfono' : 'Reply by email or phone'}</span>
                  </li>
                  <li className="sell-landing-highlights__item">
                    <CheckCircle2 size={18} strokeWidth={2} aria-hidden />
                    <span>{isEs ? 'WhatsApp comercial activo' : 'Active commercial WhatsApp'}</span>
                  </li>
                </ul>
              </div>

              <div className="sell-landing-contact__form-card">
                <ContactForm
                  locale={locale}
                  title={contact.formTitle}
                  description={contact.formDescription}
                  defaultMessage={contact.defaultMessage}
                  leadSource="vender_web"
                />
                <WhatsAppButton
                  locale={locale}
                  pageLabel="/vender"
                  variant="primary"
                  message={buildSellWhatsAppMessage(locale)}
                  label={isEs ? 'Consultar por WhatsApp' : 'Ask on WhatsApp'}
                />
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {config.ctaBanner ? (
        <div className="container" style={{ marginBottom: 'var(--space-3xl)' }}>
          <CtaBanner
            variant="inline"
            eyebrow={config.ctaBanner.eyebrow}
            headline={config.ctaBanner.headline}
            sub={config.ctaBanner.sub}
            ctas={[
              { label: config.primaryCta.label, href: '#vender-solicitud', primary: true },
              { label: config.relatedCatalog?.linkLabel ?? config.secondaryCta.label, href: config.relatedCatalog?.href ?? '/comprar' },
            ]}
            id="cta-vender-inline"
          />
        </div>
      ) : null}

      {config.relatedCatalog ? (
        <section className="section container" style={{ paddingTop: 0 }}>
          <aside className="seo-service-related sell-landing-related">
            <h2 className="seo-service-landing__heading">{config.relatedCatalog.title}</h2>
            <p className="text-muted seo-service-related__description">
              {config.relatedCatalog.description}
            </p>
            <Link href={config.relatedCatalog.href} className="btn btn-outline">
              {config.relatedCatalog.linkLabel}
            </Link>
          </aside>
        </section>
      ) : null}

      <FaqStructuredData faqs={config.faqs} />

      <section className="section container sell-landing-faq">
        <h2 className="heading-3" style={{ marginBottom: 'var(--space-lg)' }}>
          {isEs ? 'Preguntas frecuentes' : 'Frequently asked questions'}
        </h2>
        <div className="sell-landing-faq__list">
          {config.faqs.map((faq) => (
            <details key={faq.question} className="sell-landing-faq__item">
              <summary>{faq.question}</summary>
              <p className="text-muted">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
