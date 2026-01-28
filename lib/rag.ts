/**
 * RAG (Retrieval Augmented Generation) System
 * Handles vector search and context retrieval
 */

import { createClient } from '@supabase/supabase-js';
import { generateEmbedding } from './openrouter';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export interface KnowledgeChunk {
  id: string;
  content: string;
  source: string;
  metadata: any;
  similarity: number;
}

/**
 * Search knowledge base using semantic similarity
 */
export async function searchKnowledge(
  query: string,
  options: {
    matchThreshold?: number;
    matchCount?: number;
  } = {}
): Promise<KnowledgeChunk[]> {
  const {
    matchThreshold = 0.7,
    matchCount = 5,
  } = options;

  try {
    if (!supabase) {
      console.warn('Supabase env vars missing, skipping RAG search');
      return [];
    }

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);
    
    // If embeddings not available, skip RAG
    if (!queryEmbedding) {
      console.log('Embeddings not available, skipping RAG search');
      return [];
    }
    
    // Call Supabase function for vector similarity search
    const { data, error } = await supabase.rpc('match_knowledge', {
      query_embedding: queryEmbedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
    });

    if (error) {
      console.error('Error searching knowledge base:', error);
      return [];
    }

    return data || [];
    
  } catch (error) {
    console.error('Error in searchKnowledge:', error);
    return [];
  }
}

/**
 * Get diverse context by searching multiple related queries
 * This improves RAG quality by pulling from different angles
 */
export async function getDiverseContext(
  query: string,
  matchCount: number = 3
): Promise<KnowledgeChunk[]> {
  const contexts: KnowledgeChunk[] = [];
  
  // Main query
  const mainResults = await searchKnowledge(query, { matchCount });
  contexts.push(...mainResults);
  
  // Extract keywords for broader search
  const keywords = extractKeywords(query);
  
  if (keywords.length > 0) {
    const keywordQuery = keywords.slice(0, 3).join(' ');
    const keywordResults = await searchKnowledge(keywordQuery, { 
      matchCount: Math.ceil(matchCount / 2),
      matchThreshold: 0.65, // Lower threshold for broader context
    });
    
    // Merge and deduplicate
    for (const result of keywordResults) {
      if (!contexts.find(c => c.id === result.id)) {
        contexts.push(result);
      }
    }
  }
  
  // Sort by similarity and return top N
  return contexts
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, matchCount * 2);
}

/**
 * Simple keyword extraction
 */
function extractKeywords(text: string): string[] {
  // Remove common stop words
  const stopWords = new Set([
    'el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'ser', 'se', 'no', 'haber',
    'por', 'con', 'su', 'para', 'como', 'estar', 'tener', 'le', 'lo', 'todo',
    'pero', 'más', 'hacer', 'o', 'poder', 'decir', 'este', 'ir', 'otro', 'ese',
    'cómo', 'quiero', 'necesito', 'puedo', 'debo', 'the', 'is', 'at', 'which',
    'on', 'in', 'to', 'a', 'an', 'as', 'are', 'was', 'be', 'by', 'for', 'it',
  ]);
  
  return text
    .toLowerCase()
    .replace(/[^\w\sáéíóúñ]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word));
}

/**
 * Check if knowledge base is populated
 */
export async function isKnowledgeBaseReady(): Promise<boolean> {
  try {
    if (!supabase) {
      return false;
    }

    const { count, error } = await supabase
      .from('knowledge_base')
      .select('*', { count: 'exact', head: true });
    
    return !error && (count || 0) > 0;
  } catch {
    return false;
  }
}
