import { PrismaClient, Product, Prisma } from '@prisma/client';
import { ProductRepository as IProductRepository, QueryOptions } from '../../interfaces';

export class ProductRepository implements IProductRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(options?: QueryOptions): Promise<Product[]> {
    const query: Prisma.ProductFindManyArgs = {
      where: options?.where,
      take: options?.limit,
      skip: options?.offset,
      orderBy: options?.orderBy ? {
        [options.orderBy.field]: options.orderBy.direction
      } : undefined,
      include: this.buildInclude(options?.include),
    };

    return this.prisma.product.findMany(query);
  }

  async findById(id: string): Promise<Product | null> {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        vendor: true,
        quantities: {
          include: {
            quantity: {
              include: {
                quantityGroup: true,
              },
            },
          },
        },
        coatings: {
          include: {
            coating: true,
          },
        },
        printSizes: {
          include: {
            printSize: true,
          },
        },
        turnaroundTimes: {
          include: {
            turnaroundTime: true,
          },
        },
        addOns: {
          include: {
            addOn: true,
          },
        },
        paperStocks: {
          include: {
            paperStock: true,
          },
        },
        sides: {
          include: {
            side: true,
          },
        },
      },
    });
  }

  async findOne(filter: Partial<Product>): Promise<Product | null> {
    return this.prisma.product.findFirst({
      where: filter as Prisma.ProductWhereInput,
    });
  }

  async create(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    return this.prisma.product.create({
      data: data as Prisma.ProductCreateInput,
    });
  }

  async update(id: string, data: Partial<Product>): Promise<Product> {
    return this.prisma.product.update({
      where: { id },
      data: data as Prisma.ProductUpdateInput,
    });
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.product.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async count(filter?: Partial<Product>): Promise<number> {
    return this.prisma.product.count({
      where: filter as Prisma.ProductWhereInput,
    });
  }

  async findByCategory(categoryId: string): Promise<Product[]> {
    return this.prisma.product.findMany({
      where: { categoryId },
      include: {
        category: true,
      },
    });
  }

  async findBySlug(slug: string): Promise<Product | null> {
    return this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        vendor: true,
        quantities: {
          include: {
            quantity: {
              include: {
                quantityGroup: true,
              },
            },
          },
        },
        coatings: {
          include: {
            coating: true,
          },
        },
        printSizes: {
          include: {
            printSize: true,
          },
        },
        turnaroundTimes: {
          include: {
            turnaroundTime: true,
          },
        },
        addOns: {
          include: {
            addOn: true,
          },
        },
        paperStocks: {
          include: {
            paperStock: true,
          },
        },
        sides: {
          include: {
            side: true,
          },
        },
      },
    });
  }

  async findFeatured(): Promise<Product[]> {
    return this.prisma.product.findMany({
      where: { isActive: true },
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
      },
    });
  }

  async searchProducts(query: string): Promise<Product[]> {
    return this.prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
        isActive: true,
      },
      include: {
        category: true,
      },
    });
  }

  private buildInclude(include?: string[]): any {
    if (!include || include.length === 0) {
      return undefined;
    }

    const includeObj: any = {};
    for (const field of include) {
      includeObj[field] = true;
    }
    return includeObj;
  }
}