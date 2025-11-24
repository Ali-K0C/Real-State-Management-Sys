import { Module } from '@nestjs/common';
import { RentalListingsController } from './rental-listings.controller';
import { RentalListingsService } from './rental-listings.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RentalListingsController],
  providers: [RentalListingsService],
  exports: [RentalListingsService],
})
export class RentalListingsModule {}
