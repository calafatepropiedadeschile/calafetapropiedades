'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface Props {
  value: string;
  label?: string;
}

export default function CopyTextButton({ value, label = 'Copiar' }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button type="button" className="btn btn-outline btn-sm" onClick={handleCopy}>
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? 'Copiado' : label}
    </button>
  );
}
