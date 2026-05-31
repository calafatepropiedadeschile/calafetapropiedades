'use client';

import { useCallback, useEffect, useState } from 'react';
import { isRecaptchaConfiguredOnClient } from '@/lib/security/recaptcha-config';

const RECAPTCHA_SCRIPT_ID = 'google-recaptcha-v3';

type Grecaptcha = {
  ready: (callback: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
};

declare global {
  interface Window {
    grecaptcha?: Grecaptcha;
  }
}

function getSiteKey() {
  return process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim() ?? '';
}

function loadRecaptchaScript(siteKey: string) {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('reCAPTCHA no disponible en el servidor.'));
  }

  if (window.grecaptcha) {
    return Promise.resolve();
  }

  const existing = document.getElementById(RECAPTCHA_SCRIPT_ID) as HTMLScriptElement | null;
  if (existing) {
    return new Promise<void>((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('No se pudo cargar reCAPTCHA.')), { once: true });
    });
  }

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.id = RECAPTCHA_SCRIPT_ID;
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('No se pudo cargar reCAPTCHA.'));
    document.head.appendChild(script);
  });
}

export function useRecaptcha() {
  const siteKey = getSiteKey();
  const isEnabled = isRecaptchaConfiguredOnClient();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isEnabled) return;

    let cancelled = false;

    loadRecaptchaScript(siteKey)
      .then(() => {
        if (cancelled || !window.grecaptcha) return;
        window.grecaptcha.ready(() => {
          if (!cancelled) setReady(true);
        });
      })
      .catch((error) => {
        console.warn('[recaptcha]', error);
      });

    return () => {
      cancelled = true;
    };
  }, [isEnabled, siteKey]);

  const execute = useCallback(
    async (action: string) => {
      if (!isEnabled) return null;

      await loadRecaptchaScript(siteKey);
      if (!window.grecaptcha) {
        throw new Error('reCAPTCHA no está listo.');
      }

      return new Promise<string>((resolve, reject) => {
        window.grecaptcha!.ready(() => {
          window.grecaptcha!
            .execute(siteKey, { action })
            .then(resolve)
            .catch(reject);
        });
      });
    },
    [isEnabled, siteKey],
  );

  return { execute, isEnabled, ready };
}
