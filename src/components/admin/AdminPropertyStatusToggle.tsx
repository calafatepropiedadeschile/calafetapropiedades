'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { getPropertyStatusLabel } from '@/lib/utils/formatters';

interface Props {
  id: string;
  status: string;
  priceType?: string | null;
  updateStatusAction: (id: string, status: 'disponible' | 'vendido') => Promise<void>;
}

export default function AdminPropertyStatusToggle({ id, status, priceType, updateStatusAction }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isSold = status === 'vendido';
  const nextStatus = isSold ? 'disponible' : 'vendido';

  function handleToggle() {
    startTransition(() => {
      void (async () => {
        await updateStatusAction(id, nextStatus);
        router.refresh();
      })();
    });
  }

  return (
    <button
      type="button"
      className={`badge ${isSold ? 'badge-red' : 'badge-green'}`}
      onClick={handleToggle}
      disabled={isPending}
      title={isSold ? 'Marcar como disponible' : priceType === 'arriendo' ? 'Marcar como arrendado' : 'Marcar como vendido'}
      style={{ cursor: isPending ? 'wait' : 'pointer', border: 'none' }}
    >
      {getPropertyStatusLabel(status, priceType)}
    </button>
  );
}
