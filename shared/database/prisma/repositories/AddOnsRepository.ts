import { PrismaClient, AddOn, Prisma } from '@prisma/client';
import { AddOnsRepository as IAddOnsRepository, QueryOptions } from '../../interfaces';

export class AddOnsRepository implements IAddOnsRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(options?: QueryOptions): Promise<AddOn[]> {
    const query: Prisma.AddOnFindManyArgs = {
      where: options?.where,
      take: options?.limit,
      skip: options?.offset,
      orderBy: options?.orderBy ? {
        [options.orderBy.field]: options.orderBy.direction
      } : { sortOrder: 'asc' },
    };

    return this.prisma.addOn.findMany(query);
  }

  async findById(id: string): Promise<AddOn | null> {
    return this.prisma.addOn.findUnique({
      where: { id },
    });
  }

  async findOne(filter: Partial<AddOn>): Promise<AddOn | null> {
    return this.prisma.addOn.findFirst({
      where: filter as Prisma.AddOnWhereInput,
    });
  }

  async create(data: Omit<AddOn, 'id' | 'createdAt' | 'updatedAt'>): Promise<AddOn> {
    return this.prisma.addOn.create({
      data: data as Prisma.AddOnCreateInput,
    });
  }

  async update(id: string, data: Partial<AddOn>): Promise<AddOn> {
    return this.prisma.addOn.update({
      where: { id },
      data: data as Prisma.AddOnUpdateInput,
    });
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.addOn.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async count(filter?: Partial<AddOn>): Promise<number> {
    return this.prisma.addOn.count({
      where: filter as Prisma.AddOnWhereInput,
    });
  }

  async findActive(): Promise<AddOn[]> {
    return this.prisma.addOn.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findByPricingModel(model: string): Promise<AddOn[]> {
    return this.prisma.addOn.findMany({
      where: {
        pricingModel: model,
        isActive: true,
      },
      orderBy: { sortOrder: 'asc' },
    });
  }
}