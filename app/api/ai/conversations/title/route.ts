import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const openrouterKey = process.env.OPENROUTER_API_KEY!;

async function getUserFromRequest(request: NextRequest) {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return { supabase, user: null };
  const token = authHeader.substring(7);
  const { data: { user } } = await supabase.auth.getUser(token);
  return { supabase, user };
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { conversationId, firstMessage } = await request.json();
    if (!conversationId || !firstMessage) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    let title = String(firstMessage).slice(0, 50);
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openrouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://app.portalculture.com',
          'X-Title': 'Portal Culture NOVA',
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Generate a concise 3-5 word title in Spanish for this conversation. Return ONLY the title, no quotes, no punctuation at end.',
            },
            { role: 'user', content: firstMessage },
          ],
          max_tokens: 20,
          temperature: 0.3,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const generated = data.choices?.[0]?.message?.content?.trim();
        if (generated && generated.length > 0) title = generated.slice(0, 60);
      }
    } catch (e) {
      console.error('Title generation failed, using fallback:', e);
    }

    const { data, error } = await supabase
      .from('ai_conversations')
      .update({ title })
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .select('id, title')
      .single();

    if (error) throw error;

    return NextResponse.json({ title: data.title });
  } catch (error) {
    console.error('Title route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
