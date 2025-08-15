import { PrismaClient, UserProfile, Prisma } from '@prisma/client';
import { UserProfileRepository as IUserProfileRepository, BrokerStatus, QueryOptions } from '../../interfaces';

export class UserProfileRepository implements IUserProfileRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(options?: QueryOptions): Promise<UserProfile[]> {
    const query: Prisma.UserProfileFindManyArgs = {
      where: options?.where,
      take: options?.limit,
      skip: options?.offset,
      orderBy: options?.orderBy ? {
        [options.orderBy.field]: options.orderBy.direction
      } : { createdAt: 'desc' },
      include: {
        user: true,
      },
    };

    return this.prisma.userProfile.findMany(query);
  }

  async findById(id: string): Promise<UserProfile | null> {
    return this.prisma.userProfile.findUnique({
      where: { id },
      include: {
        user: true,
        notes: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async findOne(filter: Partial<UserProfile>): Promise<UserProfile | null> {
    return this.prisma.userProfile.findFirst({
      where: filter as Prisma.UserProfileWhereInput,
    });
  }

  async create(data: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserProfile> {
    return this.prisma.userProfile.create({
      data: data as Prisma.UserProfileCreateInput,
    });
  }

  async update(id: string, data: Partial<UserProfile>): Promise<UserProfile> {
    return this.prisma.userProfile.update({
      where: { id },
      data: data as Prisma.UserProfileUpdateInput,
    });
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.userProfile.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async count(filter?: Partial<UserProfile>): Promise<number> {
    return this.prisma.userProfile.count({
      where: filter as Prisma.UserProfileWhereInput,
    });
  }

  async findByUserId(userId: string): Promise<UserProfile | null> {
    return this.prisma.userProfile.findUnique({
      where: { userId },
      include: {
        user: true,
        notes: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });
  }

  async findBrokers(): Promise<UserProfile[]> {
    return this.prisma.userProfile.findMany({
      where: {
        isBroker: true,
        brokerStatus: 'approved',
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
      },
    });
  }

  async updateBrokerStatus(id: string, status: BrokerStatus): Promise<UserProfile> {
    const updateData: Prisma.UserProfileUpdateInput = {
      brokerStatus: status,
    };

    // If approved, set broker flag
    if (status === 'approved') {
      updateData.isBroker = true;
    } else if (status === 'rejected' || status === 'suspended') {
      updateData.isBroker = false;
    }

    return this.prisma.userProfile.update({
      where: { id },
      data: updateData,
    });
  }
}