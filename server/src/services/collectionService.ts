import { PrismaClient } from '../../generated/prisma';
import { User } from '../types';
import { TagService } from './tagService';

export class CollectionService {
  private prisma: PrismaClient;
  private tagService: TagService;

  constructor() {
    this.prisma = new PrismaClient();
    this.tagService = new TagService();
  }

  async getUserCollection(userId: string) {
    const userCollection = await this.prisma.user_collection.findMany({
      where: { userid: userId },
      include: {
        card: true
      }
    });
    
    const cardsWithTags = await Promise.all(
      userCollection.map(async (userCard) => {
        const card = userCard.card;
        const cardData = JSON.parse(card.data || '{}');
        const [isFavorited, isWishlisted] = await Promise.all([
          this.tagService.cardHasTag(userId, card.id, 'favorite'),
          this.tagService.cardHasTag(userId, card.id, 'wishlist')
        ]);
        
        return {
          id: card.id,
          name: card.name,
          set: { 
            id: cardData.set?.id || card.setname,
            name: cardData.set?.name || card.setname 
          },
          images: { small: card.image },
          favorited: isFavorited,
          wishlisted: isWishlisted,
          quantity: userCard.quantity,
          ...cardData
        };
      })
    );
    
    return cardsWithTags;
  }

  async addCardToCollection(userId: string, card: any) {
    // First, ensure the card exists in the cards table
    await this.prisma.cards.upsert({
      where: { id: card.id },
      update: {
        name: card.name,
        setname: card.set?.name || '',
        image: card.images?.small || '',
        data: JSON.stringify(card)
      },
      create: {
        id: card.id,
        name: card.name,
        setname: card.set?.name || '',
        image: card.images?.small || '',
        data: JSON.stringify(card)
      }
    });

    // Then add to user's collection
    return await this.prisma.user_collection.upsert({
      where: {
        userid_cardid: {
          userid: userId,
          cardid: card.id
        }
      },
      update: {
        quantity: {
          increment: 1
        }
      },
      create: {
        userid: userId,
        cardid: card.id,
        quantity: 1
      }
    });
  }

  async removeCardFromCollection(userId: string, cardId: string) {
    return await this.prisma.user_collection.deleteMany({
      where: {
        cardid: cardId,
        userid: userId
      }
    });
  }
} 