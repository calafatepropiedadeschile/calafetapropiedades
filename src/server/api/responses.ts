import { NextResponse } from 'next/server';
import type { ZodError } from 'zod';
import type { ApiResponse } from '@/types/property';

export function apiOk<T>(data: T, headers?: HeadersInit): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data }, { headers });
}

export function apiCreated(message: string, headers?: HeadersInit): NextResponse<ApiResponse> {
  return NextResponse.json({ success: true, message }, { status: 201, headers });
}

export function apiBadRequest<T = never>(error: string, headers?: HeadersInit): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: false, error }, { status: 400, headers });
}

export function apiForbidden<T = never>(error: string, headers?: HeadersInit): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: false, error }, { status: 403, headers });
}

export function apiServerError<T = never>(error: string, headers?: HeadersInit): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: false, error }, { status: 500, headers });
}

export function firstZodError(error: ZodError): string {
  return error.issues[0]?.message ?? 'Solicitud invalida';
}
