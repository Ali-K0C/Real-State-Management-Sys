import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LandlordStatsService {
  constructor(private prisma: PrismaService) {}

  async getStats(landlordId: string) {
    // Get all rental properties for landlord
    const rentalProperties = await this.prisma.rentalListing.findMany({
      where: {
        property: {
          userId: landlordId,
        },
        isActive: true,
      },
      include: {
        property: true,
        leases: {
          where: {
            status: 'ACTIVE',
          },
        },
      },
    });

    const totalRentalProperties = rentalProperties.length;
    const occupiedProperties = rentalProperties.filter(
      (listing) => listing.leases.length > 0,
    ).length;
    const vacantProperties = totalRentalProperties - occupiedProperties;

    // Get lease counts
    const [activeLeases, pendingLeases] = await Promise.all([
      this.prisma.rentalLease.count({
        where: {
          landlordId,
          status: 'ACTIVE',
        },
      }),
      this.prisma.rentalLease.count({
        where: {
          landlordId,
          status: 'PENDING',
        },
      }),
    ]);

    // Get overdue payments count
    const overduePaymentsCount = await this.prisma.rentPayment.count({
      where: {
        lease: {
          landlordId,
        },
        status: 'OVERDUE',
      },
    });

    // Get upcoming due payments (next 7 days)
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    const upcomingDue = await this.prisma.rentPayment.findMany({
      where: {
        lease: {
          landlordId,
        },
        status: 'DUE',
        dueDate: {
          gte: now,
          lte: futureDate,
        },
      },
      include: {
        lease: {
          include: {
            tenant: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            rentalListing: {
              include: {
                property: {
                  select: {
                    id: true,
                    title: true,
                    location: true,
                    address: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
      take: 10,
    });

    // Get top locations
    const properties = await this.prisma.property.findMany({
      where: {
        userId: landlordId,
        isForRent: true,
      },
      select: {
        location: true,
      },
    });

    const locationCounts: Record<string, number> = {};
    properties.forEach((prop) => {
      locationCounts[prop.location] = (locationCounts[prop.location] || 0) + 1;
    });

    const topLocations = Object.entries(locationCounts)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalRentalProperties,
      occupiedProperties,
      vacantProperties,
      activeLeases,
      pendingLeases,
      overduePaymentsCount,
      upcomingDue,
      topLocations,
    };
  }

  async getOverview(landlordId: string) {
    const rentalListings = await this.prisma.rentalListing.findMany({
      where: {
        property: {
          userId: landlordId,
        },
        isActive: true,
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            location: true,
            address: true,
            bedrooms: true,
            bathrooms: true,
          },
        },
        leases: {
          where: {
            status: 'ACTIVE',
          },
          include: {
            tenant: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            payments: {
              where: {
                status: {
                  in: ['DUE', 'OVERDUE'],
                },
              },
              orderBy: {
                dueDate: 'asc',
              },
              take: 1,
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return rentalListings.map((listing) => {
      const activeLease = listing.leases[0];
      const nextDuePayment = activeLease?.payments[0];

      return {
        listingId: listing.id,
        property: listing.property,
        monthlyRent: listing.monthlyRent,
        isOccupied: !!activeLease,
        currentLease: activeLease
          ? {
              id: activeLease.id,
              tenant: activeLease.tenant,
              status: activeLease.status,
              startDate: activeLease.startDate,
              endDate: activeLease.endDate,
            }
          : null,
        nextDueDate: nextDuePayment?.dueDate || null,
        nextDueAmount: nextDuePayment?.amount || null,
        nextDueStatus: nextDuePayment?.status || null,
      };
    });
  }
}
