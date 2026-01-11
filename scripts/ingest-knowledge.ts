/**
 * PORTAL CULTURE - KNOWLEDGE INGESTION SYSTEM
 * 
 * This script:
 * 1. Extracts text from PDFs (Atomic Habits, Charisma Myth)
 * 2. Scrapes web content (Huberman, James Clear, Examine, Stronger by Science)
 * 3. Chunks content intelligently
 * 4. Generates embeddings using OpenRouter
 * 5. Stores in Supabase knowledge_base table
 * 
 * Run: npx tsx scripts/ingest-knowledge.ts
 */

import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';
import { parse } from 'node-html-parser';

// Supabase client
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const openrouterKey = process.env.OPENROUTER_API_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================
// CONFIGURATION
// ============================================
const CHUNK_SIZE = 1000; // Characters per chunk
const CHUNK_OVERLAP = 200; // Overlap between chunks
const MAX_RETRIES = 3;
const DELAY_BETWEEN_REQUESTS = 1000; // 1 second between API calls

const PDF_SOURCES = [
  {
    path: '/Users/mario/Downloads/Atomic habits ( PDFDrive ).pdf',
    name: 'atomic_habits',
    author: 'James Clear',
  },
  {
    path: '/Users/mario/Downloads/the-charisma-myth-how-anyone-can-master-the-art-and-science-of-personal-magnetism-9781101560303-2011043729_compress.pdf',
    name: 'charisma_myth',
    author: 'Olivia Fox Cabane',
  },
];

const WEB_SOURCES = [
  {
    name: 'huberman_lab',
    urls: [
      'https://www.hubermanlab.com/newsletter',
      'https://www.hubermanlab.com/protocols',
    ],
    maxPages: 10,
  },
  {
    name: 'james_clear',
    urls: [
      'https://jamesclear.com/articles',
    ],
    maxPages: 20,
  },
  {
    name: 'stronger_by_science',
    urls: [
      'https://www.strongerbyscience.com/research-spotlight/',
    ],
    maxPages: 15,
  },
  {
    name: 'examine',
    urls: [
      'https://examine.com/guides/',
    ],
    maxPages: 10,
  },
];

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Sleep utility for rate limiting
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Clean text: remove extra whitespace, special characters
 */
function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ') // Multiple spaces -> single space
    .replace(/\n+/g, '\n') // Multiple newlines -> single newline
    .replace(/[^\x20-\x7E\n]/g, '') // Remove non-ASCII chars
    .trim();
}

/**
 * Chunk text with overlap for better context preservation
 */
function chunkText(text: string, chunkSize: number, overlap: number): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.slice(start, end);
    
    if (chunk.trim().length > 100) { // Only keep chunks with substantial content
      chunks.push(chunk.trim());
    }
    
    start += chunkSize - overlap;
  }

  return chunks;
}

/**
 * Generate embedding using OpenRouter (via OpenAI-compatible endpoint)
 */
async function generateEmbedding(text: string, retries = 0): Promise<number[]> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openrouterKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/text-embedding-3-small', // Cost-effective embedding model
        input: text.slice(0, 8000), // Limit to 8k chars for safety
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
    
  } catch (error) {
    if (retries < MAX_RETRIES) {
      console.log(`Retry ${retries + 1}/${MAX_RETRIES} for embedding...`);
      await sleep(2000 * (retries + 1)); // Exponential backoff
      return generateEmbedding(text, retries + 1);
    }
    throw error;
  }
}

// ============================================
// PDF EXTRACTION
// ============================================

async function extractPDF(pdfPath: string, sourceName: string, author: string) {
  console.log(`\n📖 Processing PDF: ${sourceName}...`);
  
  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(dataBuffer);
    
    const cleanedText = cleanText(data.text);
    const chunks = chunkText(cleanedText, CHUNK_SIZE, CHUNK_OVERLAP);
    
    console.log(`   ✓ Extracted ${chunks.length} chunks from ${data.numpages} pages`);
    
    let successCount = 0;
    
    for (let i = 0; i < chunks.length; i++) {
      try {
        console.log(`   Processing chunk ${i + 1}/${chunks.length}...`);
        
        const embedding = await generateEmbedding(chunks[i]);
        
        const { error } = await supabase
          .from('knowledge_base')
          .insert({
            content: chunks[i],
            source: sourceName,
            source_type: 'pdf',
            metadata: {
              author,
              chunk_index: i,
              total_chunks: chunks.length,
            },
            embedding,
          });
        
        if (error) throw error;
        
        successCount++;
        await sleep(DELAY_BETWEEN_REQUESTS); // Rate limit
        
      } catch (error) {
        console.error(`   ✗ Failed chunk ${i}: ${error}`);
      }
    }
    
    console.log(`   ✅ Successfully inserted ${successCount}/${chunks.length} chunks`);
    
  } catch (error) {
    console.error(`   ✗ Failed to process PDF: ${error}`);
  }
}

