import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PropertyModule } from './property/property.module';
import { RentalListingsModule } from './rental-listings/rental-listings.module';

@Module({
  imports: [PrismaModule, AuthModule, PropertyModule, RentalListingsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
