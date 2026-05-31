'use client';

import { Trash2 } from 'lucide-react';
import { deleteAgent } from '@/app/admin/(dashboard)/agentes/actions';

interface Props {
  id: string;
  name: string;
}

export default function DeleteAgentButton({ id, name }: Props) {
  return (
    <form action={deleteAgent.bind(null, id)}>
      <button
        type="submit"
        className="btn btn-ghost btn-sm"
        style={{ color: 'var(--color-red)' }}
        onClick={(event) => {
          if (!confirm(`¿Estás seguro de eliminar a ${name}?`)) {
            event.preventDefault();
          }
        }}
      >
        <Trash2 size={16} /> Eliminar
      </button>
    </form>
  );
}
