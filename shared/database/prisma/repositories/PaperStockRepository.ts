import { PrismaClient, PaperStock, Prisma } from '@prisma/client';
import { PaperStockRepository as IPaperStockRepository, QueryOptions } from '../../interfaces';

export class PaperStockRepository implements IPaperStockRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(options?: QueryOptions): Promise<PaperStock[]> {
    const query: Prisma.PaperStockFindManyArgs = {
      where: options?.where,
      take: options?.limit,
      skip: options?.offset,
      orderBy: options?.orderBy ? {
        [options.orderBy.field]: options.orderBy.direction
      } : { sortOrder: 'asc' },
    };

    return this.prisma.paperStock.findMany(query);
  }

  async findById(id: string): Promise<PaperStock | null> {
    return this.prisma.paperStock.findUnique({
      where: { id },
    });
  }

  async findOne(filter: Partial<PaperStock>): Promise<PaperStock | null> {
    return this.prisma.paperStock.findFirst({
      where: filter as Prisma.PaperStockWhereInput,
    });
  }

  async create(data: Omit<PaperStock, 'id' | 'createdAt' | 'updatedAt'>): Promise<PaperStock> {
    return this.prisma.paperStock.create({
      data: data as Prisma.PaperStockCreateInput,
    });
  }

  async update(id: string, data: Partial<PaperStock>): Promise<PaperStock> {
    return this.prisma.paperStock.update({
      where: { id },
      data: data as Prisma.PaperStockUpdateInput,
    });
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.paperStock.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async count(filter?: Partial<PaperStock>): Promise<number> {
    return this.prisma.paperStock.count({
      where: filter as Prisma.PaperStockWhereInput,
    });
  }

  async findActive(): Promise<PaperStock[]> {
    return this.prisma.paperStock.findMany({
      where: { isActive: true },
      orderBy: [
        { category: 'asc' },
        { sortOrder: 'asc' },
        { name: 'asc' },
      ],
    });
  }

  async findByCategory(category: string): Promise<PaperStock[]> {
    return this.prisma.paperStock.findMany({
      where: {
        category,
        isActive: true,
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' },
      ],
    });
  }
}