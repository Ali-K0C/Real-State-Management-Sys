import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Session,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('properties')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(8), ParseIntPipe) limit: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('location') location?: string,
  ) {
    return this.propertyService.findAll(
      page,
      limit,
      sortBy,
      sortOrder,
      location,
    );
  }

  @Get('stats')
  async getStats(@Session() session: Record<string, any>) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const userId = session.userId;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.propertyService.getStats(userId);
  }

  @Get('locations')
  async getLocations() {
    return this.propertyService.getLocations();
  }

  @Get('my-listings')
  @UseGuards(AuthGuard)
  async getMyListings(@Session() session: Record<string, any>) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const userId = session.userId;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.propertyService.findByUser(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.propertyService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Body() createPropertyDto: CreatePropertyDto,
    @Session() session: Record<string, any>,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const userId = session.userId;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.propertyService.create(userId, createPropertyDto);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
    @Session() session: Record<string, any>,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const userId = session.userId;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.propertyService.update(id, userId, updatePropertyDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async remove(
    @Param('id') id: string,
    @Session() session: Record<string, any>,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const userId = session.userId;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.propertyService.remove(id, userId);
  }

  @Patch(':id/buy')
  @UseGuards(AuthGuard)
  async buyProperty(
    @Param('id') id: string,
    @Session() session: Record<string, any>,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const userId = session.userId;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.propertyService.buyProperty(id, userId);
  }
}
