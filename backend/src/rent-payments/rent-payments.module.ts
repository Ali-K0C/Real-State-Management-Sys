import { Module } from '@nestjs/common';
import { RentPaymentsController } from './rent-payments.controller';
import { RentPaymentsService } from './rent-payments.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RentPaymentsController],
  providers: [RentPaymentsService],
  exports: [RentPaymentsService],
})
export class RentPaymentsModule {}
