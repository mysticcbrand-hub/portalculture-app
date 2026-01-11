/**
 * AI Chat API Route
 * Handles chat requests with RAG and streaming responses
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { chatCompletionStream, parseSSEStream } from '@/lib/openrouter';
import { getDiverseContext } from '@/lib/rag';
import { buildChatMessages } from '@/lib/prompts';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Rate limiting
const DAILY_MESSAGE_LIMIT = 20;

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory = [] } = await request.json();
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
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
    
    // Check rate limit
    const today = new Date().toISOString().split('T')[0];
    const { data: usage } = await supabase
      .from('chat_usage')
      .select('message_count')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();
    
    if (usage && usage.message_count >= DAILY_MESSAGE_LIMIT) {
      return NextResponse.json(
        { 
          error: 'Daily message limit reached',
          limit: DAILY_MESSAGE_LIMIT,
          message: `Has alcanzado tu límite diario de ${DAILY_MESSAGE_LIMIT} mensajes. Vuelve mañana para continuar. 💪`
        },
        { status: 429 }
      );
    }
    
    // Save user message
    await supabase
      .from('chat_messages')
      .insert({
        user_id: user.id,
        role: 'user',
        content: message,
      });
    
    // Get relevant context from knowledge base
    const contextChunks = await getDiverseContext(message, 3);
    
    // Build messages for AI
    const messages = buildChatMessages(
      message,
      contextChunks.map(c => ({ content: c.content, source: c.source })),
      conversationHistory
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
          
          // Save assistant response and update usage
          await Promise.all([
            supabase
              .from('chat_messages')
              .insert({
                user_id: user.id,
                role: 'assistant',
                content: fullResponse,
                context_used: contextChunks.map(c => c.id),
                tokens_used: Math.ceil(fullResponse.length / 4), // Rough estimate
              }),
            
            supabase.rpc('increment_chat_usage', {
              p_user_id: user.id,
              p_message_count: 1,
              p_tokens_used: Math.ceil(fullResponse.length / 4),
            }),
          ]);
          
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
    
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
