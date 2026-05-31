'use client';

import { createContext, useContext, ReactNode } from 'react';
import type { SiteSettingsPayload } from './site-settings';

const SiteSettingsContext = createContext<SiteSettingsPayload | null>(null);

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error('useSiteSettings debe ser usado dentro de un SiteSettingsProvider');
  }
  return context;
}

export function SiteSettingsProvider({
  children,
  settings,
}: {
  children: ReactNode;
  settings: SiteSettingsPayload;
}) {
  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  );
}
