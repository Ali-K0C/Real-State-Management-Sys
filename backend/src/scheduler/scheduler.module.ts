import { Module } from '@nestjs/common';
import { ScheduleModule as NestScheduleModule } from '@nestjs/schedule';
import { RentNotificationScheduler } from './rent-notification.scheduler';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';
import { RentPaymentsModule } from '../rent-payments/rent-payments.module';

@Module({
  imports: [
    NestScheduleModule.forRoot(),
    PrismaModule,
    MailModule,
    RentPaymentsModule,
  ],
  providers: [RentNotificationScheduler],
})
export class SchedulerModule {}
