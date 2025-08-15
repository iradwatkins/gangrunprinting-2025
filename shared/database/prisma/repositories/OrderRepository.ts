import { PrismaClient, Order, Prisma } from '@prisma/client';
import { OrderRepository as IOrderRepository, OrderWithJobs, QueryOptions } from '../../interfaces';

export class OrderRepository implements IOrderRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(options?: QueryOptions): Promise<Order[]> {
    const query: Prisma.OrderFindManyArgs = {
      where: options?.where,
      take: options?.limit,
      skip: options?.offset,
      orderBy: options?.orderBy ? {
        [options.orderBy.field]: options.orderBy.direction
      } : { createdAt: 'desc' },
      include: {
        user: true,
        jobs: true,
      },
    };

    return this.prisma.order.findMany(query);
  }

  async findById(id: string): Promise<Order | null> {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        jobs: {
          include: {
            product: true,
            paperStock: true,
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async findOne(filter: Partial<Order>): Promise<Order | null> {
    return this.prisma.order.findFirst({
      where: filter as Prisma.OrderWhereInput,
    });
  }

  async create(data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    // Generate reference number
    const referenceNumber = await this.generateReferenceNumber();
    
    return this.prisma.order.create({
      data: {
        ...data,
        referenceNumber,
      } as Prisma.OrderCreateInput,
    });
  }

  async update(id: string, data: Partial<Order>): Promise<Order> {
    return this.prisma.order.update({
      where: { id },
      data: data as Prisma.OrderUpdateInput,
    });
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.order.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async count(filter?: Partial<Order>): Promise<number> {
    return this.prisma.order.count({
      where: filter as Prisma.OrderWhereInput,
    });
  }

  async findByUser(userId: string): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        jobs: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
  }

  async findByStatus(status: string): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        jobs: true,
      },
    });
  }

  async findWithJobs(id: string): Promise<OrderWithJobs | null> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        jobs: {
          include: {
            product: true,
            paperStock: true,
            artwork: true,
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return order as OrderWithJobs;
  }

  async updateStatus(id: string, status: string): Promise<Order> {
    // Update order status
    const order = await this.prisma.order.update({
      where: { id },
      data: { status },
    });

    // Add to status history
    await this.prisma.orderStatus.create({
      data: {
        orderId: id,
        status,
      },
    });

    return order;
  }

  private async generateReferenceNumber(): Promise<string> {
    const prefix = 'GRP';
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    // Get count of orders this month
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const count = await this.prisma.order.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
      },
    });
    
    const orderNumber = (count + 1).toString().padStart(4, '0');
    return `${prefix}${year}${month}${orderNumber}`;
  }
}