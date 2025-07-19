import { PrismaClient } from '../../generated/prisma';
import axios from 'axios';

const TCG_API_URL = 'https://api.pokemontcg.io/v2';
const prisma = new PrismaClient();

interface TCGCard {
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
  [key: string]: any; // Allow additional properties
}

interface TCGSet {
  id: string;
  name: string;
  series: string;
  printedTotal: number;
  total: number;
  ptcgoCode?: string;
  releaseDate: string;
  updatedAt: string;
  images: {
    symbol: string;
    logo: string;
  };
}

interface TCGResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  count: number;
  totalCount: number;
}

// Retry configuration
const RETRY_DELAYS = [5000, 10000, 15000]; // 5s, 10s, 15s
const MAX_ERRORS = 10;

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function makeRequestWithRetry<T>(url: string, description: string): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
    try {
      const response = await axios.get<T>(url);
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

async function getAllSets(): Promise<TCGSet[]> {
  console.log('Fetching all sets from TCG API...');
  
  try {
    const response = await makeRequestWithRetry<TCGResponse<TCGSet>>(
      `${TCG_API_URL}/sets`,
      'fetching sets'
    );
    
    console.log(`Found ${response.data.length} sets`);
    console.log('Sample sets:');
    response.data.slice(0, 5).forEach(set => {
      console.log(`  - ${set.name} (${set.id}) - ${set.total} cards`);
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Error fetching sets:', error.message);
    throw error;
  }
}

async function getCardsForSet(setId: string, setName: string): Promise<TCGCard[]> {
  const allCards: TCGCard[] = [];
  let page = 1;
  const pageSize = 250;
  
  while (true) {
    try {
      const url = `${TCG_API_URL}/cards?q=set.id:${setId}&page=${page}&pageSize=${pageSize}`;
      const response = await makeRequestWithRetry<TCGResponse<TCGCard>>(
        url,
        `fetching cards for set ${setName} (page ${page})`
      );
      
      if (response.data.length === 0) {
        break;
      }
      
      allCards.push(...response.data);
      page++;
      
      // Add a small delay between requests to be respectful to the API
      await delay(100);
      
    } catch (error: any) {
      console.error(`    Error fetching cards for set ${setName}:`, error.message);
      throw error;
    }
  }
  
  return allCards;
}

async function populateCards() {
  console.log('Starting card population from TCG API...');
  
  let totalCardsProcessed = 0;
  let totalCardsCreated = 0;
  let totalCardsSkipped = 0;
  let errorCount = 0;
  let setsProcessed = 0;
  
  try {
    const sets = await getAllSets();
    
    for (const set of sets) {
      setsProcessed++;
      console.log(`[${setsProcessed}/${sets.length}] Processing set: ${set.name}`);
      console.log(`  Set ID: ${set.id}`);
      console.log(`  Expected cards: ${set.total}`);
      console.log(`  Printed total: ${set.printedTotal}`);
      
      try {
        console.log(`  Fetching cards for set: ${set.name} (${set.id})`);
        const cards = await getCardsForSet(set.id, set.name);
        
        if (cards.length === 0) {
          console.log(`  ⚠️  No cards found for set: ${set.name}`);
          continue;
        }
        
        console.log(`  Found ${cards.length} cards for set: ${set.name}`);
        
        let setCardsCreated = 0;
        let setCardsSkipped = 0;
        
        for (const card of cards) {
          try {
            // Check if card already exists
            const existingCard = await prisma.cards.findUnique({
              where: { id: card.id }
            });
            
            if (existingCard) {
              setCardsSkipped++;
              totalCardsSkipped++;
            } else {
              // Create new card
              await prisma.cards.create({
                data: {
                  id: card.id,
                  name: card.name,
                  setname: card.set.name,
                  image: card.images.small,
                  data: JSON.stringify(card),
                  created_at: new Date()
                }
              });
              
              setCardsCreated++;
              totalCardsCreated++;
            }
            
            totalCardsProcessed++;
            
          } catch (error: any) {
            console.error(`    Error processing card ${card.id}:`, error.message);
            errorCount++;
            
            if (errorCount >= MAX_ERRORS) {
              console.error(`❌ Too many errors (${errorCount}). Terminating script.`);
              return;
            }
          }
        }
        
        console.log(`  ✅ Set complete: ${setCardsCreated} created, ${setCardsSkipped} skipped`);
        
      } catch (error: any) {
        console.error(`  ❌ Error processing set ${set.name}:`, error.message);
        errorCount++;
        
        if (errorCount >= MAX_ERRORS) {
          console.error(`❌ Too many errors (${errorCount}). Terminating script.`);
          return;
        }
      }
    }
    
    console.log('\n=== POPULATION COMPLETE ===');
    console.log(`Sets processed: ${setsProcessed}/${sets.length}`);
    console.log(`Sets with errors: ${errorCount}`);
    console.log(`Total cards processed: ${totalCardsProcessed}`);
    console.log(`Total cards created: ${totalCardsCreated}`);
    console.log(`Total cards skipped (already existed): ${totalCardsSkipped}`);
    
  } catch (error: any) {
    console.error('Error during card population:', error);
  } finally {
    await prisma.$disconnect();
  }
}

populateCards().catch(console.error); 