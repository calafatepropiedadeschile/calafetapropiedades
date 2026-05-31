/** Google reCAPTCHA v3 (invisible, score-based). */

export const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

/** Mínimo score aceptado (0–1). 0.5 es el valor recomendado por Google. */
export const RECAPTCHA_MIN_SCORE = 0.5;

export function getRecaptchaSiteKey() {
  return process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim() ?? '';
}

export function getRecaptchaSecretKey() {
  return process.env.RECAPTCHA_SECRET_KEY?.trim() ?? '';
}

export function isRecaptchaConfigured() {
  return Boolean(getRecaptchaSiteKey() && getRecaptchaSecretKey());
}

export function isRecaptchaConfiguredOnClient() {
  return Boolean(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim());
}
