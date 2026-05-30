import type { Metadata } from 'next';
import { Suspense } from 'react';
import GraciasView from './GraciasView';

export const metadata: Metadata = {
  title: 'Consulta recibida',
  description: 'Gracias por contactar a Calafate Propiedades.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function GraciasPage() {
  return (
    <Suspense fallback={null}>
      <GraciasView />
    </Suspense>
  );
}
