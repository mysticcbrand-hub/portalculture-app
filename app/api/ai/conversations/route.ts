import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function getUserFromRequest(request: NextRequest) {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { supabase, user: null };
  }
  const token = authHeader.substring(7);
  const { data: { user } } = await supabase.auth.getUser(token);
  return { supabase, user };
}

export async function GET(request: NextRequest) {
  try {
    const { supabase, user } = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase
      .from('ai_conversations')
      .select('id, title, created_at, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ conversations: data ?? [] });
  } catch (error) {
    console.error('Conversations GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { title } = await request.json().catch(() => ({ title: '' }));
    const { data, error } = await supabase
      .from('ai_conversations')
      .insert({
        user_id: user.id,
        title: (title && String(title).trim()) || 'Nueva conversación',
      })
      .select('id, title, created_at, updated_at')
      .single();

    if (error) throw error;

    return NextResponse.json({ conversation: data });
  } catch (error) {
    console.error('Conversations POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

