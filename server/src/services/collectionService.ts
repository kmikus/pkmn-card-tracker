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
    const cards = await this.prisma.collection.findMany({
      where: { userid: userId }
    });
    
    const cardsWithTags = await Promise.all(
      cards.map(async (card) => {
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
          ...cardData
        };
      })
    );
    
    return cardsWithTags;
  }

  async addCardToCollection(userId: string, card: any) {
    return await this.prisma.collection.upsert({
      where: {
        id_userid: {
          id: card.id,
          userid: userId
        }
      },
      update: {
        name: card.name,
        setname: card.set?.name || '',
        image: card.images?.small || '',
        data: JSON.stringify(card)
      },
      create: {
        id: card.id,
        userid: userId,
        name: card.name,
        setname: card.set?.name || '',
        image: card.images?.small || '',
        data: JSON.stringify(card)
      }
    });
  }

  async removeCardFromCollection(userId: string, cardId: string) {
    return await this.prisma.collection.deleteMany({
      where: {
        id: cardId,
        userid: userId
      }
    });
  }
} 