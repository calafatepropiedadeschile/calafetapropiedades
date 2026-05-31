'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { createAgent } from '@/app/admin/(dashboard)/agentes/actions';

export default function AgentFormModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    await createAgent(formData);
    setIsOpen(false);
    setIsSubmitting(false);
  }

  return (
    <>
      <button type="button" className="btn btn-primary" onClick={() => setIsOpen(true)}>
        <Plus size={18} />
        Nuevo Agente
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', 
          alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: 'white', padding: 'var(--space-xl)', borderRadius: 'var(--radius-lg)',
            width: '100%', maxWidth: '400px', position: 'relative'
          }}>
            <button 
              type="button" 
              onClick={() => setIsOpen(false)}
              style={{ position: 'absolute', top: 'var(--space-md)', right: 'var(--space-md)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 'var(--space-lg)' }}>Nuevo Agente</h2>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label">Nombre *</label>
                <input name="name" className="input" required minLength={2} placeholder="Ej: Juan Pérez" />
              </div>
              <div className="input-group">
                <label className="input-label">Email</label>
                <input name="email" type="email" className="input" placeholder="juan@ejemplo.com" />
              </div>
              <div className="input-group" style={{ marginBottom: 'var(--space-xl)' }}>
                <label className="input-label">Teléfono</label>
                <input name="phone" className="input" placeholder="+56 9..." />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : 'Guardar agente'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
