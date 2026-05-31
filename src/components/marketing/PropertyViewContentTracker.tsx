'use client';

import { useEffect, useRef } from 'react';
import { trackViewContent } from '@/lib/marketing/analytics';

interface Props {
  contentId: string;
  contentName: string;
  value?: number | null;
  currency?: string | null;
  contentCategory?: 'property' | 'project';
}

export default function PropertyViewContentTracker({
  contentId,
  contentName,
  value,
  currency,
  contentCategory = 'property',
}: Props) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    trackViewContent({
      content_id: contentId,
      content_name: contentName,
      content_category: contentCategory,
      value: value ?? undefined,
      currency: currency ?? undefined,
    });
  }, [contentId, contentName, contentCategory, value, currency]);

  return null;
}
