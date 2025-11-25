import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RecordPaymentDto } from './dto/record-payment.dto';

@Injectable()
export class RentPaymentsService {
  constructor(private prisma: PrismaService) {}

  async findByLease(leaseId: string, userId: string) {
    // Verify lease exists and user has access
    const lease = await this.prisma.rentalLease.findUnique({
      where: { id: leaseId },
    });

    if (!lease) {
      throw new NotFoundException('Lease not found');
    }

    if (lease.landlordId !== userId && lease.tenantId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.rentPayment.findMany({
      where: { leaseId },
      orderBy: {
        dueDate: 'asc',
      },
    });
  }

  async markPaid(id: string, userId: string, dto: RecordPaymentDto) {
    const payment = await this.prisma.rentPayment.findUnique({
      where: { id },
      include: {
        lease: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Verify user has access (landlord or tenant)
    if (
      payment.lease.landlordId !== userId &&
      payment.lease.tenantId !== userId
    ) {
      throw new ForbiddenException('Access denied');
    }

    if (payment.status === 'PAID') {
      throw new BadRequestException('Payment is already marked as paid');
    }

    if (payment.status === 'WAIVED') {
      throw new BadRequestException('Payment has been waived');
    }

    return this.prisma.rentPayment.update({
      where: { id },
      data: {
        status: 'PAID',
        paidDate: new Date(),
        paymentMethod: dto.paymentMethod,
        notes: dto.notes,
      },
    });
  }

  async recordPayment(id: string, userId: string, dto: RecordPaymentDto) {
    const payment = await this.prisma.rentPayment.findUnique({
      where: { id },
      include: {
        lease: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Only landlord can record payments
    if (payment.lease.landlordId !== userId) {
      throw new ForbiddenException('Only the landlord can record payments');
    }

    if (payment.status === 'PAID') {
      throw new BadRequestException('Payment is already marked as paid');
    }

    if (payment.status === 'WAIVED') {
      throw new BadRequestException('Payment has been waived');
    }

    return this.prisma.rentPayment.update({
      where: { id },
      data: {
        status: 'PAID',
        paidDate: new Date(),
        paymentMethod: dto.paymentMethod,
        notes: dto.notes,
      },
    });
  }

  async waivePayment(id: string, userId: string) {
    const payment = await this.prisma.rentPayment.findUnique({
      where: { id },
      include: {
        lease: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Only landlord can waive payments
    if (payment.lease.landlordId !== userId) {
      throw new ForbiddenException('Only the landlord can waive rent payments');
    }

    if (payment.status === 'PAID') {
      throw new BadRequestException('Cannot waive a payment that is paid');
    }

    if (payment.status === 'WAIVED') {
      throw new BadRequestException('Payment is already waived');
    }

    return this.prisma.rentPayment.update({
      where: { id },
      data: {
        status: 'WAIVED',
      },
    });
  }

  async markOverdue(id: string) {
    const payment = await this.prisma.rentPayment.findUnique({
      where: { id },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== 'DUE') {
      throw new BadRequestException('Only DUE payments can be marked overdue');
    }

    return this.prisma.rentPayment.update({
      where: { id },
      data: {
        status: 'OVERDUE',
      },
    });
  }

  async findOverduePayments() {
    const now = new Date();
    return this.prisma.rentPayment.findMany({
      where: {
        status: 'DUE',
        dueDate: {
          lt: now,
        },
      },
      include: {
        lease: {
          include: {
            tenant: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
            landlord: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
            rentalListing: {
              include: {
                property: true,
              },
            },
          },
        },
      },
    });
  }

  async findUpcomingPayments(daysAhead: number = 3) {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return this.prisma.rentPayment.findMany({
      where: {
        status: 'DUE',
        dueDate: {
          gte: now,
          lte: futureDate,
        },
      },
      include: {
        lease: {
          include: {
            tenant: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
            landlord: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
            rentalListing: {
              include: {
                property: true,
              },
            },
          },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    });
  }
}
