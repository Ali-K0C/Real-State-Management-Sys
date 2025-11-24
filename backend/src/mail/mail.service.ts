import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    // Only initialize if SMTP configuration is provided
    if (smtpHost && smtpPort && smtpUser && smtpPass) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort, 10),
        secure: parseInt(smtpPort, 10) === 465, // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      this.logger.log('Mail transporter initialized');
    } else {
      this.logger.warn(
        'SMTP configuration not found. Email notifications will be logged but not sent.',
      );
    }
  }

  private loadTemplate(templateName: string): string {
    const templatePath = join(__dirname, 'templates', `${templateName}.html`);
    return readFileSync(templatePath, 'utf-8');
  }

  private replaceTemplateVariables(
    template: string,
    variables: Record<string, string>,
  ): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value);
    }
    return result;
  }

  async sendRentDueWarning(
    tenantEmail: string,
    data: {
      tenantName: string;
      propertyAddress: string;
      amount: string;
      dueDate: string;
      landlordName: string;
      landlordEmail: string;
    },
  ) {
    const template = this.loadTemplate('rent-due-warning');
    const html = this.replaceTemplateVariables(template, data);

    const mailOptions = {
      from: process.env.MAIL_FROM || 'no-reply@example.com',
      to: tenantEmail,
      subject: 'Rent Payment Due Soon',
      html,
    };

    return this.sendMail(mailOptions);
  }

  async sendRentOverdueNotification(
    tenantEmail: string,
    data: {
      tenantName: string;
      propertyAddress: string;
      amount: string;
      dueDate: string;
      daysOverdue: string;
      landlordName: string;
      landlordEmail: string;
    },
  ) {
    const template = this.loadTemplate('rent-overdue');
    const html = this.replaceTemplateVariables(template, data);

    const mailOptions = {
      from: process.env.MAIL_FROM || 'no-reply@example.com',
      to: tenantEmail,
      subject: '⚠️ Overdue Rent Payment',
      html,
    };

    return this.sendMail(mailOptions);
  }

  async sendLeaseActivationEmail(
    tenantEmail: string,
    landlordEmail: string,
    data: {
      tenantName: string;
      propertyAddress: string;
      monthlyRent: string;
      startDate: string;
      endDate: string;
      paymentDay: string;
      securityDeposit: string;
      landlordName: string;
      landlordEmail: string;
    },
  ) {
    const template = this.loadTemplate('lease-activation');
    const html = this.replaceTemplateVariables(template, data);

    const mailOptions = {
      from: process.env.MAIL_FROM || 'no-reply@example.com',
      to: tenantEmail,
      cc: landlordEmail,
      subject: 'Lease Activated - Welcome to Your New Home',
      html,
    };

    return this.sendMail(mailOptions);
  }

  private async sendMail(mailOptions: any): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn(
        `Email would be sent to ${mailOptions.to} with subject: ${mailOptions.subject}`,
      );
      return true; // Return true for testing purposes
    }

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent: ${info.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`);
      return false;
    }
  }
}
