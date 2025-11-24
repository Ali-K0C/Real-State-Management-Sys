import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Session,
} from '@nestjs/common';
import { RentalLeasesService } from './rental-leases.service';
import { CreateRentalLeaseDto } from './dto/create-rental-lease.dto';
import { UpdateLeaseStatusDto } from './dto/update-lease-status.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { LeaseAccessGuard } from '../auth/guards/lease-access.guard';
import { RentalLeaseStatus } from '@prisma/client';

@Controller('rentals/leases')
@UseGuards(AuthGuard)
export class RentalLeasesController {
  constructor(private readonly rentalLeasesService: RentalLeasesService) {}

  @Post()
  async create(
    @Body() createDto: CreateRentalLeaseDto,
    @Session() session: Record<string, any>,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const userId = session.userId;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.rentalLeasesService.create(userId, createDto);
  }

  @Get(':id')
  @UseGuards(LeaseAccessGuard)
  async findOne(
    @Param('id') id: string,
    @Session() session: Record<string, any>,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const userId = session.userId;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.rentalLeasesService.findOne(id, userId);
  }

  @Get()
  async findLeases(
    @Query('landlord') landlord: string,
    @Query('tenant') tenant: string,
    @Query('status') status: string,
    @Session() session: Record<string, any>,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const userId = session.userId;

    const leaseStatus =
      status && Object.values(RentalLeaseStatus).includes(status as any)
        ? (status as RentalLeaseStatus)
        : undefined;

    if (landlord === 'true') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return this.rentalLeasesService.findByLandlord(userId, leaseStatus);
    } else if (tenant === 'true') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return this.rentalLeasesService.findByTenant(userId, leaseStatus);
    }

    // Default to landlord view
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.rentalLeasesService.findByLandlord(userId, leaseStatus);
  }

  @Patch(':id/status')
  @UseGuards(LeaseAccessGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateLeaseStatusDto,
    @Session() session: Record<string, any>,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const userId = session.userId;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.rentalLeasesService.updateStatus(id, userId, updateDto);
  }
}
