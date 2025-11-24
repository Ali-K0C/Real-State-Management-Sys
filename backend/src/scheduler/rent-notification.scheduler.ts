import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { RentPaymentsService } from '../rent-payments/rent-payments.service';

@Injectable()
export class RentNotificationScheduler {
  private readonly logger = new Logger(RentNotificationScheduler.name);

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private rentPaymentsService: RentPaymentsService,
  ) {}

  // Run daily at 9:00 AM
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async handleRentNotifications() {
    this.logger.log('Starting rent notification scan...');

    try {
      // Send upcoming payment reminders
      await this.sendUpcomingRentReminders();

      // Mark and notify overdue payments
      await this.handleOverduePayments();

      this.logger.log('Rent notification scan completed');
    } catch (error) {
      this.logger.error('Error in rent notification scan:', error);
    }
  }

  private async sendUpcomingRentReminders() {
    const daysAhead = parseInt(
      process.env.RENT_UPCOMING_WINDOW_DAYS || '3',
      10,
    );

    // Validate the days ahead value
    if (isNaN(daysAhead) || daysAhead < 1) {
      this.logger.error(
        'Invalid RENT_UPCOMING_WINDOW_DAYS value, using default of 3 days',
      );
      return this.rentPaymentsService.findUpcomingPayments(3);
    }

    const upcomingPayments =
      await this.rentPaymentsService.findUpcomingPayments(daysAhead);

    this.logger.log(
      `Found ${upcomingPayments.length} upcoming payments within ${daysAhead} days`,
    );

    for (const payment of upcomingPayments) {
      try {
        const tenantName = `${payment.lease.tenant.firstName} ${payment.lease.tenant.lastName}`;
        const landlordName = `${payment.lease.landlord.firstName} ${payment.lease.landlord.lastName}`;
        const propertyAddress = `${payment.lease.rentalListing.property.address}, ${payment.lease.rentalListing.property.location}`;
        const dueDate = new Date(payment.dueDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        await this.mailService.sendRentDueWarning(payment.lease.tenant.email, {
          tenantName,
          propertyAddress,
          amount: payment.amount.toString(),
          dueDate,
          landlordName,
          landlordEmail: payment.lease.landlord.email,
        });

        this.logger.log(
          `Sent upcoming rent reminder to ${payment.lease.tenant.email}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to send reminder for payment ${payment.id}:`,
          error,
        );
      }
    }
  }

  private async handleOverduePayments() {
    const overduePayments =
      await this.rentPaymentsService.findOverduePayments();

    this.logger.log(`Found ${overduePayments.length} overdue payments`);

    for (const payment of overduePayments) {
      try {
        // Mark as overdue
        await this.rentPaymentsService.markOverdue(payment.id);

        // Calculate days overdue
        const dueDate = new Date(payment.dueDate);
        const now = new Date();
        const daysOverdue = Math.floor(
          (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
        );

        // Send overdue notification
        const tenantName = `${payment.lease.tenant.firstName} ${payment.lease.tenant.lastName}`;
        const landlordName = `${payment.lease.landlord.firstName} ${payment.lease.landlord.lastName}`;
        const propertyAddress = `${payment.lease.rentalListing.property.address}, ${payment.lease.rentalListing.property.location}`;
        const dueDateStr = dueDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        await this.mailService.sendRentOverdueNotification(
          payment.lease.tenant.email,
          {
            tenantName,
            propertyAddress,
            amount: payment.amount.toString(),
            dueDate: dueDateStr,
            daysOverdue: daysOverdue.toString(),
            landlordName,
            landlordEmail: payment.lease.landlord.email,
          },
        );

        this.logger.log(
          `Marked payment ${payment.id} as overdue and sent notification to ${payment.lease.tenant.email}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to handle overdue payment ${payment.id}:`,
          error,
        );
      }
    }
  }
}
