import { Module } from '@nestjs/common';
import { RentalLeasesController } from './rental-leases.controller';
import { RentalLeasesService } from './rental-leases.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RentalLeasesController],
  providers: [RentalLeasesService],
  exports: [RentalLeasesService],
})
export class RentalLeasesModule {}
