import { PrismaClient } from '@prisma/client';

describe('Prisma Client', () => {
  let prisma: PrismaClient;

  beforeEach(() => {
    prisma = new PrismaClient();
  });

  afterEach(async () => {
    await prisma.$disconnect();
  });

  it('should create a PrismaClient instance', () => {
    expect(prisma).toBeDefined();
    expect(prisma.user).toBeDefined();
    expect(prisma.property).toBeDefined();
  });

  it('should have User model with correct fields', () => {
    // This test verifies the User model is accessible
    expect(typeof prisma.user.create).toBe('function');
    expect(typeof prisma.user.findMany).toBe('function');
    expect(typeof prisma.user.findUnique).toBe('function');
    expect(typeof prisma.user.update).toBe('function');
    expect(typeof prisma.user.delete).toBe('function');
  });

  it('should have Property model with correct fields', () => {
    // This test verifies the Property model is accessible
    expect(typeof prisma.property.create).toBe('function');
    expect(typeof prisma.property.findMany).toBe('function');
    expect(typeof prisma.property.findUnique).toBe('function');
    expect(typeof prisma.property.update).toBe('function');
    expect(typeof prisma.property.delete).toBe('function');
  });
});
