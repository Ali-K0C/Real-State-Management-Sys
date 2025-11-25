import { Test, TestingModule } from '@nestjs/testing';
import { PropertyService } from './property.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ListingType } from './dto/create-property.dto';

describe('PropertyService', () => {
  let service: PropertyService;

  const mockPrismaService = {
    property: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertyService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PropertyService>(PropertyService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated properties', async () => {
      const mockProperties = [
        {
          id: '1',
          title: 'Test Property',
          price: 5000000,
          location: 'Karachi',
          monthlyRent: null,
          securityDeposit: null,
        },
      ];

      mockPrismaService.property.findMany.mockResolvedValue(mockProperties);
      mockPrismaService.property.count.mockResolvedValue(1);

      const result = await service.findAll(1, 8);

      expect(result).toEqual({
        data: mockProperties.map((p) => ({
          ...p,
          price: Number(p.price),
          monthlyRent: null,
          securityDeposit: null,
        })),
        total: 1,
        page: 1,
        limit: 8,
        totalPages: 1,
      });
      expect(mockPrismaService.property.findMany).toHaveBeenCalled();
      expect(mockPrismaService.property.count).toHaveBeenCalled();
    });

    it('should filter by location', async () => {
      mockPrismaService.property.findMany.mockResolvedValue([]);
      mockPrismaService.property.count.mockResolvedValue(0);

      await service.findAll(1, 8, undefined, undefined, 'Karachi');

      expect(mockPrismaService.property.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { location: 'Karachi' },
        }),
      );
    });

    it('should filter by listingType', async () => {
      mockPrismaService.property.findMany.mockResolvedValue([]);
      mockPrismaService.property.count.mockResolvedValue(0);

      await service.findAll(1, 8, undefined, undefined, undefined, 'FOR_RENT');

      expect(mockPrismaService.property.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { listingType: 'FOR_RENT' },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a property with user details', async () => {
      const mockProperty = {
        id: '1',
        title: 'Test Property',
        price: 5000000,
        monthlyRent: null,
        securityDeposit: null,
        user: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          contactNo: '1234567890',
        },
      };

      mockPrismaService.property.findUnique.mockResolvedValue(mockProperty);

      const result = await service.findOne('1');

      expect(result).toEqual({ ...mockProperty, price: 5000000, monthlyRent: null, securityDeposit: null });
      expect(mockPrismaService.property.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              contactNo: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException if property not found', async () => {
      mockPrismaService.property.findUnique.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new property', async () => {
      const createDto = {
        title: 'New Property',
        description: 'A new property',
        price: 5000000,
        location: 'Karachi',
        address: '123 Main St',
        propertyType: 'Apartment' as const,
        bedrooms: 3,
        bathrooms: 2,
        areaSqft: 1500,
        status: 'Available' as const,
      };

      const mockCreatedProperty = {
        id: '1',
        userId: 'user1',
        monthlyRent: null,
        securityDeposit: null,
        ...createDto,
      };

      mockPrismaService.property.create.mockResolvedValue(mockCreatedProperty);

      const result = await service.create('user1', createDto);

      expect(result).toEqual({ ...mockCreatedProperty, price: 5000000, monthlyRent: null, securityDeposit: null });
      expect(mockPrismaService.property.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if FOR_RENT listing is missing rental fields', async () => {
      const createDto = {
        title: 'Rental Property',
        description: 'A rental property',
        price: 5000000,
        location: 'Karachi',
        address: '123 Main St',
        propertyType: 'Apartment' as const,
        bedrooms: 3,
        bathrooms: 2,
        areaSqft: 1500,
        status: 'Available' as const,
        listingType: ListingType.FOR_RENT,
      };

      await expect(service.create('user1', createDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should create FOR_RENT property with rental fields', async () => {
      const createDto = {
        title: 'Rental Property',
        description: 'A rental property',
        price: 5000000,
        location: 'Karachi',
        address: '123 Main St',
        propertyType: 'Apartment' as const,
        bedrooms: 3,
        bathrooms: 2,
        areaSqft: 1500,
        status: 'Available' as const,
        listingType: ListingType.FOR_RENT,
        monthlyRent: 1500,
        securityDeposit: 3000,
        availableFrom: '2024-01-01',
      };

      const mockCreatedProperty = {
        id: '1',
        userId: 'user1',
        ...createDto,
        availableFrom: new Date('2024-01-01'),
      };

      mockPrismaService.property.create.mockResolvedValue(mockCreatedProperty);

      const result = await service.create('user1', createDto);

      expect(result).toEqual({
        ...mockCreatedProperty,
        price: 5000000,
        monthlyRent: 1500,
        securityDeposit: 3000,
      });
      expect(mockPrismaService.property.create).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a property if user owns it', async () => {
      const updateDto = { title: 'Updated Title' };
      const mockProperty = { id: '1', userId: 'user1', title: 'Old Title', price: 5000000 };
      const mockUpdatedProperty = { ...mockProperty, ...updateDto, monthlyRent: null, securityDeposit: null };

      mockPrismaService.property.findUnique.mockResolvedValue(mockProperty);
      mockPrismaService.property.update.mockResolvedValue(mockUpdatedProperty);

      const result = await service.update('1', 'user1', updateDto);

      expect(result).toEqual({
        ...mockUpdatedProperty,
        price: Number(mockUpdatedProperty.price),
        monthlyRent: null,
        securityDeposit: null,
      });
      expect(mockPrismaService.property.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateDto,
      });
    });

    it('should throw NotFoundException if property not found', async () => {
      mockPrismaService.property.findUnique.mockResolvedValue(null);

      await expect(service.update('999', 'user1', {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user does not own property', async () => {
      const mockProperty = { id: '1', userId: 'user1' };
      mockPrismaService.property.findUnique.mockResolvedValue(mockProperty);

      await expect(service.update('1', 'user2', {})).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a property if user owns it', async () => {
      const mockProperty = { id: '1', userId: 'user1' };
      mockPrismaService.property.findUnique.mockResolvedValue(mockProperty);
      mockPrismaService.property.delete.mockResolvedValue(mockProperty);

      const result = await service.remove('1', 'user1');

      expect(result).toEqual({ message: 'Property deleted successfully' });
      expect(mockPrismaService.property.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException if property not found', async () => {
      mockPrismaService.property.findUnique.mockResolvedValue(null);

      await expect(service.remove('999', 'user1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user does not own property', async () => {
      const mockProperty = { id: '1', userId: 'user1' };
      mockPrismaService.property.findUnique.mockResolvedValue(mockProperty);

      await expect(service.remove('1', 'user2')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findByUser', () => {
    it('should return all properties for a user', async () => {
      const mockProperties = [
        { id: '1', userId: 'user1', title: 'Property 1', price: 5000000, monthlyRent: null, securityDeposit: null },
        { id: '2', userId: 'user1', title: 'Property 2', price: 6000000, monthlyRent: null, securityDeposit: null },
      ];

      mockPrismaService.property.findMany.mockResolvedValue(mockProperties);

      const result = await service.findByUser('user1');

      expect(result).toEqual(
        mockProperties.map((p) => ({ ...p, price: Number(p.price), monthlyRent: null, securityDeposit: null })),
      );
      expect(mockPrismaService.property.findMany).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('getStats', () => {
    it('should return stats with user listings if userId provided', async () => {
      mockPrismaService.property.count
        .mockResolvedValueOnce(100) // totalProperties
        .mockResolvedValueOnce(5); // myActiveListings

      const result = await service.getStats('user1');

      expect(result).toEqual({
        totalProperties: 100,
        myActiveListings: 5,
      });
    });

    it('should return stats without user listings if no userId', async () => {
      mockPrismaService.property.count.mockResolvedValue(100);

      const result = await service.getStats();

      expect(result).toEqual({
        totalProperties: 100,
        myActiveListings: 0,
      });
    });
  });

  describe('getLocations', () => {
    it('should return unique locations with counts', async () => {
      const mockLocations = [
        { location: 'Karachi', _count: { location: 15 } },
        { location: 'Lahore', _count: { location: 10 } },
      ];

      mockPrismaService.property.groupBy.mockResolvedValue(mockLocations);

      const result = await service.getLocations();

      expect(result).toEqual(['Karachi', 'Lahore']);
      expect(mockPrismaService.property.groupBy).toHaveBeenCalled();
    });
  });

  describe('buyProperty', () => {
    it('should successfully purchase a property', async () => {
      const mockProperty = {
        id: '1',
        userId: 'seller1',
        title: 'Test Property',
        price: 5000000,
        status: 'Available',
        monthlyRent: null,
        securityDeposit: null,
      };
      const mockUpdatedProperty = { ...mockProperty, status: 'Sold' };

      mockPrismaService.property.findUnique.mockResolvedValue(mockProperty);
      mockPrismaService.property.update.mockResolvedValue(mockUpdatedProperty);

      const result = await service.buyProperty('1', 'buyer1');

      expect(result).toEqual({
        ...mockUpdatedProperty,
        price: Number(mockUpdatedProperty.price),
        monthlyRent: null,
        securityDeposit: null,
      });
      expect(mockPrismaService.property.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { status: 'Sold' },
      });
    });

    it('should throw NotFoundException if property not found', async () => {
      mockPrismaService.property.findUnique.mockResolvedValue(null);

      await expect(service.buyProperty('999', 'buyer1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user tries to buy own property', async () => {
      const mockProperty = {
        id: '1',
        userId: 'user1',
        status: 'Available',
      };
      mockPrismaService.property.findUnique.mockResolvedValue(mockProperty);

      await expect(service.buyProperty('1', 'user1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException if property is already sold', async () => {
      const mockProperty = {
        id: '1',
        userId: 'seller1',
        status: 'Sold',
      };
      mockPrismaService.property.findUnique.mockResolvedValue(mockProperty);

      await expect(service.buyProperty('1', 'buyer1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
