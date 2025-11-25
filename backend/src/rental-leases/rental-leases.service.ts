import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRentalLeaseDto } from './dto/create-rental-lease.dto';
import { UpdateLeaseStatusDto } from './dto/update-lease-status.dto';
import { RentalLeaseStatus, RentalListing } from '@prisma/client';

@Injectable()
export class RentalLeasesService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, createDto: CreateRentalLeaseDto) {
    // Verify rental listing exists
    const listing = await this.prisma.rentalListing.findUnique({
      where: { id: createDto.rentalListingId },
      include: { property: true },
    });

    if (!listing) {
      throw new NotFoundException('Rental listing not found');
    }

    // Tenant cannot rent their own property
    if (listing.property.userId === tenantId) {
      throw new ForbiddenException('You cannot rent your own property');
    }

    // Check if listing is active
    if (!listing.isActive) {
      throw new BadRequestException('This rental listing is not active');
    }

    // Check if property is available (no active leases)
    const activeLeases = await this.prisma.rentalLease.findMany({
      where: {
        rentalListingId: createDto.rentalListingId,
        status: 'ACTIVE',
      },
    });

    if (activeLeases.length > 0) {
      throw new BadRequestException('This property is already rented');
    }

    // Verify dates
    const startDate = new Date(createDto.startDate);
    const endDate = new Date(createDto.endDate);

    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    // Create lease with tenant as the requester, landlord is the property owner
    const landlordId = listing.property.userId;

    const lease = await this.prisma.rentalLease.create({
      data: {
        rentalListingId: createDto.rentalListingId,
        landlordId,
        tenantId,
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

    // Calculate payment stats
    const paymentStats = this.calculatePaymentStats(lease.payments);

    return {
      ...lease,
      paymentStats,
    };
  }

  private calculatePaymentStats(payments: any[]) {
    let totalPaid = 0;
    let totalDue = 0;
    let totalOverdue = 0;
    let paidCount = 0;
    let dueCount = 0;
    let overdueCount = 0;

    for (const payment of payments) {
      const amount = Number(payment.amount);
      switch (payment.status) {
        case 'PAID':
          totalPaid += amount;
          paidCount++;
          break;
        case 'DUE':
          totalDue += amount;
          dueCount++;
          break;
        case 'OVERDUE':
          totalOverdue += amount;
          overdueCount++;
          break;
      }
    }

    return {
      totalPaid: Math.round(totalPaid * 100) / 100,
      totalDue: Math.round(totalDue * 100) / 100,
      totalOverdue: Math.round(totalOverdue * 100) / 100,
      paidCount,
      dueCount,
      overdueCount,
      totalPayments: payments.length,
    };
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
      throw new ForbiddenException('Only the landlord can update lease status');
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
      include: {
        rentalListing: true,
      },
    });

    if (!lease) {
      throw new NotFoundException('Lease not found');
    }

    // Generate payment schedule with escalation
    const payments = this.generatePaymentSchedule(lease, lease.rentalListing);

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

      // Update property status to "Rented"
      await tx.property.update({
        where: { id: updatedLease.rentalListing.propertyId },
        data: { status: 'Rented' },
      });

      // Create payments
      await tx.rentPayment.createMany({
        data: payments,
      });

      return updatedLease;
    });
  }

  private generatePaymentSchedule(
    lease: any,
    listing: RentalListing | null,
  ): any[] {
    const payments: any[] = [];
    const startDate = new Date(lease.startDate);
    const endDate = new Date(lease.endDate);
    const paymentDay = lease.paymentDay;

    const currentDate = new Date(startDate);

    // Set to the first payment date
    currentDate.setDate(paymentDay);
    if (currentDate < startDate) {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    // Escalation settings
    const escalationEnabled = listing?.rentEscalationEnabled ?? false;
    const escalationPercentage = listing?.escalationPercentage
      ? Number(listing.escalationPercentage)
      : 0;
    const escalationIntervalMonths = listing?.escalationIntervalMonths ?? 12;

    let currentRent = Number(lease.monthlyRent);
    let monthsSinceStart = 0;
    let lastEscalationMonth = 0;

    while (currentDate <= endDate) {
      // Calculate months since start for escalation
      monthsSinceStart =
        (currentDate.getFullYear() - startDate.getFullYear()) * 12 +
        (currentDate.getMonth() - startDate.getMonth());

      // Apply escalation if enabled and interval has passed
      if (
        escalationEnabled &&
        escalationPercentage > 0 &&
        escalationIntervalMonths > 0 &&
        monthsSinceStart > 0 &&
        monthsSinceStart >= lastEscalationMonth + escalationIntervalMonths
      ) {
        currentRent = currentRent * (1 + escalationPercentage / 100);
        lastEscalationMonth = monthsSinceStart;
      }

      payments.push({
        leaseId: lease.id,
        amount: Math.round(currentRent * 100) / 100, // Round to 2 decimal places
        dueDate: new Date(currentDate),
        status: 'DUE',
      });

      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return payments;
  }
}
