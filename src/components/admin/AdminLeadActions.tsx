'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, CircleDot, Eye, Mail, MessageCircle, Trash2, XCircle } from 'lucide-react';
import { useTransition } from 'react';
import type { LeadStatus } from '@/features/leads/lead-status';
import { siteConfig } from '@/config/site';

interface Props {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: LeadStatus;
  updateStatusAction: (id: string, status: LeadStatus) => Promise<void>;
  deleteLeadAction: (id: string) => Promise<void>;
}

const NEXT_STATUS: Record<LeadStatus, LeadStatus> = {
  pendiente: 'contactada',
  contactada: 'cerrada',
  cerrada: 'pendiente',
};

const STATUS_ACTION_LABEL: Record<LeadStatus, string> = {
  pendiente: 'Marcar contactada',
  contactada: 'Cerrar',
  cerrada: 'Reabrir',
};

function normalizePhoneForWhatsApp(phone: string) {
  return phone.replace(/[^\d+]/g, '').replace(/^\+/, '');
}

export default function AdminLeadActions({
  id,
  name,
  email,
  phone,
  status,
  updateStatusAction,
  deleteLeadAction,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const nextStatus = NEXT_STATUS[status];

  function handleStatusChange() {
    startTransition(() => {
      void (async () => {
        await updateStatusAction(id, nextStatus);
        router.refresh();
      })();
    });
  }

  function handleDelete() {
    const confirmed = window.confirm(`Eliminar la consulta de ${name}? Esta accion no se puede deshacer.`);
    if (!confirmed) return;

    startTransition(() => {
      void (async () => {
        await deleteLeadAction(id);
        router.refresh();
      })();
    });
  }

  return (
    <div className="row-actions">
      <Link href={`/admin/leads/${id}`} className="row-action-link">
        Ver ficha
      </Link>
      <span className="text-muted">|</span>
      <a className="row-action-link" href={`mailto:${email}?subject=${encodeURIComponent(`Consulta ${siteConfig.name}`)}`}>
        Email
      </a>
      {phone && (
        <>
          <span className="text-muted">|</span>
          <a className="row-action-link" href={`https://wa.me/${normalizePhoneForWhatsApp(phone)}`} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
        </>
      )}
      <span className="text-muted">|</span>
      <button type="button" className="row-action-link" onClick={handleStatusChange} disabled={isPending}>
        {STATUS_ACTION_LABEL[status]}
      </button>
      <span className="text-muted">|</span>
      <button type="button" className="row-action-link row-action-danger" onClick={handleDelete} disabled={isPending}>
        Eliminar
      </button>
    </div>
  );
}
