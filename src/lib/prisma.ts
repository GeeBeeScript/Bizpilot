import "server-only";
import { PrismaClient } from '../app/generated/prisma/client'; // adjust import to your generated client path
import { PrismaPg } from '@prisma/adapter-pg'; // example adapter, use your chosen driver adapter

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrismaClient = () => {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });

  return new PrismaClient({
    adapter,
  });
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
