import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PropertyModule } from './property/property.module';
import { RentalListingsModule } from './rental-listings/rental-listings.module';
import { RentalLeasesModule } from './rental-leases/rental-leases.module';
import { RentPaymentsModule } from './rent-payments/rent-payments.module';
import { LandlordStatsModule } from './landlord-stats/landlord-stats.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    PropertyModule,
    RentalListingsModule,
    RentalLeasesModule,
    RentPaymentsModule,
    LandlordStatsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
