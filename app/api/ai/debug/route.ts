/**
 * Debug endpoint to check environment variables
 */

import { NextResponse } from 'next/server';

export async function GET() {
  const rawOpenRouterKey = process.env.OPENROUTER_API_KEY;
  const sanitizedOpenRouterKey = rawOpenRouterKey?.trim().replace(/^['"]|['"]$/g, '');

  return NextResponse.json({
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasOpenRouterKey: !!rawOpenRouterKey,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 30) + '...',
    openRouterKeyLength: rawOpenRouterKey?.length || 0,
    openRouterKeyPrefix: sanitizedOpenRouterKey?.slice(0, 12) || null,
    openRouterKeySuffix: sanitizedOpenRouterKey?.slice(-6) || null,
  });
}
