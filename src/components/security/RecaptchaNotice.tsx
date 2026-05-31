'use client';

import { isRecaptchaConfiguredOnClient } from '@/lib/security/recaptcha-config';

interface Props {
  locale?: string;
}

export default function RecaptchaNotice({ locale = 'es' }: Props) {
  if (!isRecaptchaConfiguredOnClient()) return null;

  const isEs = locale === 'es';

  return (
    <p className="text-muted recaptcha-notice" style={{ fontSize: '0.68rem', lineHeight: 1.45, margin: 0 }}>
      {isEs ? (
        <>
          Este sitio está protegido por reCAPTCHA y aplican la{' '}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
            Política de privacidad
          </a>{' '}
          y los{' '}
          <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">
            Términos de servicio
          </a>{' '}
          de Google.
        </>
      ) : (
        <>
          This site is protected by reCAPTCHA and the Google{' '}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
            Privacy Policy
          </a>{' '}
          and{' '}
          <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">
            Terms of Service
          </a>{' '}
          apply.
        </>
      )}
    </p>
  );
}
