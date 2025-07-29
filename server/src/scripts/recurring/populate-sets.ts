import { PrismaClient } from '../../../generated/prisma';
import axios from 'axios';

const prisma = new PrismaClient();

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

async function populateSets() {
  try {
    console.log('Fetching sets data from GitHub...');
    
    // Fetch sets data from GitHub
    const response = await axios.get<GitHubSet[]>(
      'https://raw.githubusercontent.com/PokemonTCG/pokemon-tcg-data/refs/heads/master/sets/en.json'
    );
    
    const sets = response.data;
    console.log(`Found ${sets.length} sets to import`);
    
    // Clear existing sets data
    console.log('Clearing existing sets data...');
    await prisma.sets.deleteMany({});
    
    // Insert all sets
    console.log('Inserting sets into database...');
    const insertPromises = sets.map(async (set) => {
      try {
        await prisma.sets.create({
          data: {
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
        return { success: true, id: set.id };
      } catch (error) {
        console.error(`Error inserting set ${set.id}:`, error);
        return { success: false, id: set.id, error };
      }
    });
    
    const results = await Promise.all(insertPromises);
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`✅ Successfully imported ${successful} sets`);
    if (failed > 0) {
      console.log(`❌ Failed to import ${failed} sets`);
      results.filter(r => !r.success).forEach(r => {
        console.log(`  - ${r.id}: ${r.error}`);
      });
    }
    
    // Verify the import
    const totalSets = await prisma.sets.count();
    console.log(`📊 Total sets in database: ${totalSets}`);
    
    // Show some sample sets
    const sampleSets = await prisma.sets.findMany({
      take: 5,
      orderBy: { releaseDate: 'desc' }
    });
    
    console.log('\n📋 Sample sets (newest first):');
    sampleSets.forEach((set: any) => {
      console.log(`  - ${set.name} (${set.id}): ${set.releaseDate} - ${set.total} cards`);
    });
    
  } catch (error) {
    console.error('Error populating sets:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (typeof require !== 'undefined' && require.main === module) {
  populateSets()
    .then(() => {
      console.log('✅ Sets population completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Sets population failed:', error);
      process.exit(1);
    });
}

export { populateSets }; 