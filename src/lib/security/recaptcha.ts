import {
  getRecaptchaSecretKey,
  isRecaptchaConfigured,
  RECAPTCHA_MIN_SCORE,
  RECAPTCHA_VERIFY_URL,
} from './recaptcha-config';

export type RecaptchaVerificationResult =
  | { ok: true; skipped?: boolean; score?: number }
  | { ok: false; error: string };

type GoogleVerifyResponse = {
  success?: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
};

export async function verifyRecaptchaToken(
  token: string | null | undefined,
  options?: { expectedAction?: string; remoteIp?: string | null },
): Promise<RecaptchaVerificationResult> {
  if (!isRecaptchaConfigured()) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('[recaptcha] Keys no configuradas en producción; verificación omitida.');
    }
    return { ok: true, skipped: true };
  }

  const trimmed = token?.trim();
  if (!trimmed) {
    return { ok: false, error: 'Verificación anti-spam requerida. Recarga la página e intenta de nuevo.' };
  }

  const body = new URLSearchParams({
    secret: getRecaptchaSecretKey(),
    response: trimmed,
  });

  if (options?.remoteIp) {
    body.set('remoteip', options.remoteIp);
  }

  let payload: GoogleVerifyResponse;

  try {
    const response = await fetch(RECAPTCHA_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
      cache: 'no-store',
    });

    payload = await response.json() as GoogleVerifyResponse;
  } catch (error) {
    console.error('[recaptcha] Error al verificar token.', error);
    return { ok: false, error: 'No se pudo validar el captcha. Intenta nuevamente.' };
  }

  if (!payload.success) {
    console.warn('[recaptcha] Token rechazado.', payload['error-codes']);
    return { ok: false, error: 'Verificación anti-spam inválida. Recarga la página e intenta de nuevo.' };
  }

  if (options?.expectedAction && payload.action && payload.action !== options.expectedAction) {
    return { ok: false, error: 'Verificación anti-spam inválida.' };
  }

  const score = typeof payload.score === 'number' ? payload.score : 0;
  if (score < RECAPTCHA_MIN_SCORE) {
    console.warn('[recaptcha] Score bajo.', { score, action: payload.action, hostname: payload.hostname });
    return { ok: false, error: 'No pudimos validar tu envío. Si eres humano, intenta de nuevo en unos segundos.' };
  }

  return { ok: true, score };
}
