'use client';

import { useEffect } from 'react';
import { captureAttributionFromLocation } from '@/lib/marketing/attribution';

export default function AttributionCapture() {
  useEffect(() => {
    captureAttributionFromLocation();
  }, []);

  return null;
}
