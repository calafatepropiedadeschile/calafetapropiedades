'use client';

import { useState } from 'react';
import { API_ROUTES } from '@/config/api';

type FormState = 'idle' | 'loading' | 'success' | 'error';

interface Props {
  locale: string;
}

export default function ContactForm({ locale }: Props) {
  const [state, setState] = useState<FormState>('idle');
  const [error, setError] = useState('');

  const isEs = locale === 'es';

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState('loading');
    setError('');

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      phone: (form.elements.namedItem('phone') as HTMLInputElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
      propertyId: null,
    };

    try {
      const res = await fetch(API_ROUTES.leads, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || (isEs ? 'Error al enviar la consulta' : 'Failed to send message'));
      }

      setState('success');
      form.reset();
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
        marginBottom: 'var(--space-xs)' 
      }}>
        {isEs ? 'Envíanos un mensaje' : 'Send us a message'}
      </h3>
      <p className="text-muted text-sm" style={{ marginBottom: 'var(--space-xl)' }}>
        {isEs 
          ? 'Completa el siguiente formulario y un asesor se pondrá en contacto contigo en menos de 24 horas.' 
          : 'Complete the form below and an advisor will reach out to you within 24 hours.'}
      </p>

      {state === 'success' ? (
        <div style={{
          textAlign: 'center',
          padding: 'var(--space-2xl) var(--space-md)',
          color: 'var(--color-success)',
          border: '1px dashed var(--color-success)',
          borderRadius: 'var(--radius-md)',
          background: '#F6FBF8'
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginBottom: 'var(--space-md)', color: 'var(--color-success)' }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          <p style={{ fontWeight: 700, fontSize: '1.15rem' }}>
            {isEs ? '¡Mensaje Enviado con Éxito!' : 'Message Sent Successfully!'}
          </p>
          <p className="text-muted text-sm" style={{ marginTop: 'var(--space-sm)' }}>
            {isEs 
              ? 'Muchas gracias. Hemos recibido tu consulta y te contactaremos a la brevedad.' 
              : 'Thank you. We have received your inquiry and will contact you shortly.'}
          </p>
        </div>
      ) : (
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
              placeholder={isEs ? '+34 600 000 000' : '+1 555 000 000'} 
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
              placeholder={isEs ? '¿En qué podemos ayudarte?' : 'How can we help you?'}
              rows={4}
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
              : (isEs ? 'Enviar Mensaje' : 'Send Message')}
          </button>

          <p className="text-muted" style={{ fontSize: '0.72rem', textAlign: 'center', lineHeight: 1.4 }}>
            {isEs 
              ? 'Tu información es totalmente confidencial y protegida por nuestra política de privacidad.' 
              : 'Your information is fully confidential and protected by our privacy policy.'}
          </p>
        </form>
      )}
    </div>
  );
}
