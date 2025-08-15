import { PrismaClient, Category, Prisma } from '@prisma/client';
import { CategoryRepository as ICategoryRepository, CategoryWithProducts, QueryOptions } from '../../interfaces';

export class CategoryRepository implements ICategoryRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(options?: QueryOptions): Promise<Category[]> {
    const query: Prisma.CategoryFindManyArgs = {
      where: options?.where,
      take: options?.limit,
      skip: options?.offset,
      orderBy: options?.orderBy ? {
        [options.orderBy.field]: options.orderBy.direction
      } : { sortOrder: 'asc' },
    };

    return this.prisma.category.findMany(query);
  }

  async findById(id: string): Promise<Category | null> {
    return this.prisma.category.findUnique({
      where: { id },
      include: {
        parentCategory: true,
        subCategories: true,
        products: true,
      },
    });
  }

  async findOne(filter: Partial<Category>): Promise<Category | null> {
    return this.prisma.category.findFirst({
      where: filter as Prisma.CategoryWhereInput,
    });
  }

  async create(data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    return this.prisma.category.create({
      data: data as Prisma.CategoryCreateInput,
    });
  }

  async update(id: string, data: Partial<Category>): Promise<Category> {
    return this.prisma.category.update({
      where: { id },
      data: data as Prisma.CategoryUpdateInput,
    });
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.category.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async count(filter?: Partial<Category>): Promise<number> {
    return this.prisma.category.count({
      where: filter as Prisma.CategoryWhereInput,
    });
  }

  async findBySlug(slug: string): Promise<Category | null> {
    return this.prisma.category.findUnique({
      where: { slug },
      include: {
        parentCategory: true,
        subCategories: true,
      },
    });
  }

  async findWithProducts(id: string): Promise<CategoryWithProducts | null> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        products: {
          where: { isActive: true },
          include: {
            vendor: true,
          },
        },
      },
    });

    return category as CategoryWithProducts;
  }

  async findParentCategories(): Promise<Category[]> {
    return this.prisma.category.findMany({
      where: {
        parentCategoryId: null,
        isActive: true,
      },
      orderBy: { sortOrder: 'asc' },
      include: {
        subCategories: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  }
}