import { PrismaClient } from '@prisma/client';
import { ProductRepository } from './ProductRepository';
import { CategoryRepository } from './CategoryRepository';
import { OrderRepository } from './OrderRepository';
import { UserProfileRepository } from './UserProfileRepository';
import { PaperStockRepository } from './PaperStockRepository';
import { AddOnsRepository } from './AddOnsRepository';

// Create singleton PrismaClient instance
let prismaClientSingleton: PrismaClient | undefined;

export function getPrismaClient(): PrismaClient {
  if (!prismaClientSingleton) {
    prismaClientSingleton = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
  }
  return prismaClientSingleton;
}

// Repository factory functions
export function getProductRepository(): ProductRepository {
  return new ProductRepository(getPrismaClient());
}

export function getCategoryRepository(): CategoryRepository {
  return new CategoryRepository(getPrismaClient());
}

export function getOrderRepository(): OrderRepository {
  return new OrderRepository(getPrismaClient());
}

export function getUserProfileRepository(): UserProfileRepository {
  return new UserProfileRepository(getPrismaClient());
}

export function getPaperStockRepository(): PaperStockRepository {
  return new PaperStockRepository(getPrismaClient());
}

export function getAddOnsRepository(): AddOnsRepository {
  return new AddOnsRepository(getPrismaClient());
}

// Export repository classes
export { ProductRepository } from './ProductRepository';
export { CategoryRepository } from './CategoryRepository';
export { OrderRepository } from './OrderRepository';
export { UserProfileRepository } from './UserProfileRepository';
export { PaperStockRepository } from './PaperStockRepository';
export { AddOnsRepository } from './AddOnsRepository';

// Export types
export * from '../../interfaces';