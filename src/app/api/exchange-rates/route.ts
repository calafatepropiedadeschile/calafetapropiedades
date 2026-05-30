import { NextResponse } from 'next/server';
import { getExchangeRates } from '@/lib/currency/exchange-rates';

export const revalidate = 3600;

export async function GET() {
  const rates = await getExchangeRates();
  return NextResponse.json(rates, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
