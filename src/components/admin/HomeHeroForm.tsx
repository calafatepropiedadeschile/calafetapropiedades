'use client';

import Image from 'next/image';
import { useRef, useState, useTransition } from 'react';
import { ImagePlus, Loader2, RotateCcw } from 'lucide-react';
import {
  HOME_HERO_DEFAULT_IMAGE,
  HOME_HERO_DEFAULTS,
} from '@/features/site-content/home-hero.defaults';
import type { HomeHeroAdminValues } from '@/features/site-content/home-hero';
import { resetHomeHeroImageAction, updateHomeHeroAction } from '@/app/admin/(dashboard)/inicio/actions';

interface Props {
  initialValues: HomeHeroAdminValues;
}

async function uploadHeroImage(file: File): Promise<string> {
  const payload = new FormData();
  payload.append('file', file);

  const response = await fetch('/api/admin/upload-image', {
    method: 'POST',
    body: payload,
  });

  const result = await response.json() as { url?: string; error?: string };

  if (!response.ok || !result.url) {
    throw new Error(result.error ?? 'No se pudo subir la imagen.');
  }

  return result.url;
}

export default function HomeHeroForm({ initialValues }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState(initialValues);
  const [uploadError, setUploadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isResettingImage, startResetTransition] = useTransition();

  const previewImage = values.imageUrl.trim() || HOME_HERO_DEFAULT_IMAGE;
  const previewTitle1 = values.titleLine1Es.trim() || HOME_HERO_DEFAULTS.titleLine1Es;
  const previewTitle2 = values.titleLine2Es.trim() || HOME_HERO_DEFAULTS.titleLine2Es;
  const previewSubtitle = values.subtitleEs.trim() || HOME_HERO_DEFAULTS.subtitleEs;

  function updateField<K extends keyof HomeHeroAdminValues>(key: K, value: HomeHeroAdminValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setSaveMessage('');
    setSaveError('');
  }

  async function handleImageUpload(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('El archivo debe ser una imagen.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('La imagen debe pesar menos de 10 MB.');
      return;
    }

    setUploadError('');
    setIsUploading(true);

    try {
      const url = await uploadHeroImage(file);
      updateField('imageUrl', url);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Error al subir la imagen.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveError('');
    setSaveMessage('');

    const formData = new FormData();
    formData.set('imageUrl', values.imageUrl.trim());
    formData.set('titleLine1Es', values.titleLine1Es);
    formData.set('titleLine2Es', values.titleLine2Es);
    formData.set('subtitleEs', values.subtitleEs);
    formData.set('titleLine1En', values.titleLine1En);
    formData.set('titleLine2En', values.titleLine2En);
    formData.set('subtitleEn', values.subtitleEn);

    startTransition(async () => {
      try {
        await updateHomeHeroAction(formData);
        setSaveMessage('Hero actualizado. Los cambios ya estan visibles en la pagina de inicio.');
      } catch (error) {
        setSaveError(error instanceof Error ? error.message : 'No se pudo guardar el hero.');
      }
    });
  }

  function handleResetImage() {
    setUploadError('');
    startResetTransition(async () => {
      try {
        await resetHomeHeroImageAction();
        updateField('imageUrl', '');
        setSaveMessage('Imagen restaurada al valor por defecto del sitio.');
      } catch (error) {
        setSaveError(error instanceof Error ? error.message : 'No se pudo restaurar la imagen.');
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="admin-form-stack">
      <section className="admin-form-section">
        <h2 className="admin-form-section-title">Vista previa</h2>
        <div
          className="home-hero-admin-preview"
          style={{
            backgroundImage: `linear-gradient(rgba(49, 37, 74, 0.74), rgba(49, 37, 74, 0.74)), url("${previewImage}")`,
          }}
        >
          <div className="home-hero-admin-preview-content">
            <h3 className="hero-title" style={{ color: '#fff', marginBottom: '0.75rem' }}>
              {previewTitle1}
              <br />
              {previewTitle2}
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.92)', margin: 0, lineHeight: 1.6 }}>
              {previewSubtitle}
            </p>
          </div>
        </div>
      </section>

      <section className="admin-form-section">
        <h2 className="admin-form-section-title">Imagen de fondo</h2>
        <p className="text-muted" style={{ marginBottom: 'var(--space-md)', fontSize: '0.9rem' }}>
          Sube una imagen panoramica (recomendado 1920×900 px o similar). Si dejas el campo vacio, se usa la imagen por defecto del sitio.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          disabled={isUploading || isPending}
          onChange={(event) => void handleImageUpload(event.target.files)}
        />

        <div className="form-grid form-grid-2" style={{ alignItems: 'start' }}>
          <div className="input-group">
            <label className="input-label">URL de imagen</label>
            <input
              className="input"
              type="url"
              placeholder={HOME_HERO_DEFAULT_IMAGE}
              value={values.imageUrl}
              onChange={(event) => updateField('imageUrl', event.target.value)}
            />
          </div>
        </div>

        {uploadError && <p className="form-error">{uploadError}</p>}

        <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', marginTop: 'var(--space-md)' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            disabled={isResettingImage || isPending}
            onClick={handleResetImage}
          >
            {isResettingImage ? <Loader2 size={16} className="spin" /> : <RotateCcw size={16} />}
            Usar imagen por defecto
          </button>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? <Loader2 size={16} className="spin" /> : <ImagePlus size={16} />}
            Elegir archivo
          </button>
        </div>

        {values.imageUrl && (
          <div className="home-hero-admin-thumb">
            <Image
              src={values.imageUrl}
              alt="Vista previa de imagen del hero"
              fill
              sizes="320px"
              style={{ objectFit: 'cover' }}
            />
          </div>
        )}
      </section>

      <section className="admin-form-section">
        <h2 className="admin-form-section-title">Textos en espanol</h2>
        <p className="text-muted" style={{ marginBottom: 'var(--space-md)', fontSize: '0.9rem' }}>
          Deja un campo vacio para usar el texto por defecto. Los valores por defecto aparecen como referencia en cada campo.
        </p>
        <div className="form-grid">
          <div className="input-group">
            <label className="input-label">Titulo — linea 1</label>
            <input
              className="input"
              maxLength={120}
              placeholder={HOME_HERO_DEFAULTS.titleLine1Es}
              value={values.titleLine1Es}
              onChange={(event) => updateField('titleLine1Es', event.target.value)}
            />
          </div>
          <div className="input-group">
            <label className="input-label">Titulo — linea 2</label>
            <input
              className="input"
              maxLength={120}
              placeholder={HOME_HERO_DEFAULTS.titleLine2Es}
              value={values.titleLine2Es}
              onChange={(event) => updateField('titleLine2Es', event.target.value)}
            />
          </div>
          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label className="input-label">Subtitulo</label>
            <textarea
              className="textarea"
              rows={3}
              maxLength={320}
              placeholder={HOME_HERO_DEFAULTS.subtitleEs}
              value={values.subtitleEs}
              onChange={(event) => updateField('subtitleEs', event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="admin-form-section">
        <h2 className="admin-form-section-title">Textos en ingles (opcional)</h2>
        <div className="form-grid">
          <div className="input-group">
            <label className="input-label">Title — line 1</label>
            <input
              className="input"
              maxLength={120}
              placeholder={HOME_HERO_DEFAULTS.titleLine1En}
              value={values.titleLine1En}
              onChange={(event) => updateField('titleLine1En', event.target.value)}
            />
          </div>
          <div className="input-group">
            <label className="input-label">Title — line 2</label>
            <input
              className="input"
              maxLength={120}
              placeholder={HOME_HERO_DEFAULTS.titleLine2En}
              value={values.titleLine2En}
              onChange={(event) => updateField('titleLine2En', event.target.value)}
            />
          </div>
          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label className="input-label">Subtitle</label>
            <textarea
              className="textarea"
              rows={3}
              maxLength={320}
              placeholder={HOME_HERO_DEFAULTS.subtitleEn}
              value={values.subtitleEn}
              onChange={(event) => updateField('subtitleEn', event.target.value)}
            />
          </div>
        </div>
      </section>

      {saveError && <p className="form-error">{saveError}</p>}
      {saveMessage && (
        <p style={{ color: 'var(--color-success, #15803d)', margin: 0, fontWeight: 600 }}>
          {saveMessage}
        </p>
      )}

      <div className="form-actions">
        <button type="submit" className="btn btn-primary btn-lg" disabled={isPending || isUploading}>
          {isPending ? 'Guardando...' : 'Guardar hero del inicio'}
        </button>
      </div>
    </form>
  );
}
