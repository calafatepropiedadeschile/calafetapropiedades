'use client';

import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { siteConfig } from '@/config/site';

function getSafeAdminCallbackUrl(value: string | null) {
  if (!value) return '/admin';

  try {
    if (value.startsWith('//')) return '/admin';

    const parsed = value.startsWith('/')
      ? new URL(value, 'https://calafate.local')
      : new URL(value);

    if (!parsed.pathname.startsWith('/admin')) {
      return '/admin';
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return '/admin';
  }
}

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = getSafeAdminCallbackUrl(searchParams.get('callbackUrl'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Credenciales inválidas. Verifica tu email y contraseña.');
      setLoading(false);
    } else {
      window.location.href = callbackUrl;
    }
  }

  return (
    <div style={{
      width: '100%',
      maxWidth: '450px',
      background: '#FFFFFF',
      borderRadius: '36px',
      padding: 'var(--space-3xl) var(--space-2xl) var(--space-2xl) var(--space-2xl)',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.02)',
      position: 'relative',
      fontFamily: "var(--font-admin), 'Montserrat', sans-serif",
    }}>
      {/* Close Button x */}
      <Link href="/" style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        background: '#F3F4F6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#9CA3AF',
        fontSize: '1.2rem',
        fontWeight: '300',
        transition: 'all 200ms ease',
        cursor: 'pointer',
      }}
      className="login-close-btn"
      title="Volver al inicio"
      >
        ×
      </Link>

      {/* Header & Logo */}
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '9999px',
          border: '1px solid rgba(17, 24, 39, 0.08)',
          color: 'var(--color-primary)',
          fontFamily: 'var(--font-serif)',
          fontSize: '1.15rem',
          fontWeight: 800,
          letterSpacing: '0.2px',
          marginBottom: '16px',
          padding: '8px 18px',
        }}>
          {siteConfig.name}
        </div>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: '800',
          color: '#111827',
          marginBottom: '8px',
          letterSpacing: '-0.5px',
        }}>
          ¡Bienvenido de nuevo!
        </h1>
        <p style={{
          fontSize: '0.95rem',
          color: '#6B7280',
          margin: 0,
        }}>
          Bienvenido de nuevo a {siteConfig.name}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ position: 'relative' }}>
          <input
            id="admin-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="email@ejemplo.com"
            style={{
              width: '100%',
              height: '52px',
              borderRadius: '9999px',
              border: '1px solid #D1D5DB',
              paddingInline: '24px',
              fontSize: '0.95rem',
              color: '#1F2937',
              background: '#FFFFFF',
              outline: 'none',
              transition: 'border-color 200ms ease',
            }}
            className="login-input"
          />
        </div>

        <div style={{ position: 'relative' }}>
          <input
            id="admin-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="current-password"
            placeholder="Contraseña"
            style={{
              width: '100%',
              height: '52px',
              borderRadius: '9999px',
              border: '1px solid #D1D5DB',
              paddingLeft: '24px',
              paddingRight: '54px',
              fontSize: '0.95rem',
              color: '#1F2937',
              background: '#FFFFFF',
              outline: 'none',
              transition: 'border-color 200ms ease',
            }}
            className="login-input"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '44px',
              height: '44px',
              color: '#9CA3AF',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              outline: 'none',
            }}
            title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>

        {error && (
          <p style={{
            color: 'var(--color-error)',
            fontSize: '0.85rem',
            textAlign: 'center',
            margin: '4px 0 0 0',
          }}>
            ⚠️ {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            height: '52px',
            borderRadius: '9999px',
            background: 'var(--color-primary)',
            color: '#FFFFFF',
            fontSize: '1.05rem',
            fontWeight: '700',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '8px',
            boxShadow: 'var(--shadow-primary)',
            transition: 'all 200ms ease',
          }}
          className="login-submit-btn"
        >
          {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>
      </form>

      {/* Styled input focus */}
      <style jsx global>{`
        .login-close-btn:hover {
          background: #E5E7EB !important;
          color: #4B5563 !important;
          transform: rotate(90deg);
        }
        .login-input:focus {
          border-color: var(--color-primary) !important;
          box-shadow: 0 0 0 3px rgba(208, 1, 27, 0.1) !important;
        }
        .login-submit-btn:hover:not(:disabled) {
          background: var(--color-primary-dark) !important;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(208, 1, 27, 0.3) !important;
        }
        .login-submit-btn:active:not(:disabled) {
          transform: translateY(1px);
        }
        .login-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #EBF3FC 0%, #D4E5F7 100%)',
      padding: 'var(--space-xl)',
    }}>
      <Suspense fallback={<div style={{ color: 'var(--color-text-muted)' }}>Cargando panel...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
