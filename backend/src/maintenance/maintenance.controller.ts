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
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceRequestDto } from './dto/create-maintenance-request.dto';
import { UpdateMaintenanceRequestDto } from './dto/update-maintenance-request.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { MaintenanceStatus } from '@prisma/client';

@Controller('rentals/maintenance')
@UseGuards(AuthGuard)
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Post()
  async create(
    @Body() createDto: CreateMaintenanceRequestDto,
    @Session() session: Record<string, any>,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const userId = session.userId;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.maintenanceService.create(userId, createDto);
  }

  @Get()
  async findAll(
    @Query('propertyId') propertyId: string,
    @Query('status') status: string,
    @Session() session: Record<string, any>,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const userId = session.userId;

    const maintenanceStatus =
      status && Object.values(MaintenanceStatus).includes(status as any)
        ? (status as MaintenanceStatus)
        : undefined;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.maintenanceService.findAll(userId, propertyId, maintenanceStatus);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Session() session: Record<string, any>) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const userId = session.userId;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.maintenanceService.findOne(id, userId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateMaintenanceRequestDto,
    @Session() session: Record<string, any>,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const userId = session.userId;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.maintenanceService.update(id, userId, updateDto);
  }
}
