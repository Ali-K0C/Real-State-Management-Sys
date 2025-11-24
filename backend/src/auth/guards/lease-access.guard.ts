import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LeaseAccessGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const userId = request.session?.userId;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const leaseId = request.params?.id || request.params?.leaseId;

    if (!userId) {
      throw new ForbiddenException('Not authenticated');
    }

    if (!leaseId) {
      throw new ForbiddenException('Lease ID is required');
    }

    const lease = await this.prisma.rentalLease.findUnique({
      where: { id: leaseId },
    });

    if (!lease) {
      throw new NotFoundException('Lease not found');
    }

    // Check if user is either the landlord or tenant of this lease
    if (lease.landlordId !== userId && lease.tenantId !== userId) {
      throw new ForbiddenException(
        'Access denied: You must be the landlord or tenant of this lease',
      );
    }

    return true;
  }
}
