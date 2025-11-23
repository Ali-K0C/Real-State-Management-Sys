import { Test, TestingModule } from '@nestjs/testing';
import { PropertyService } from './property.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

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
        },
      ];

      mockPrismaService.property.findMany.mockResolvedValue(mockProperties);
      mockPrismaService.property.count.mockResolvedValue(1);

      const result = await service.findAll(1, 8);

      expect(result).toEqual({
        properties: mockProperties.map((p) => ({
          ...p,
          price: Number(p.price),
        })),
        total: 1,
        page: 1,
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
  });

  describe('findOne', () => {
    it('should return a property with user details', async () => {
      const mockProperty = {
        id: '1',
        title: 'Test Property',
        price: 5000000,
        user: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          contactNo: '1234567890',
        },
      };

      mockPrismaService.property.findUnique.mockResolvedValue(mockProperty);

      const result = await service.findOne('1');

      expect(result).toEqual({ ...mockProperty, price: 5000000 });
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
        ...createDto,
      };

      mockPrismaService.property.create.mockResolvedValue(mockCreatedProperty);

      const result = await service.create('user1', createDto);

      expect(result).toEqual({ ...mockCreatedProperty, price: 5000000 });
      expect(mockPrismaService.property.create).toHaveBeenCalledWith({
        data: {
          ...createDto,
          userId: 'user1',
        },
      });
    });
  });

  describe('update', () => {
    it('should update a property if user owns it', async () => {
      const updateDto = { title: 'Updated Title' };
      const mockProperty = { id: '1', userId: 'user1', title: 'Old Title' };
      const mockUpdatedProperty = { ...mockProperty, ...updateDto };

      mockPrismaService.property.findUnique.mockResolvedValue(mockProperty);
      mockPrismaService.property.update.mockResolvedValue(mockUpdatedProperty);

      const result = await service.update('1', 'user1', updateDto);

      expect(result).toEqual({
        ...mockUpdatedProperty,
        price: Number(mockUpdatedProperty.price),
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
        { id: '1', userId: 'user1', title: 'Property 1', price: 5000000 },
        { id: '2', userId: 'user1', title: 'Property 2', price: 6000000 },
      ];

      mockPrismaService.property.findMany.mockResolvedValue(mockProperties);

      const result = await service.findByUser('user1');

      expect(result).toEqual(
        mockProperties.map((p) => ({ ...p, price: Number(p.price) })),
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
        .mockResolvedValueOnce(5); // userListings

      const result = await service.getStats('user1');

      expect(result).toEqual({
        totalProperties: 100,
        userListings: 5,
      });
    });

    it('should return stats without user listings if no userId', async () => {
      mockPrismaService.property.count.mockResolvedValue(100);

      const result = await service.getStats();

      expect(result).toEqual({
        totalProperties: 100,
        userListings: 0,
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

      expect(result).toEqual([
        { location: 'Karachi', count: 15 },
        { location: 'Lahore', count: 10 },
      ]);
      expect(mockPrismaService.property.groupBy).toHaveBeenCalled();
    });
  });
});
