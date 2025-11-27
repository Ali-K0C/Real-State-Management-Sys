import { Controller, Get, UseGuards, Session, Query } from '@nestjs/common';
import { LandlordStatsService } from './landlord-stats.service';
import { LandlordGuard } from '../auth/guards/landlord.guard';
import { RentalLeaseStatus } from '@prisma/client';

@Controller('rentals/landlord')
@UseGuards(LandlordGuard)
export class LandlordStatsController {
  constructor(private readonly landlordStatsService: LandlordStatsService) {}

  @Get('stats')
  async getStats(@Session() session: Record<string, any>) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const userId = session.userId;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.landlordStatsService.getStats(userId);
  }

  @Get('overview')
  async getOverview(@Session() session: Record<string, any>) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const userId = session.userId;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.landlordStatsService.getOverview(userId);
  }

  @Get('leases')
  async getLandlordLeases(
    @Query('status') status: string,
    @Session() session: Record<string, any>,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const userId = session.userId;

    const leaseStatus =
      status && Object.values(RentalLeaseStatus).includes(status as RentalLeaseStatus)
        ? (status as RentalLeaseStatus)
        : undefined;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.landlordStatsService.getLeases(userId, leaseStatus);
  }
}
