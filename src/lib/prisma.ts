import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const url = process.env.DATABASE_URL?.includes('?') 
  ? `${process.env.DATABASE_URL}&connect_timeout=30&pool_timeout=30`
  : `${process.env.DATABASE_URL}?connect_timeout=30&pool_timeout=30`;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: url
      }
    }
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
