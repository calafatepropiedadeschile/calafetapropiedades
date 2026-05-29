'use client';

import dynamic from 'next/dynamic';

const PropertyMap = dynamic(() => import('@/components/properties/PropertyMap'), {
  ssr: false,
  loading: () => <div className="skeleton" style={{ height: '400px', width: '100%' }} />,
});

interface Props {
  lat: number;
  lng: number;
  title: string;
}

export default function PropertyMapClient(props: Props) {
  return <PropertyMap {...props} />;
}
