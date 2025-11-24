import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRentalListingDto } from './dto/create-rental-listing.dto';
import { UpdateRentalListingDto } from './dto/update-rental-listing.dto';

@Injectable()
export class RentalListingsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    page: number = 1,
    limit: number = 8,
    location?: string,
    minRent?: number,
    maxRent?: number,
    bedrooms?: number,
  ) {
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      isActive: true,
      property: {},
    };

    if (location) {
      where.property.location = {
        contains: location,
        mode: 'insensitive',
      };
    }

    if (minRent !== undefined || maxRent !== undefined) {
      where.monthlyRent = {};
      if (minRent !== undefined) {
        where.monthlyRent.gte = minRent;
      }
      if (maxRent !== undefined) {
        where.monthlyRent.lte = maxRent;
      }
    }

    if (bedrooms !== undefined) {
      where.property.bedrooms = bedrooms;
    }

    const [data, total] = await Promise.all([
      this.prisma.rentalListing.findMany({
        where,
        include: {
          property: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  contactNo: true,
                  role: true,
                  createdAt: true,
                },
              },
            },
          },
          leases: {
            where: {
              status: 'ACTIVE',
            },
            take: 1,
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.rentalListing.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const listing = await this.prisma.rentalListing.findUnique({
      where: { id },
      include: {
        property: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                contactNo: true,
                role: true,
                createdAt: true,
              },
            },
          },
        },
        leases: {
          where: {
            status: 'ACTIVE',
          },
          include: {
            tenant: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                contactNo: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    if (!listing) {
      throw new NotFoundException('Rental listing not found');
    }

    return listing;
  }

  async create(userId: string, createDto: CreateRentalListingDto) {
    // Check if property exists and belongs to user
    const property = await this.prisma.property.findUnique({
      where: { id: createDto.propertyId },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (property.userId !== userId) {
      throw new ForbiddenException(
        'You can only create rental listings for your own properties',
      );
    }

    // Check if rental listing already exists for this property
    const existingListing = await this.prisma.rentalListing.findUnique({
      where: { propertyId: createDto.propertyId },
    });

    if (existingListing) {
      throw new BadRequestException(
        'A rental listing already exists for this property',
      );
    }

    // Create rental listing and update property
    const listing = await this.prisma.$transaction(async (tx) => {
      // Update property to mark as for rent
      await tx.property.update({
        where: { id: createDto.propertyId },
        data: { isForRent: true },
      });

      // Promote user to LANDLORD if they are currently USER
      const user = await tx.user.findUnique({
        where: { id: userId },
      });

      if (user && user.role === 'USER') {
        await tx.user.update({
          where: { id: userId },
          data: { role: 'LANDLORD' },
        });
      }

      // Create rental listing
      return tx.rentalListing.create({
        data: {
          propertyId: createDto.propertyId,
          monthlyRent: createDto.monthlyRent,
          securityDeposit: createDto.securityDeposit,
          availableFrom: new Date(createDto.availableFrom),
          leaseDuration: createDto.leaseDuration,
        },
        include: {
          property: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  contactNo: true,
                  role: true,
                  createdAt: true,
                },
              },
            },
          },
        },
      });
    });

    return listing;
  }

  async update(id: string, userId: string, updateDto: UpdateRentalListingDto) {
    const listing = await this.prisma.rentalListing.findUnique({
      where: { id },
      include: { property: true },
    });

    if (!listing) {
      throw new NotFoundException('Rental listing not found');
    }

    if (listing.property.userId !== userId) {
      throw new ForbiddenException(
        'You can only update your own rental listings',
      );
    }

    const updateData: any = {};

    if (updateDto.monthlyRent !== undefined) {
      updateData.monthlyRent = updateDto.monthlyRent;
    }
    if (updateDto.securityDeposit !== undefined) {
      updateData.securityDeposit = updateDto.securityDeposit;
    }
    if (updateDto.availableFrom !== undefined) {
      updateData.availableFrom = new Date(updateDto.availableFrom);
    }
    if (updateDto.leaseDuration !== undefined) {
      updateData.leaseDuration = updateDto.leaseDuration;
    }
    if (updateDto.isActive !== undefined) {
      updateData.isActive = updateDto.isActive;
    }

    return this.prisma.rentalListing.update({
      where: { id },
      data: updateData,
      include: {
        property: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                contactNo: true,
                role: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    const listing = await this.prisma.rentalListing.findUnique({
      where: { id },
      include: { property: true },
    });

    if (!listing) {
      throw new NotFoundException('Rental listing not found');
    }

    if (listing.property.userId !== userId) {
      throw new ForbiddenException(
        'You can only delete your own rental listings',
      );
    }

    // Soft delete by marking as inactive
    return this.prisma.rentalListing.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
