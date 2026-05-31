'use client';

import { useState } from 'react';
import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n/config';
import { translate } from '@/lib/i18n/dictionaries';
import { primaryContact } from '@/config/contact';
import { submitLeadForm } from '@/features/leads/submit-lead.client';
import RecaptchaNotice from '@/components/security/RecaptchaNotice';
import { useRecaptcha } from '@/hooks/useRecaptcha';

interface Props {
  propertyId: string;
  propertyTitle: string;
  propertySlug: string;
  locale?: Locale;
}

type FormState = 'idle' | 'loading' | 'error';

export default function LeadForm({
  propertyId,
  propertyTitle,
  propertySlug,
  locale = DEFAULT_LOCALE,
}: Props) {
  const [state, setState] = useState<FormState>('idle');
  const [error, setError] = useState('');
  const { execute: executeRecaptcha, isEnabled: recaptchaEnabled } = useRecaptcha();
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState('loading');
    setError('');

    const form = e.currentTarget;

    try {
      const recaptchaToken = recaptchaEnabled
        ? await executeRecaptcha('property_lead')
        : null;

      await submitLeadForm(
        {
          name: (form.elements.namedItem('name') as HTMLInputElement).value,
          email: (form.elements.namedItem('email') as HTMLInputElement).value,
          phone: (form.elements.namedItem('phone') as HTMLInputElement).value,
          message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
          propertyId,
        },
        {
          propertyTitle,
          propertySlug,
          formType: 'lead',
          recaptchaToken,
        },
      );
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : t('lead.genericError'));
    }
  }

  return (
    <div className="lead-form-card">
      <h3>{t('lead.title')}</h3>
      <p className="text-muted text-sm" style={{ marginBottom: 'var(--space-xl)' }}>
        {t('lead.subtitle')}
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <div className="input-group">
          <label htmlFor="lead-name" className="input-label">{t('lead.name')} *</label>
          <input id="lead-name" name="name" className="input" required minLength={2} placeholder={t('lead.namePlaceholder')} />
        </div>

        <div className="input-group">
          <label htmlFor="lead-email" className="input-label">{t('lead.email')} *</label>
          <input id="lead-email" name="email" type="email" className="input" required placeholder={t('lead.emailPlaceholder')} />
        </div>

        <div className="input-group">
          <label htmlFor="lead-phone" className="input-label">{t('lead.phone')}</label>
          <input
            id="lead-phone"
            name="phone"
            type="tel"
            className="input"
            placeholder={primaryContact.displayPhone}
          />
        </div>

        <div className="input-group">
          <label htmlFor="lead-message" className="input-label">{t('lead.message')}</label>
          <textarea
            id="lead-message"
            name="message"
            className="textarea"
            placeholder={t('lead.messagePlaceholder')}
            rows={3}
          />
        </div>

        {state === 'error' && (
          <p style={{ color: 'var(--color-error)', fontSize: '0.85rem' }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={state === 'loading'}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          {state === 'loading' ? t('lead.submitting') : t('lead.submit')}
        </button>

        <p className="text-muted" style={{ fontSize: '0.7rem', textAlign: 'center' }}>
          {t('lead.privacy')}
        </p>
        <RecaptchaNotice locale={locale} />
      </form>
    </div>
  );
}
