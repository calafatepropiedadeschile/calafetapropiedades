'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle2, CircleDot, Mail, MessageCircle, Trash2, XCircle } from 'lucide-react';
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
    <div className="admin-actions-row">
      <a className="btn btn-outline btn-sm" href={`mailto:${email}?subject=${encodeURIComponent(`Consulta ${siteConfig.name}`)}`}>
        <Mail size={15} />
        Email
      </a>
      {phone && (
        <a className="btn btn-outline btn-sm" href={`https://wa.me/${normalizePhoneForWhatsApp(phone)}`} target="_blank" rel="noreferrer">
          <MessageCircle size={15} />
          WhatsApp
        </a>
      )}
      <button type="button" className="btn btn-outline btn-sm" onClick={handleStatusChange} disabled={isPending}>
        {status === 'pendiente' && <CircleDot size={15} />}
        {status === 'contactada' && <CheckCircle2 size={15} />}
        {status === 'cerrada' && <XCircle size={15} />}
        {STATUS_ACTION_LABEL[status]}
      </button>
      <button type="button" className="btn btn-danger btn-sm" onClick={handleDelete} disabled={isPending}>
        <Trash2 size={15} />
        Eliminar
      </button>
    </div>
  );
}
