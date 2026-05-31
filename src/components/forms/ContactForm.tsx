'use client';

import { useState } from 'react';
import { primaryContact } from '@/config/contact';
import { submitLeadForm } from '@/features/leads/submit-lead.client';
import RecaptchaNotice from '@/components/security/RecaptchaNotice';
import { useRecaptcha } from '@/hooks/useRecaptcha';

type FormState = 'idle' | 'loading' | 'error';

interface Props {
  locale: string;
  title?: string;
  description?: string;
  defaultMessage?: string;
  leadSource?: string;
}

export default function ContactForm({
  locale,
  title,
  description,
  defaultMessage,
  leadSource,
}: Props) {
  const [state, setState] = useState<FormState>('idle');
  const [error, setError] = useState('');
  const { execute: executeRecaptcha, isEnabled: recaptchaEnabled } = useRecaptcha();

  const isEs = locale === 'es';

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState('loading');
    setError('');

    const form = e.currentTarget;

    try {
      const recaptchaToken = recaptchaEnabled
        ? await executeRecaptcha('contact_submit')
        : null;

      await submitLeadForm(
        {
          name: (form.elements.namedItem('name') as HTMLInputElement).value,
          email: (form.elements.namedItem('email') as HTMLInputElement).value,
          phone: (form.elements.namedItem('phone') as HTMLInputElement).value,
          message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
          propertyId: null,
        },
        { formType: 'contacto', recaptchaToken, leadSource },
      );
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : (isEs ? 'Ocurrió un error inesperado' : 'An unexpected error occurred'));
    }
  }

  return (
    <div>
      <h3 style={{
        fontFamily: 'var(--font-admin)',
        fontSize: '1.5rem',
        fontWeight: 700,
        marginBottom: 'var(--space-xs)',
      }}
      >
        {title ?? (isEs ? 'Envíanos un mensaje' : 'Send us a message')}
      </h3>
      <p className="text-muted text-sm" style={{ marginBottom: 'var(--space-xl)' }}>
        {description ?? (isEs
          ? 'Completa el formulario y un asesor te responderá por email o WhatsApp en menos de 24 horas.'
          : 'Complete the form and an advisor will reply by email or WhatsApp within 24 hours.')}
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <div className="input-group">
          <label htmlFor="contact-name" className="input-label">
            {isEs ? 'Nombre Completo' : 'Full Name'} *
          </label>
          <input
            id="contact-name"
            name="name"
            className="input"
            required
            minLength={2}
            placeholder={isEs ? 'Ingresa tu nombre' : 'Enter your name'}
          />
        </div>

        <div className="input-group">
          <label htmlFor="contact-email" className="input-label">
            {isEs ? 'Correo Electrónico' : 'Email Address'} *
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            className="input"
            required
            placeholder={isEs ? 'ejemplo@correo.com' : 'example@email.com'}
          />
        </div>

        <div className="input-group">
          <label htmlFor="contact-phone" className="input-label">
            {isEs ? 'Teléfono de Contacto' : 'Phone Number'}
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            className="input"
            placeholder={primaryContact.displayPhone}
          />
        </div>

        <div className="input-group">
          <label htmlFor="contact-message" className="input-label">
            {isEs ? 'Mensaje o Consulta' : 'Message or Inquiry'} *
          </label>
          <textarea
            id="contact-message"
            name="message"
            className="textarea"
            required
            defaultValue={defaultMessage}
            placeholder={isEs ? '¿En qué podemos ayudarte?' : 'How can we help you?'}
            rows={defaultMessage ? 6 : 4}
          />
        </div>

        {state === 'error' && (
          <p style={{ color: 'var(--color-error)', fontSize: '0.85rem', fontWeight: 600 }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={state === 'loading'}
          style={{ width: '100%', justifyContent: 'center', minHeight: '44px', fontWeight: 800, fontSize: '0.95rem' }}
        >
          {state === 'loading'
            ? (isEs ? 'Enviando mensaje...' : 'Sending message...')
            : (isEs ? 'Enviar por email' : 'Send by email')}
        </button>

        <p className="text-muted" style={{ fontSize: '0.72rem', textAlign: 'center', lineHeight: 1.4 }}>
          {isEs
            ? 'Tu información es confidencial. También puedes escribirnos por WhatsApp desde el botón flotante.'
            : 'Your information is confidential. You can also reach us on WhatsApp using the floating button.'}
        </p>
        <RecaptchaNotice locale={locale} />
      </form>
    </div>
  );
}