// ============================================
// WEB SCRAPING
// ============================================

async function scrapeWebPage(url: string, sourceName: string) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PortalCultureBot/1.0)',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const html = await response.text();
    const root = parse(html);
    
    // Remove script, style, nav, footer tags
    root.querySelectorAll('script, style, nav, footer, header').forEach(el => el.remove());
    
    // Extract main content (try common selectors)
    const contentSelectors = ['article', 'main', '.content', '.post', '#content'];
    let mainContent = '';
    
    for (const selector of contentSelectors) {
      const element = root.querySelector(selector);
      if (element) {
        mainContent = element.text;
        break;
      }
    }
    
    if (!mainContent) {
      mainContent = root.querySelector('body')?.text || '';
    }
    
    const cleanedText = cleanText(mainContent);
    
    if (cleanedText.length < 200) {
      console.log(`   ⚠️  Skipped (too short): ${url}`);
      return 0;
    }
    
    const chunks = chunkText(cleanedText, CHUNK_SIZE, CHUNK_OVERLAP);
    
    let successCount = 0;
    
    for (let i = 0; i < chunks.length; i++) {
      try {
        const embedding = await generateEmbedding(chunks[i]);
        
        const { error } = await supabase
          .from('knowledge_base')
          .insert({
            content: chunks[i],
            source: sourceName,
            source_type: 'web',
            metadata: {
              url,
              chunk_index: i,
              total_chunks: chunks.length,
              scraped_at: new Date().toISOString(),
            },
            embedding,
          });
        
        if (error) throw error;
        
        successCount++;
        await sleep(DELAY_BETWEEN_REQUESTS);
        
      } catch (error) {
        console.error(`   ✗ Failed chunk ${i} from ${url}: ${error}`);
      }
    }
    
    return successCount;
    
  } catch (error) {
    console.error(`   ✗ Failed to scrape ${url}: ${error}`);
    return 0;
  }
}

async function scrapeWebSource(source: typeof WEB_SOURCES[0]) {
  console.log(`\n🌐 Scraping: ${source.name}...`);
  
  let totalChunks = 0;
  
  for (const url of source.urls) {
    console.log(`   Processing: ${url}`);
    const chunks = await scrapeWebPage(url, source.name);
    totalChunks += chunks;
    await sleep(2000); // Be nice to servers
  }
  
  console.log(`   ✅ Scraped ${totalChunks} chunks from ${source.name}`);
}

// ============================================
// MAIN EXECUTION
// ============================================

async function main() {
  console.log('🚀 PORTAL CULTURE - KNOWLEDGE INGESTION STARTED\n');
  console.log('='.repeat(60));
  
  // Check if tables exist
  const { data: tables, error: tablesError } = await supabase
    .from('knowledge_base')
    .select('id')
    .limit(1);
  
  if (tablesError) {
    console.error('❌ ERROR: knowledge_base table not found!');
    console.error('Please run supabase-setup.sql first.');
    process.exit(1);
  }
  
  // Clear existing data (optional - comment out to append)
  console.log('\n🗑️  Clearing existing knowledge base...');
  await supabase.from('knowledge_base').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('   ✓ Cleared');
  
  // Process PDFs
  console.log('\n📚 PHASE 1: PDF EXTRACTION');
  console.log('='.repeat(60));
  
  for (const pdf of PDF_SOURCES) {
    if (fs.existsSync(pdf.path)) {
      await extractPDF(pdf.path, pdf.name, pdf.author);
    } else {
      console.log(`   ⚠️  PDF not found: ${pdf.path}`);
    }
  }
  
  // Process Web Sources
  console.log('\n🌐 PHASE 2: WEB SCRAPING');
  console.log('='.repeat(60));
  
  for (const source of WEB_SOURCES) {
    await scrapeWebSource(source);
  }
  
  // Summary
  const { count } = await supabase
    .from('knowledge_base')
    .select('*', { count: 'exact', head: true });
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ INGESTION COMPLETE!');
  console.log(`📊 Total knowledge chunks in database: ${count}`);
  console.log('='.repeat(60));
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { main as ingestKnowledge };
