import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePropertyDto, ListingType } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

@Injectable()
export class PropertyService {
  constructor(private prisma: PrismaService) {}

  private async validatePropertyOwnership(id: string, userId: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (property.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to modify this property',
      );
    }

    return property;
  }

  async findAll(
    page = 1,
    limit = 8,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
    location?: string,
    bedrooms?: number,
    bathrooms?: number,
    minArea?: number,
    maxArea?: number,
    listingType?: 'FOR_SALE' | 'FOR_RENT',
  ) {
    // Validate pagination parameters
    if (page < 1) page = 1;
    if (limit < 1) limit = 8;
    if (limit > 100) limit = 100; // Max limit to prevent abuse

    const skip = (page - 1) * limit;

    // Build where clause with all filters

    const where: any = {};

    if (location) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      where.location = location;
    }

    if (bedrooms !== undefined && bedrooms !== null) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      where.bedrooms = { gte: bedrooms }; // Greater than or equal to (e.g., "3+ bedrooms")
    }

    if (bathrooms !== undefined && bathrooms !== null) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      where.bathrooms = { gte: bathrooms }; // Greater than or equal to (e.g., "2+ bathrooms")
    }

    // Build areaSqft filter - initialize if either min or max is provided
    if (
      (minArea !== undefined && minArea !== null) ||
      (maxArea !== undefined && maxArea !== null)
    ) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      where.areaSqft = {};
      if (minArea !== undefined && minArea !== null) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        where.areaSqft.gte = minArea;
      }
      if (maxArea !== undefined && maxArea !== null) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        where.areaSqft.lte = maxArea;
      }
    }

    if (listingType) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      where.listingType = listingType;
    }

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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        where,
        skip,
        take: limit,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        orderBy,
      }),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      this.prisma.property.count({ where }),
    ]);

    // Convert Decimal to number for price and rental fields
    const formattedProperties = properties.map((property) => ({
      ...property,
      price: Number(property.price),
      monthlyRent: property.monthlyRent ? Number(property.monthlyRent) : null,
      securityDeposit: property.securityDeposit
        ? Number(property.securityDeposit)
        : null,
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      data: formattedProperties,
      total,
      page,
      limit,
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
      monthlyRent: property.monthlyRent ? Number(property.monthlyRent) : null,
      securityDeposit: property.securityDeposit
        ? Number(property.securityDeposit)
        : null,
    };
  }

  async create(userId: string, createPropertyDto: CreatePropertyDto) {
    // Validate rental fields for FOR_RENT listings
    if (createPropertyDto.listingType === ListingType.FOR_RENT) {
      if (
        createPropertyDto.monthlyRent == null ||
        createPropertyDto.securityDeposit == null
      ) {
        throw new BadRequestException(
          'monthlyRent and securityDeposit are required for FOR_RENT listings',
        );
      }
    }

    // Build data object, only including rental fields for FOR_RENT listings
    const data: any = {
      title: createPropertyDto.title,
      description: createPropertyDto.description,
      price: createPropertyDto.price,
      location: createPropertyDto.location,
      address: createPropertyDto.address,
      propertyType: createPropertyDto.propertyType,
      bedrooms: createPropertyDto.bedrooms,
      bathrooms: createPropertyDto.bathrooms,
      areaSqft: createPropertyDto.areaSqft,
      status: createPropertyDto.status,
      listingType: createPropertyDto.listingType || ListingType.FOR_SALE,
      userId,
    };

    // Only add rental fields for FOR_RENT listings
    if (createPropertyDto.listingType === ListingType.FOR_RENT) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      data.monthlyRent = createPropertyDto.monthlyRent;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      data.securityDeposit = createPropertyDto.securityDeposit;
      if (createPropertyDto.availableFrom) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        data.availableFrom = new Date(createPropertyDto.availableFrom);
      }
    }

    const property = await this.prisma.property.create({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data,
    });

    return {
      ...property,
      price: Number(property.price),
      monthlyRent: property.monthlyRent ? Number(property.monthlyRent) : null,
      securityDeposit: property.securityDeposit
        ? Number(property.securityDeposit)
        : null,
    };
  }

  async update(
    id: string,
    userId: string,
    updatePropertyDto: UpdatePropertyDto,
  ) {
    // Validate ownership
    await this.validatePropertyOwnership(id, userId);

    const updatedProperty = await this.prisma.property.update({
      where: { id },
      data: updatePropertyDto,
    });

    return {
      ...updatedProperty,
      price: Number(updatedProperty.price),
      monthlyRent: updatedProperty.monthlyRent
        ? Number(updatedProperty.monthlyRent)
        : null,
      securityDeposit: updatedProperty.securityDeposit
        ? Number(updatedProperty.securityDeposit)
        : null,
    };
  }

  async remove(id: string, userId: string) {
    // Validate ownership
    await this.validatePropertyOwnership(id, userId);

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
      monthlyRent: property.monthlyRent ? Number(property.monthlyRent) : null,
      securityDeposit: property.securityDeposit
        ? Number(property.securityDeposit)
        : null,
    }));
  }

  async getStats(userId?: string) {
    const totalProperties = await this.prisma.property.count();

    let myActiveListings = 0;
    if (userId) {
      myActiveListings = await this.prisma.property.count({
        where: { userId, status: 'Available' },
      });
    }

    return {
      totalProperties,
      myActiveListings,
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

    return properties.map((item) => item.location);
  }

  async buyProperty(id: string, buyerId: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (property.userId === buyerId) {
      throw new ForbiddenException('You cannot buy your own property');
    }

    if (property.status === 'Sold') {
      throw new ForbiddenException('Property is already sold');
    }

    const updatedProperty = await this.prisma.property.update({
      where: { id },
      data: { status: 'Sold' },
    });

    return {
      ...updatedProperty,
      price: Number(updatedProperty.price),
      monthlyRent: updatedProperty.monthlyRent
        ? Number(updatedProperty.monthlyRent)
        : null,
      securityDeposit: updatedProperty.securityDeposit
        ? Number(updatedProperty.securityDeposit)
        : null,
    };
  }
}
