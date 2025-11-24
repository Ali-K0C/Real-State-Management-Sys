import { Module } from '@nestjs/common';
import { LandlordStatsController } from './landlord-stats.controller';
import { LandlordStatsService } from './landlord-stats.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LandlordStatsController],
  providers: [LandlordStatsService],
  exports: [LandlordStatsService],
})
export class LandlordStatsModule {}
