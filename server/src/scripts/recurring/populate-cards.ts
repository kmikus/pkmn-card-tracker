import { PrismaClient } from '../../../generated/prisma';
import axios from 'axios';
const JSZip = require('jszip');
import * as crypto from 'crypto';

const GITHUB_ZIP_URL = 'https://github.com/PokemonTCG/pokemon-tcg-data/archive/refs/heads/master.zip';
const prisma = new PrismaClient();

interface GitHubCard {
  id: string;
  name: string;
  images: {
    small: string;
    large: string;
  };
  set: {
    id: string;
    name: string;
  };
  number: string;
  [key: string]: any; // Allow additional properties
}

interface GitHubSet {
  id: string;
  name: string;
  series: string;
  printedTotal: number;
  total: number;
  legalities: {
    unlimited?: string;
    standard?: string;
    expanded?: string;
  };
  ptcgoCode?: string;
  releaseDate: string;
  updatedAt: string;
  images: {
    symbol: string;
    logo: string;
  };
}

interface MemoryStats {
  used: number;
  total: number;
  external: number;
  heapUsed: number;
  heapTotal: number;
}

// Configuration
const BATCH_SIZE = 50; // Process cards in small batches to manage memory
const MAX_ERRORS = 10;
const RETRY_DELAYS = [5000, 10000, 15000]; // 5s, 10s, 15s

// Memory monitoring
function getMemoryStats(): MemoryStats {
  const memUsage = process.memoryUsage();
  return {
    used: Math.round(memUsage.rss / 1024 / 1024), // MB
    total: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
    external: Math.round(memUsage.external / 1024 / 1024), // MB
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) // MB
  };
}

function logMemoryStats(stage: string): void {
  const stats = getMemoryStats();
  console.log(`🧠 Memory [${stage}]: Used: ${stats.used}MB, Heap: ${stats.heapUsed}/${stats.heapTotal}MB, External: ${stats.external}MB`);
}

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function makeRequestWithRetry<T>(url: string, description: string): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
    try {
      const response = await axios.get<T>(url, {
        responseType: 'arraybuffer',
        timeout: 30000, // 30 second timeout
        headers: {
          'User-Agent': 'PokemonCardTracker/1.0'
        }
      });
      return response.data;
    } catch (error: any) {
      lastError = error;
      
      if (attempt < RETRY_DELAYS.length) {
        const delayMs = RETRY_DELAYS[attempt];
        console.log(`  ⚠️  Attempt ${attempt + 1} failed for ${description}. Retrying in ${delayMs/1000}s...`);
        await delay(delayMs);
      }
    }
  }
  
  throw lastError;
}

async function downloadGitHubZip(): Promise<{ buffer: Buffer; etag: string; lastModified: string }> {
  console.log('📥 Downloading GitHub repository ZIP...');
  logMemoryStats('Before download');
  
  try {
    const response = await axios.get(GITHUB_ZIP_URL, {
      responseType: 'arraybuffer',
      timeout: 60000, // 60 second timeout for large file
      headers: {
        'User-Agent': 'PokemonCardTracker/1.0'
      },
      validateStatus: (status) => status === 200
    });
    
    const buffer = Buffer.from(response.data);
    const etag = response.headers.etag || '';
    const lastModified = response.headers['last-modified'] || '';
    
    console.log(`✅ Downloaded ZIP: ${Math.round(buffer.length / 1024 / 1024)}MB`);
    console.log(`📅 Last Modified: ${lastModified}`);
    console.log(`🏷️  ETag: ${etag}`);
    logMemoryStats('After download');
    
    return { buffer, etag, lastModified };
  } catch (error: any) {
    console.error('❌ Error downloading GitHub ZIP:', error.message);
    throw error;
  }
}

async function checkIfDataChanged(etag: string, lastModified: string): Promise<boolean> {
  try {
    // Check if we have a record of the last sync
    const lastSync = await prisma.$queryRaw`
      SELECT value FROM sync_metadata WHERE key = 'github_cards_and_sets_sync'
      LIMIT 1
    ` as any[];
    
    if (lastSync.length === 0) {
      console.log('🆕 No previous sync record found. Processing all data.');
      return true;
    }
    
    const metadata = JSON.parse(lastSync[0].value);
    const hasChanged = metadata.etag !== etag || metadata.lastModified !== lastModified;
    
    if (hasChanged) {
      console.log('🔄 Data has changed since last sync:');
      console.log(`  Previous ETag: ${metadata.etag}`);
      console.log(`  Current ETag: ${etag}`);
      console.log(`  Previous Modified: ${metadata.lastModified}`);
      console.log(`  Current Modified: ${lastModified}`);
    } else {
      console.log('✅ No changes detected. Skipping processing.');
    }
    
    return hasChanged;
  } catch (error) {
    console.log('⚠️  Could not check for changes. Processing all data.');
    return true;
  }
}

