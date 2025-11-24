import { Controller, Get, UseGuards, Session } from '@nestjs/common';
import { LandlordStatsService } from './landlord-stats.service';
import { LandlordGuard } from '../auth/guards/landlord.guard';

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
}
