import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Session,
} from '@nestjs/common';
import { RentPaymentsService } from './rent-payments.service';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('rentals/payments')
@UseGuards(AuthGuard)
export class RentPaymentsController {
  constructor(private readonly rentPaymentsService: RentPaymentsService) {}

  @Get()
  async findByLease(
    @Query('leaseId') leaseId: string,
    @Session() session: Record<string, any>,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const userId = session.userId;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.rentPaymentsService.findByLease(leaseId, userId);
  }

  @Patch(':id/pay')
  async markPaid(
    @Param('id') id: string,
    @Body() dto: RecordPaymentDto,
    @Session() session: Record<string, any>,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const userId = session.userId;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.rentPaymentsService.markPaid(id, userId, dto);
  }

  @Patch(':id/waive')
  async waivePayment(
    @Param('id') id: string,
    @Session() session: Record<string, any>,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const userId = session.userId;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.rentPaymentsService.waivePayment(id, userId);
  }

  @Patch(':id/mark-overdue')
  async markOverdue(@Param('id') id: string) {
    return this.rentPaymentsService.markOverdue(id);
  }
}
