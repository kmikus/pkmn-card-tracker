import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

async function populateCardFields() {
  console.log('🔄 Starting to populate card fields...');
  
  try {
    // Get all cards that need to be updated
    const cards = await prisma.cards.findMany({
      where: {
        OR: [
          { setId: null },
          { cardNumber: null },
          { cardNumberInt: null }
        ]
      },
      select: {
        id: true,
        data: true
      }
    });

    console.log(`📊 Found ${cards.length} cards to update`);

    let updatedCount = 0;
    let errorCount = 0;

    for (const card of cards) {
      try {
        if (!card.data) {
          console.warn(`⚠️  Card ${card.id} has no data field`);
          continue;
        }

        const cardData = JSON.parse(card.data);
        
        // Extract setId from data::json->'set'->>'id'
        const setId = cardData.set?.id || null;
        
        // Extract cardNumber from data::json->>'number'
        const cardNumber = cardData.number || null;
        
        // Extract cardNumberInt - try to parse as integer, null if not numeric
        let cardNumberInt: number | null = null;
        if (cardNumber && /^[0-9]+$/.test(cardNumber)) {
          cardNumberInt = parseInt(cardNumber, 10);
        }

        // Update the card with extracted fields
        await prisma.cards.update({
          where: { id: card.id },
          data: {
            setId,
            cardNumber,
            cardNumberInt
          }
        });

        updatedCount++;
        
        if (updatedCount % 100 === 0) {
          console.log(`✅ Updated ${updatedCount} cards...`);
        }

      } catch (error) {
        console.error(`❌ Error updating card ${card.id}:`, error);
        errorCount++;
      }
    }

    console.log(`\n🎉 Population completed!`);
    console.log(`✅ Successfully updated: ${updatedCount} cards`);
    console.log(`❌ Errors: ${errorCount} cards`);

    // Verify the population
    const totalCards = await prisma.cards.count();
    const populatedCards = await prisma.cards.count({
      where: {
        setId: { not: null },
        cardNumber: { not: null }
      }
    });

    console.log(`\n📈 Population Statistics:`);
    console.log(`   Total cards: ${totalCards}`);
    console.log(`   Cards with setId: ${populatedCards}`);
    console.log(`   Population rate: ${((populatedCards / totalCards) * 100).toFixed(1)}%`);

  } catch (error) {
    console.error('❌ Population failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (typeof require !== 'undefined' && require.main === module) {
  populateCardFields()
    .then(() => {
      console.log('✅ Card fields population completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Card fields population failed:', error);
      process.exit(1);
    });
}

export { populateCardFields }; 