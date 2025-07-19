import { PrismaClient } from '../../generated/prisma';

export class TagService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  // Ensure default tags exist for a user
  async ensureDefaultTags(userId: string) {
    const defaultTags = [
      { name: 'favorite', color: '#EF4444' },
      { name: 'wishlist', color: '#10B981' }
    ];

    for (const tag of defaultTags) {
      await this.prisma.tags.upsert({
        where: {
          name_userid: {
            name: tag.name,
            userid: userId
          }
        },
        update: {},
        create: {
          name: tag.name,
          userid: userId,
          color: tag.color
        }
      });
    }
  }

  // Get a specific tag by name for a user
  async getTagByName(userId: string, tagName: string) {
    return await this.prisma.tags.findUnique({
      where: {
        name_userid: {
          name: tagName,
          userid: userId
        }
      }
    });
  }

  // Add a tag to a card
  async addTagToCard(userId: string, cardId: string, tagName: string) {
    // Ensure the tag exists
    await this.ensureDefaultTags(userId);
    
    // Get the tag
    const tag = await this.getTagByName(userId, tagName);
    if (!tag) {
      throw new Error(`Tag '${tagName}' not found`);
    }

    // Check if the card exists in the cards table (not collection)
    const card = await this.prisma.cards.findUnique({
      where: {
        id: cardId
      }
    });

    if (!card) {
      throw new Error('Card not found in database');
    }

    // Add the tag to the card (upsert to avoid duplicates)
    return await this.prisma.card_tags.upsert({
      where: {
        card_id_userid_tag_id: {
          card_id: cardId,
          userid: userId,
          tag_id: tag.id
        }
      },
      update: {},
      create: {
        card_id: cardId,
        userid: userId,
        tag_id: tag.id
      }
    });
  }

  // Remove a tag from a card
  async removeTagFromCard(userId: string, cardId: string, tagName: string) {
    const tag = await this.getTagByName(userId, tagName);
    if (!tag) {
      throw new Error(`Tag '${tagName}' not found`);
    }

    return await this.prisma.card_tags.deleteMany({
      where: {
        card_id: cardId,
        userid: userId,
        tag_id: tag.id
      }
    });
  }

  // Check if a card has a specific tag
  async cardHasTag(userId: string, cardId: string, tagName: string): Promise<boolean> {
    const tag = await this.getTagByName(userId, tagName);
    if (!tag) {
      return false;
    }

    const cardTag = await this.prisma.card_tags.findUnique({
      where: {
        card_id_userid_tag_id: {
          card_id: cardId,
          userid: userId,
          tag_id: tag.id
        }
      }
    });

    return !!cardTag;
  }

  // Get all tags for a card
  async getCardTags(userId: string, cardId: string) {
    return await this.prisma.card_tags.findMany({
      where: {
        card_id: cardId,
        userid: userId
      },
      include: {
        tag: true
      }
    });
  }
} 