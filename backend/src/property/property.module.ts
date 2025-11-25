import { Module, forwardRef } from '@nestjs/common';
import { PropertyController } from './property.controller';
import { PropertyService } from './property.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RentalListingsModule } from '../rental-listings/rental-listings.module';

@Module({
  imports: [PrismaModule, forwardRef(() => RentalListingsModule)],
  controllers: [PropertyController],
  providers: [PropertyService],
  exports: [PropertyService],
})
export class PropertyModule {}
