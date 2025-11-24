import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRentalLeaseDto } from './dto/create-rental-lease.dto';
import { UpdateLeaseStatusDto } from './dto/update-lease-status.dto';
import { RentalLeaseStatus } from '@prisma/client';

@Injectable()
export class RentalLeasesService {
  constructor(private prisma: PrismaService) {}

  async create(landlordId: string, createDto: CreateRentalLeaseDto) {
    // Verify rental listing exists and belongs to landlord
    const listing = await this.prisma.rentalListing.findUnique({
      where: { id: createDto.rentalListingId },
      include: { property: true },
    });

    if (!listing) {
      throw new NotFoundException('Rental listing not found');
    }

    if (listing.property.userId !== landlordId) {
      throw new ForbiddenException(
        'You can only create leases for your own rental listings',
      );
    }

    // Verify tenant exists
    const tenant = await this.prisma.user.findUnique({
      where: { id: createDto.tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Verify dates
    const startDate = new Date(createDto.startDate);
    const endDate = new Date(createDto.endDate);

    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    // Create lease
    const lease = await this.prisma.rentalLease.create({
      data: {
        rentalListingId: createDto.rentalListingId,
        landlordId,
        tenantId: createDto.tenantId,
        startDate,
        endDate,
        monthlyRent: listing.monthlyRent,
        securityDeposit: listing.securityDeposit,
        paymentDay: createDto.paymentDay,
        notes: createDto.notes,
        status: 'PENDING',
      },
      include: {
        rentalListing: {
          include: {
            property: true,
          },
        },
        landlord: {
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
        tenant: {
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
    });

    return lease;
  }

  async findOne(id: string, userId: string) {
    const lease = await this.prisma.rentalLease.findUnique({
      where: { id },
      include: {
        rentalListing: {
          include: {
            property: true,
          },
        },
        landlord: {
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
        tenant: {
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
        payments: {
          orderBy: {
            dueDate: 'asc',
          },
        },
      },
    });

    if (!lease) {
      throw new NotFoundException('Lease not found');
    }

    // Verify access
    if (lease.landlordId !== userId && lease.tenantId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return lease;
  }

  async findByLandlord(landlordId: string, status?: RentalLeaseStatus) {
    const where: any = { landlordId };
    if (status) {
      where.status = status;
    }

    return this.prisma.rentalLease.findMany({
      where,
      include: {
        rentalListing: {
          include: {
            property: true,
          },
        },
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
        payments: {
          where: {
            status: {
              in: ['DUE', 'OVERDUE'],
            },
          },
          orderBy: {
            dueDate: 'asc',
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByTenant(tenantId: string, status?: RentalLeaseStatus) {
    const where: any = { tenantId };
    if (status) {
      where.status = status;
    }

    return this.prisma.rentalLease.findMany({
      where,
      include: {
        rentalListing: {
          include: {
            property: true,
          },
        },
        landlord: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            contactNo: true,
            createdAt: true,
          },
        },
        payments: {
          where: {
            status: {
              in: ['DUE', 'OVERDUE'],
            },
          },
          orderBy: {
            dueDate: 'asc',
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateStatus(
    id: string,
    userId: string,
    updateDto: UpdateLeaseStatusDto,
  ) {
    const lease = await this.prisma.rentalLease.findUnique({
      where: { id },
    });

    if (!lease) {
      throw new NotFoundException('Lease not found');
    }

    // Only landlord can update status
    if (lease.landlordId !== userId) {
      throw new ForbiddenException(
        'Only the landlord can update lease status',
      );
    }

    // Validate status transitions
    this.validateStatusTransition(lease.status, updateDto.status);

    // If activating lease, generate payment schedule
    if (updateDto.status === 'ACTIVE' && lease.status === 'PENDING') {
      return this.activateLease(id);
    }

    // Update status
    return this.prisma.rentalLease.update({
      where: { id },
      data: { status: updateDto.status },
      include: {
        rentalListing: {
          include: {
            property: true,
          },
        },
        landlord: {
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
        tenant: {
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
    });
  }

  private validateStatusTransition(
    currentStatus: RentalLeaseStatus,
    newStatus: RentalLeaseStatus,
  ) {
    const allowedTransitions: Record<RentalLeaseStatus, RentalLeaseStatus[]> = {
      PENDING: ['ACTIVE', 'CANCELED'],
      ACTIVE: ['COMPLETED', 'TERMINATED'],
      COMPLETED: [],
      TERMINATED: [],
      CANCELED: [],
    };

    if (!allowedTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }

  private async activateLease(leaseId: string) {
    const lease = await this.prisma.rentalLease.findUnique({
      where: { id: leaseId },
    });

    if (!lease) {
      throw new NotFoundException('Lease not found');
    }

    // Generate payment schedule
    const payments = this.generatePaymentSchedule(lease);

    // Update lease and create payments in transaction
    return this.prisma.$transaction(async (tx) => {
      // Update lease status
      const updatedLease = await tx.rentalLease.update({
        where: { id: leaseId },
        data: { status: 'ACTIVE' },
        include: {
          rentalListing: {
            include: {
              property: true,
            },
          },
          landlord: {
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
          tenant: {
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
      });

      // Create payments
      await tx.rentPayment.createMany({
        data: payments,
      });

      return updatedLease;
    });
  }

  private generatePaymentSchedule(lease: any): any[] {
    const payments: any[] = [];
    const startDate = new Date(lease.startDate);
    const endDate = new Date(lease.endDate);
    const paymentDay = lease.paymentDay;

    let currentDate = new Date(startDate);

    // Set to the first payment date
    currentDate.setDate(paymentDay);
    if (currentDate < startDate) {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    while (currentDate <= endDate) {
      payments.push({
        leaseId: lease.id,
        amount: lease.monthlyRent,
        dueDate: new Date(currentDate),
        status: 'DUE',
      });

      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return payments;
  }
}
