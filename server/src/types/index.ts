// Shared type definitions

export interface User {
  id: string;
  displayName: string;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}

// Prisma types (matching actual database structure)
export type PrismaUser = {
  id: string;
  displayname: string | null;
  email: string | null;
}

// Extend Express User interface
declare global {
  namespace Express {
    interface User {
      id: string;
      displayName: string;
      email: string;
    }
  }
} 