async function saveSyncMetadata(etag: string, lastModified: string): Promise<void> {
  try {
    const metadata = JSON.stringify({ etag, lastModified, syncedAt: new Date().toISOString() });
    
    // Create a simple metadata table if it doesn't exist
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS sync_metadata (
        key VARCHAR(255) PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Save metadata
    await prisma.$executeRaw`
      INSERT INTO sync_metadata (key, value, updated_at) 
      VALUES ('github_cards_and_sets_sync', ${metadata}, CURRENT_TIMESTAMP)
      ON CONFLICT (key) 
      DO UPDATE SET value = ${metadata}, updated_at = CURRENT_TIMESTAMP
    `;
    
    console.log('💾 Sync metadata saved.');
  } catch (error) {
    console.log('⚠️  Could not save sync metadata:', error);
  }
}

async function processZipInMemory(zipBuffer: Buffer): Promise<{ cards: GitHubCard[]; sets: GitHubSet[] }> {
  console.log('📦 Processing ZIP file in memory...');
  logMemoryStats('Before ZIP processing');
  
  try {
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(zipBuffer);
    
    const allCards: GitHubCard[] = [];
    const allSets: GitHubSet[] = [];
    let cardFileCount = 0;
    let setsFileCount = 0;
    
    // Process each JSON file in the cards/en/ directory
    for (const [filename, file] of Object.entries(zipContent.files)) {
      if (filename.startsWith('pokemon-tcg-data-master/cards/en/') && filename.endsWith('.json')) {
        const setName = filename.replace('pokemon-tcg-data-master/cards/en/', '').replace('.json', '');
        console.log(`  📄 Processing card set: ${setName}`);
        
        try {
          const content = await (file as any).async('string');
          const setCards = JSON.parse(content);
          
          if (Array.isArray(setCards)) {
            allCards.push(...setCards);
            console.log(`    ✅ Added ${setCards.length} cards from ${setName}`);
          } else {
            console.log(`    ⚠️  Invalid format for ${setName}`);
          }
          
          cardFileCount++;
          
          // Log memory every 10 files
          if (cardFileCount % 10 === 0) {
            logMemoryStats(`After ${cardFileCount} card files`);
          }
          
        } catch (error: any) {
          console.error(`    ❌ Error processing card set ${setName}:`, error.message);
        }
      }
    }
    
    // Process sets data
    for (const [filename, file] of Object.entries(zipContent.files)) {
      if (filename === 'pokemon-tcg-data-master/sets/en.json') {
        console.log(`  📄 Processing sets data`);
        
        try {
          const content = await (file as any).async('string');
          const sets = JSON.parse(content);
          
          if (Array.isArray(sets)) {
            allSets.push(...sets);
            console.log(`    ✅ Added ${sets.length} sets`);
          } else {
            console.log(`    ⚠️  Invalid sets format`);
          }
          
          setsFileCount++;
          
        } catch (error: any) {
          console.error(`    ❌ Error processing sets:`, error.message);
        }
      }
    }
    
    console.log(`✅ Processed ${cardFileCount} card set files, found ${allCards.length} total cards`);
    console.log(`✅ Processed ${setsFileCount} sets files, found ${allSets.length} total sets`);
    logMemoryStats('After ZIP processing');
    
    return { cards: allCards, sets: allSets };
  } catch (error: any) {
    console.error('❌ Error processing ZIP:', error.message);
    throw error;
  }
}

async function processCardBatch(cards: GitHubCard[]): Promise<{ processed: number; created: number; updated: number; errors: number }> {
  let processed = 0;
  let created = 0;
  let updated = 0;
  let errors = 0;
  
  for (let i = 0; i < cards.length; i += BATCH_SIZE) {
    const batch = cards.slice(i, i + BATCH_SIZE);
    
    try {
      const result = await prisma.$transaction(async (tx) => {
        let batchCreated = 0;
        let batchUpdated = 0;
        
        for (const card of batch) {
          try {
            const existing = await tx.cards.findUnique({
              where: { id: card.id }
            });
            
            // Extract set ID from card ID (format: {setId}-{cardNumber})
            const setId = card.id.split('-')[0];
            
            const cardData = {
              name: card.name,
              setname: null, // We'll get this from the sets table
              image: card.images?.small,
              data: JSON.stringify(card),
              setId: setId,
              cardNumber: card.number,
              cardNumberInt: parseInt(card.number) || null
            };
            
            if (existing) {
              // Update existing card
              await tx.cards.update({
                where: { id: card.id },
                data: cardData
              });
              batchUpdated++;
            } else {
              // Create new card
              await tx.cards.create({
                data: {
                  id: card.id,
                  ...cardData
                }
              });
              batchCreated++;
            }
          } catch (error: any) {
            console.error(`    ❌ Error processing card ${card.id}:`, error.message);
            errors++;
          }
        }
        
        return { created: batchCreated, updated: batchUpdated };
      });
      
      created += result.created;
      updated += result.updated;
      processed += batch.length;
      
      console.log(`    📊 Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${result.created} created, ${result.updated} updated`);
      
      // Small delay to prevent overwhelming the database
      await delay(100);
      
    } catch (error: any) {
      console.error(`    ❌ Error processing batch ${Math.floor(i / BATCH_SIZE) + 1}:`, error.message);
      errors += batch.length;
    }
  }
  
  return { processed, created, updated, errors };
}

async function processSets(sets: GitHubSet[]): Promise<{ created: number; updated: number; errors: number }> {
  console.log(`🔄 Processing ${sets.length} sets...`);
  
  let created = 0;
  let updated = 0;
  let errors = 0;
  
  for (const set of sets) {
    try {
      const result = await prisma.sets.upsert({
        where: { id: set.id },
        update: {
          name: set.name,
          series: set.series,
          printedTotal: set.printedTotal,
          total: set.total,
          ptcgoCode: set.ptcgoCode || null,
          releaseDate: set.releaseDate,
          updatedAt: set.updatedAt,
          symbol: set.images.symbol,
          logo: set.images.logo,
          legalities: JSON.stringify(set.legalities)
        },
        create: {
          id: set.id,
          name: set.name,
          series: set.series,
          printedTotal: set.printedTotal,
          total: set.total,
          ptcgoCode: set.ptcgoCode || null,
          releaseDate: set.releaseDate,
          updatedAt: set.updatedAt,
          symbol: set.images.symbol,
          logo: set.images.logo,
          legalities: JSON.stringify(set.legalities)
        }
      });
      
      if (result) {
        // Since upsert doesn't tell us directly if it was create or update,
        // we'll check if the record existed before
        const existing = await prisma.sets.findUnique({ where: { id: set.id } });
        if (existing) {
          updated++;
        } else {
          created++;
        }
      }
    } catch (error) {
      console.error(`❌ Error processing set ${set.id}:`, error);
      errors++;
    }
  }
  
  return { created, updated, errors };
}

async function populateCardsAndSetsFromGitHub(): Promise<void> {
  console.log('🚀 Starting card and set population from GitHub...');
  const startTime = Date.now();
  logMemoryStats('Start');
  
  try {
    // Download ZIP file
    const { buffer, etag, lastModified } = await downloadGitHubZip();
    
    // Check if data has changed
    const hasChanged = await checkIfDataChanged(etag, lastModified);
    if (!hasChanged) {
      console.log('✅ No changes detected. Exiting.');
      return;
    }
    
    // Process ZIP file
    const { cards, sets } = await processZipInMemory(buffer);
    
    if (cards.length === 0 && sets.length === 0) {
      console.log('⚠️  No cards or sets found in ZIP file.');
      return;
    }
    
    // Process sets first
    let setsResult = { created: 0, updated: 0, errors: 0 };
    if (sets.length > 0) {
      console.log(`🔄 Processing ${sets.length} sets...`);
      setsResult = await processSets(sets);
    }
    
    // Process cards in batches
    let cardsResult = { processed: 0, created: 0, updated: 0, errors: 0 };
    if (cards.length > 0) {
      console.log(`🔄 Processing ${cards.length} cards in batches of ${BATCH_SIZE}...`);
      cardsResult = await processCardBatch(cards);
    }
    
    // Save sync metadata
    await saveSyncMetadata(etag, lastModified);
    
    // Final statistics
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    console.log('\n=== POPULATION COMPLETE ===');
    console.log(`⏱️  Duration: ${duration} seconds`);
    console.log(`📊 Cards processed: ${cardsResult.processed}`);
    console.log(`🆕 Cards created: ${cardsResult.created}`);
    console.log(`🔄 Cards updated: ${cardsResult.updated}`);
    console.log(`❌ Card errors: ${cardsResult.errors}`);
    console.log(`📋 Sets created: ${setsResult.created}`);
    console.log(`🔄 Sets updated: ${setsResult.updated}`);
    console.log(`❌ Set errors: ${setsResult.errors}`);
    logMemoryStats('End');
    
  } catch (error: any) {
    console.error('❌ Error during card population:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script if called directly
if (require.main === module) {
  populateCardsAndSetsFromGitHub()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error: any) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

export { populateCardsAndSetsFromGitHub }; 