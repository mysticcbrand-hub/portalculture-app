/**
 * OpenRouter Client for Portal Culture AI Coach
 * Handles chat completions with streaming support
 */

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
// Use Mistral Devstral as default (free tier, good reasoning)
const DEFAULT_MODEL = 'mistralai/devstral-2512:free';

/**
 * Generate chat completion (non-streaming)
 */
export async function chatCompletion(
  messages: ChatMessage[],
  options: ChatCompletionOptions = {}
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY not found in environment variables');
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://app-portalculture.vercel.app',
      'X-Title': 'Portal Culture AI Coach',
    },
    body: JSON.stringify({
      model: options.model || DEFAULT_MODEL,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Generate chat completion with streaming
 * Returns a ReadableStream for Server-Sent Events
 */
export async function chatCompletionStream(
  messages: ChatMessage[],
  options: ChatCompletionOptions = {}
): Promise<ReadableStream> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY not found in environment variables');
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://app-portalculture.vercel.app',
      'X-Title': 'Portal Culture AI Coach',
    },
    body: JSON.stringify({
      model: options.model || DEFAULT_MODEL,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1000,
      stream: true,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
  }

  return response.body!;
}

/**
 * Parse SSE stream from OpenRouter
 */
export async function* parseSSEStream(stream: ReadableStream): AsyncGenerator<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      
      // Keep last incomplete line in buffer
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          
          if (data === '[DONE]') {
            return;
          }
          
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            
            if (content) {
              yield content;
            }
          } catch (e) {
            // Skip invalid JSON
            continue;
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Generate embeddings for RAG
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY not found in environment variables');
  }

  const response = await fetch('https://openrouter.ai/api/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openai/text-embedding-3-small',
      input: text.slice(0, 8000), // Limit input size
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter Embeddings API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}
