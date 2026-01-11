/**
 * Debug endpoint to check environment variables
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasOpenRouterKey: !!process.env.OPENROUTER_API_KEY,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 30) + '...',
    openRouterKeyLength: process.env.OPENROUTER_API_KEY?.length || 0,
  });
}
