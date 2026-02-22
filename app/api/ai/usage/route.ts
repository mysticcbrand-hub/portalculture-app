/**
 * Chat Usage API Route
 * Returns current usage stats for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const DAILY_MESSAGE_LIMIT = 10;

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    // Admin accounts — unlimited
    const UNLIMITED_EMAILS = ['mysticcbrand@gmail.com'];
    const isUnlimited = UNLIMITED_EMAILS.includes(user.email ?? '');

    // Get today's usage
    const today = new Date().toISOString().split('T')[0];
    const { data: usage } = await supabase
      .from('chat_usage')
      .select('message_count, tokens_used')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle();
    
    const messageCount = usage?.message_count || 0;
    const tokensUsed = usage?.tokens_used || 0;
    const effectiveLimit = isUnlimited ? 9999 : DAILY_MESSAGE_LIMIT;
    const remaining = isUnlimited ? 9999 : Math.max(0, DAILY_MESSAGE_LIMIT - messageCount);
    
    return NextResponse.json({
      messageCount,
      tokensUsed,
      remaining,
      limit: effectiveLimit,
      isUnlimited,
      resetTime: new Date(new Date().setHours(24, 0, 0, 0)).toISOString(),
    });
    
  } catch (error) {
    console.error('Usage API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
