import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMaintenanceRequestDto } from './dto/create-maintenance-request.dto';
import { UpdateMaintenanceRequestDto } from './dto/update-maintenance-request.dto';
import { MaintenanceStatus } from '@prisma/client';

@Injectable()
export class MaintenanceService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createDto: CreateMaintenanceRequestDto) {
    // Verify property exists
    const property = await this.prisma.property.findUnique({
      where: { id: createDto.propertyId },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    // User must be either property owner or tenant with active lease
    const isOwner = property.userId === userId;
    let isTenant = false;

    if (!isOwner) {
      const activeLease = await this.prisma.rentalLease.findFirst({
        where: {
          rentalListing: {
            propertyId: createDto.propertyId,
          },
          tenantId: userId,
          status: 'ACTIVE',
        },
      });

      isTenant = !!activeLease;
    }

    if (!isOwner && !isTenant) {
      throw new ForbiddenException(
        'You can only create maintenance requests for properties you own or rent',
      );
    }

    return this.prisma.maintenanceRequest.create({
      data: {
        propertyId: createDto.propertyId,
        requestedBy: userId,
        title: createDto.title,
        description: createDto.description,
        priority: createDto.priority || 'MEDIUM',
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            location: true,
            address: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async findAll(
    userId: string,
    propertyId?: string,
    status?: MaintenanceStatus,
  ) {
    const where: any = {};

    // Filter by property if specified
    if (propertyId) {
      where.propertyId = propertyId;

      // Verify user has access to this property
      const property = await this.prisma.property.findUnique({
        where: { id: propertyId },
      });

      if (!property) {
        throw new NotFoundException('Property not found');
      }

      const isOwner = property.userId === userId;
      const activeLease = await this.prisma.rentalLease.findFirst({
        where: {
          rentalListing: {
            propertyId,
          },
          tenantId: userId,
          status: 'ACTIVE',
        },
      });

      if (!isOwner && !activeLease) {
        throw new ForbiddenException('Access denied to this property');
      }
    } else {
      // Show all maintenance requests for properties user owns or rents
      where.OR = [
        {
          property: {
            userId,
          },
        },
        {
          requestedBy: userId,
        },
      ];
    }

    if (status) {
      where.status = status;
    }

    return this.prisma.maintenanceRequest.findMany({
      where,
      include: {
        property: {
          select: {
            id: true,
            title: true,
            location: true,
            address: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string) {
    const request = await this.prisma.maintenanceRequest.findUnique({
      where: { id },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            location: true,
            address: true,
            userId: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException('Maintenance request not found');
    }

    // Check access
    const isOwner = request.property.userId === userId;
    const isRequester = request.requestedBy === userId;

    if (!isOwner && !isRequester) {
      throw new ForbiddenException('Access denied');
    }

    return request;
  }

  async update(
    id: string,
    userId: string,
    updateDto: UpdateMaintenanceRequestDto,
  ) {
    const request = await this.prisma.maintenanceRequest.findUnique({
      where: { id },
      include: {
        property: true,
      },
    });

    if (!request) {
      throw new NotFoundException('Maintenance request not found');
    }

    // Check access - property owner or requester can update
    const isOwner = request.property.userId === userId;
    const isRequester = request.requestedBy === userId;

    if (!isOwner && !isRequester) {
      throw new ForbiddenException('Access denied');
    }

    // Build update data
    const updateData: any = {};

    if (updateDto.status !== undefined) {
      updateData.status = updateDto.status;
    }

    if (updateDto.priority !== undefined) {
      updateData.priority = updateDto.priority;
    }

    if (updateDto.notes !== undefined) {
      // Append notes if they exist, otherwise set them
      if (request.notes) {
        updateData.notes = `${request.notes}\n\n[${new Date().toISOString()}] ${updateDto.notes}`;
      } else {
        updateData.notes = `[${new Date().toISOString()}] ${updateDto.notes}`;
      }
    }

    return this.prisma.maintenanceRequest.update({
      where: { id },
      data: updateData,
      include: {
        property: {
          select: {
            id: true,
            title: true,
            location: true,
            address: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });
  }
}
