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

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { supabase, user } = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { title } = await request.json();
    if (!title || !params.id) return NextResponse.json({ error: 'Missing title' }, { status: 400 });

    const { data, error } = await supabase
      .from('ai_conversations')
      .update({ title: String(title).trim().slice(0, 60) })
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select('id, title, updated_at')
      .single();

    if (error) throw error;

    return NextResponse.json({ conversation: data });
  } catch (error) {
    console.error('Conversation PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
