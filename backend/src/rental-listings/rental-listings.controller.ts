import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Session,
  ParseIntPipe,
  DefaultValuePipe,
  ParseFloatPipe,
} from '@nestjs/common';
import { RentalListingsService } from './rental-listings.service';
import { CreateRentalListingDto } from './dto/create-rental-listing.dto';
import { UpdateRentalListingDto } from './dto/update-rental-listing.dto';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('rentals/listings')
export class RentalListingsController {
  constructor(private readonly rentalListingsService: RentalListingsService) {}

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(8), ParseIntPipe) limit: number,
    @Query('location') location?: string,
    @Query('minRent', new DefaultValuePipe(undefined))
    minRent?: string,
    @Query('maxRent', new DefaultValuePipe(undefined))
    maxRent?: string,
    @Query('bedrooms', new DefaultValuePipe(undefined))
    bedrooms?: string,
  ) {
    const minRentNum = minRent ? parseFloat(minRent) : undefined;
    const maxRentNum = maxRent ? parseFloat(maxRent) : undefined;
    const bedroomsNum = bedrooms ? parseInt(bedrooms) : undefined;

    return this.rentalListingsService.findAll(
      page,
      limit,
      location,
      minRentNum,
      maxRentNum,
      bedroomsNum,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.rentalListingsService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Body() createDto: CreateRentalListingDto,
    @Session() session: Record<string, any>,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const userId = session.userId;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.rentalListingsService.create(userId, createDto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateRentalListingDto,
    @Session() session: Record<string, any>,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const userId = session.userId;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.rentalListingsService.update(id, userId, updateDto);
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
    return this.rentalListingsService.remove(id, userId);
  }
}
