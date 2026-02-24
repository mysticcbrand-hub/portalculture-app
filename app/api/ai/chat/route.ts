/**
 * AI Chat API Route
 * Handles chat requests with RAG and streaming responses
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { chatCompletionStream, parseSSEStream } from '@/lib/openrouter';
import { getDiverseContext } from '@/lib/rag';
import { buildChatMessages } from '@/lib/prompts';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

// Rate limiting
const DAILY_MESSAGE_LIMIT = 10;

export async function POST(request: NextRequest) {
  try {
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Server misconfiguration: missing Supabase env vars' },
        { status: 500 }
      );
    }

    const { message, conversationHistory = [], conversationId } = await request.json();
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (!conversationId || typeof conversationId !== 'string') {
      return NextResponse.json(
        { error: 'conversationId is required' },
        { status: 400 }
      );
    }
    
    // Get user from session
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
    
    // Check unlimited: admin hardcoded OR paid metadata OR premium_users
    const ADMIN_EMAILS = ['mysticcbrand@gmail.com'];
    let isUnlimited = ADMIN_EMAILS.includes(user.email ?? '') || user.user_metadata?.access_status === 'paid';
    if (!isUnlimited) {
      const { data: premiumRecord } = await supabase
        .from('premium_users')
        .select('id')
        .eq('user_id', user.id)
        .eq('access_granted', true)
        .eq('payment_status', 'active')
        .maybeSingle();
      isUnlimited = !!premiumRecord;
    }

    // Check rate limit — atomic read
    const today = new Date().toISOString().split('T')[0];
    const { data: usage, error: usageError } = await supabase
      .from('chat_usage')
      .select('id, message_count, tokens_used')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle();
    
    if (usageError) {
      console.error('Chat usage query error:', usageError);
    }

    const currentCount = usage?.message_count ?? 0;

    if (!isUnlimited && currentCount >= DAILY_MESSAGE_LIMIT) {
      const resetTime = new Date();
      resetTime.setHours(24, 0, 0, 0);
      const hoursLeft = Math.ceil((resetTime.getTime() - Date.now()) / 1000 / 3600);
      return NextResponse.json(
        { 
          error: 'Daily message limit reached',
          limit: DAILY_MESSAGE_LIMIT,
          used: currentCount,
          resetIn: hoursLeft,
          message: `Has alcanzado tu límite diario de ${DAILY_MESSAGE_LIMIT} mensajes. Se restablece en ${hoursLeft}h. 💪`
        },
        { status: 429 }
      );
    }
    
    // Save user message (non-blocking)
    const { error: insertUserError } = await supabase
      .from('ai_messages')
      .insert({
        conversation_id: conversationId,
        user_id: user.id,
        role: 'user',
        content: message,
      });

    if (insertUserError) {
      console.error('Chat message insert error:', insertUserError);
    }
    
    // Get relevant context from knowledge base
    const contextChunks = await getDiverseContext(message, 3);
    
    // Get user name for personalization
    let userName: string | undefined;
    const { data: waitlistData } = await supabase
      .from('waitlist').select('name').eq('email', user.email ?? '')
      .order('submitted_at', { ascending: false }).limit(1).maybeSingle();
    if (waitlistData?.name) {
      userName = waitlistData.name.trim().split(' ')[0];
    } else {
      const { data: profileData } = await supabase
        .from('profiles').select('full_name').eq('id', user.id).maybeSingle();
      const fullName = profileData?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || '';
      if (fullName) userName = fullName.trim().split(' ')[0];
    }

    // Build messages for AI
    const messages = buildChatMessages(
      message,
      contextChunks.map(c => ({ content: c.content, source: c.source })),
      conversationHistory,
      userName
    );
    
    // Stream response
    const stream = await chatCompletionStream(messages, {
      temperature: 0.7,
      maxTokens: 1500,
    });
    
    // Transform OpenRouter stream to our format
    const encoder = new TextEncoder();
    let fullResponse = '';
    
    const transformedStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of parseSSEStream(stream)) {
            fullResponse += chunk;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`));
          }
          
          // Save assistant response and update usage atomically
          const tokensUsed = Math.ceil(fullResponse.length / 4);
          const newCount = currentCount + 1;

          const [insertAssistantResult, usageUpsertResult] = await Promise.all([
            supabase
              .from('ai_messages')
              .insert({
                conversation_id: conversationId,
                user_id: user.id,
                role: 'assistant',
                content: fullResponse,
                tokens_used: tokensUsed,
              }),
            // Atomic upsert: create row if not exists, or increment count
            usage?.id
              ? supabase
                  .from('chat_usage')
                  .update({
                    message_count: newCount,
                    tokens_used: ((usage as any).tokens_used ?? 0) + tokensUsed,
                  })
                  .eq('id', usage.id)
              : supabase
                  .from('chat_usage')
                  .insert({
                    user_id: user.id,
                    date: today,
                    message_count: 1,
                    tokens_used: tokensUsed,
                  }),
          ]);

          if (insertAssistantResult.error) {
            console.error('Assistant message insert error:', insertAssistantResult.error);
          }
          if (usageUpsertResult.error) {
            console.error('Chat usage upsert error:', usageUpsertResult.error);
          }
          
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
          
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        }
      },
    });
    
    return new Response(transformedStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
    
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        detail: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
