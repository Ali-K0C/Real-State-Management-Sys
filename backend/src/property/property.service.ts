import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

@Injectable()
export class PropertyService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    page = 1,
    limit = 8,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
    location?: string,
  ) {
    const skip = (page - 1) * limit;
    const where = location ? { location } : {};

    // Build orderBy clause

    const orderBy: any = {};
    if (sortBy === 'price' && sortOrder) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      orderBy.price = sortOrder;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      orderBy.createdAt = 'desc'; // Default sorting
    }

    const [properties, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        skip,
        take: limit,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        orderBy,
      }),
      this.prisma.property.count({ where }),
    ]);

    // Convert Decimal to number for price
    const formattedProperties = properties.map((property) => ({
      ...property,
      price: Number(property.price),
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      properties: formattedProperties,
      total,
      page,
      totalPages,
    };
  }

  async findOne(id: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            contactNo: true,
          },
        },
      },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    return {
      ...property,
      price: Number(property.price),
    };
  }

  async create(userId: string, createPropertyDto: CreatePropertyDto) {
    const property = await this.prisma.property.create({
      data: {
        ...createPropertyDto,
        userId,
      },
    });

    return {
      ...property,
      price: Number(property.price),
    };
  }

  async update(
    id: string,
    userId: string,
    updatePropertyDto: UpdatePropertyDto,
  ) {
    // Check if property exists and belongs to user
    const property = await this.prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (property.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this property',
      );
    }

    const updatedProperty = await this.prisma.property.update({
      where: { id },
      data: updatePropertyDto,
    });

    return {
      ...updatedProperty,
      price: Number(updatedProperty.price),
    };
  }

  async remove(id: string, userId: string) {
    // Check if property exists and belongs to user
    const property = await this.prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (property.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this property',
      );
    }

    await this.prisma.property.delete({
      where: { id },
    });

    return { message: 'Property deleted successfully' };
  }

  async findByUser(userId: string) {
    const properties = await this.prisma.property.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return properties.map((property) => ({
      ...property,
      price: Number(property.price),
    }));
  }

  async getStats(userId?: string) {
    const totalProperties = await this.prisma.property.count();

    let userListings = 0;
    if (userId) {
      userListings = await this.prisma.property.count({
        where: { userId, status: 'Available' },
      });
    }

    return {
      totalProperties,
      userListings,
    };
  }

  async getLocations() {
    const properties = await this.prisma.property.groupBy({
      by: ['location'],
      _count: {
        location: true,
      },
      orderBy: {
        _count: {
          location: 'desc',
        },
      },
    });

    return properties.map((item) => ({
      location: item.location,
      count: item._count.location,
    }));
  }
}
