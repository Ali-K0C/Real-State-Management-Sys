import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create 10 sample users
  // Note: Passwords are stored as plain text per project requirements
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'ahmed.khan@example.com',
        password: 'password123',
        firstName: 'Ahmed',
        lastName: 'Khan',
        contactNo: '+92-300-1234567',
      },
    }),
    prisma.user.create({
      data: {
        email: 'fatima.ali@example.com',
        password: 'password123',
        firstName: 'Fatima',
        lastName: 'Ali',
        contactNo: '+92-301-2345678',
      },
    }),
    prisma.user.create({
      data: {
        email: 'hassan.raza@example.com',
        password: 'password123',
        firstName: 'Hassan',
        lastName: 'Raza',
        contactNo: '+92-302-3456789',
      },
    }),
    prisma.user.create({
      data: {
        email: 'ayesha.shah@example.com',
        password: 'password123',
        firstName: 'Ayesha',
        lastName: 'Shah',
        contactNo: '+92-303-4567890',
      },
    }),
    prisma.user.create({
      data: {
        email: 'usman.malik@example.com',
        password: 'password123',
        firstName: 'Usman',
        lastName: 'Malik',
        contactNo: '+92-304-5678901',
      },
    }),
    prisma.user.create({
      data: {
        email: 'zainab.hussain@example.com',
        password: 'password123',
        firstName: 'Zainab',
        lastName: 'Hussain',
        contactNo: '+92-305-6789012',
      },
    }),
    prisma.user.create({
      data: {
        email: 'bilal.ahmed@example.com',
        password: 'password123',
        firstName: 'Bilal',
        lastName: 'Ahmed',
        contactNo: '+92-306-7890123',
      },
    }),
    prisma.user.create({
      data: {
        email: 'mariam.saeed@example.com',
        password: 'password123',
        firstName: 'Mariam',
        lastName: 'Saeed',
        contactNo: '+92-307-8901234',
      },
    }),
    prisma.user.create({
      data: {
        email: 'imran.farooq@example.com',
        password: 'password123',
        firstName: 'Imran',
        lastName: 'Farooq',
        contactNo: '+92-308-9012345',
      },
    }),
    prisma.user.create({
      data: {
        email: 'sana.iqbal@example.com',
        password: 'password123',
        firstName: 'Sana',
        lastName: 'Iqbal',
        contactNo: '+92-309-0123456',
      },
    }),
  ]);

  console.log(`Created ${users.length} users`);

  // Create 40 properties with realistic data
  const properties = [
    // Karachi Properties (10)
    {
      userId: users[0].id,
      title: 'Luxury Apartment in Clifton',
      description:
        'Beautiful 3-bedroom apartment with sea view, modern amenities, and parking space. Located in the heart of Clifton.',
      price: 15000000,
      location: 'Karachi',
      address: 'Block 2, Clifton, Karachi',
      propertyType: 'Apartment',
      bedrooms: 3,
      bathrooms: 3,
      areaSqft: 1800,
      status: 'Available',
    },
    {
      userId: users[1].id,
      title: 'Spacious House in Defence',
      description:
        'Large 5-bedroom house with garden, basement, and modern kitchen. Perfect for families.',
      price: 45000000,
      location: 'Karachi',
      address: 'Phase 6, DHA, Karachi',
      propertyType: 'House',
      bedrooms: 5,
      bathrooms: 4,
      areaSqft: 4500,
      status: 'Available',
    },
    {
      userId: users[2].id,
      title: 'Commercial Plaza in Saddar',
      description:
        'Prime location commercial building suitable for offices, shops, or restaurants.',
      price: 75000000,
      location: 'Karachi',
      address: 'M.A. Jinnah Road, Saddar, Karachi',
      propertyType: 'Commercial',
      bedrooms: 0,
      bathrooms: 6,
      areaSqft: 8000,
      status: 'Sold',
    },
    {
      userId: users[0].id,
      title: 'Residential Plot in Bahria Town',
      description:
        '500 sq yards residential plot in a developed sector with all amenities nearby.',
      price: 12000000,
      location: 'Karachi',
      address: 'Precinct 10, Bahria Town, Karachi',
      propertyType: 'Land',
      bedrooms: 0,
      bathrooms: 0,
      areaSqft: 4500,
      status: 'Available',
    },
    {
      userId: users[3].id,
      title: 'Modern Apartment in Gulshan-e-Iqbal',
      description:
        'Well-maintained 2-bedroom apartment with lift, security, and backup generator.',
      price: 9500000,
      location: 'Karachi',
      address: 'Block 13-D, Gulshan-e-Iqbal, Karachi',
      propertyType: 'Apartment',
      bedrooms: 2,
      bathrooms: 2,
      areaSqft: 1200,
      status: 'Available',
    },
    {
      userId: users[1].id,
      title: 'Villa in Malir Cantonment',
      description:
        'Luxurious 4-bedroom villa with swimming pool, lawn, and servant quarters.',
      price: 38000000,
      location: 'Karachi',
      address: 'Sector C, Malir Cantonment, Karachi',
      propertyType: 'House',
      bedrooms: 4,
      bathrooms: 4,
      areaSqft: 3800,
      status: 'Sold',
    },
    {
      userId: users[4].id,
      title: 'Studio Apartment in Nazimabad',
      description:
        'Affordable studio apartment ideal for bachelors or small families.',
      price: 5500000,
      location: 'Karachi',
      address: 'Block 3, Nazimabad, Karachi',
      propertyType: 'Apartment',
      bedrooms: 1,
      bathrooms: 1,
      areaSqft: 600,
      status: 'Available',
    },
    {
      userId: users[2].id,
      title: 'Commercial Shop in Tariq Road',
      description:
        'Prime location shop on ground floor, suitable for retail business.',
      price: 18000000,
      location: 'Karachi',
      address: 'Tariq Road, PECHS, Karachi',
      propertyType: 'Commercial',
      bedrooms: 0,
      bathrooms: 1,
      areaSqft: 800,
      status: 'Available',
    },
    {
      userId: users[5].id,
      title: 'Penthouse in Emaar Crescent Bay',
      description:
        'Ultra-luxury penthouse with panoramic sea views and premium finishes.',
      price: 85000000,
      location: 'Karachi',
      address: 'Crescent Bay, DHA Phase 8, Karachi',
      propertyType: 'Apartment',
      bedrooms: 4,
      bathrooms: 4,
      areaSqft: 3500,
      status: 'Sold',
    },
    {
      userId: users[3].id,
      title: 'Corner Plot in Scheme 33',
      description:
        '300 sq yards corner plot with extra wide road, ready for construction.',
      price: 8500000,
      location: 'Karachi',
      address: 'Sector 27-A, Scheme 33, Karachi',
      propertyType: 'Land',
      bedrooms: 0,
      bathrooms: 0,
      areaSqft: 2700,
      status: 'Available',
    },

    // Lahore Properties (10)
    {
      userId: users[4].id,
      title: 'Modern Apartment in Bahria Town',
      description:
        'Brand new 3-bedroom apartment in gated community with all facilities.',
      price: 13500000,
      location: 'Lahore',
      address: 'Sector C, Bahria Town, Lahore',
      propertyType: 'Apartment',
      bedrooms: 3,
      bathrooms: 3,
      areaSqft: 1600,
      status: 'Available',
    },
    {
      userId: users[5].id,
      title: 'Heritage House in Gulberg',
      description:
        'Classic 4-bedroom house with spacious rooms and traditional architecture.',
      price: 42000000,
      location: 'Lahore',
      address: 'Block M, Gulberg III, Lahore',
      propertyType: 'House',
      bedrooms: 4,
      bathrooms: 3,
      areaSqft: 3600,
      status: 'Available',
    },
    {
      userId: users[6].id,
      title: 'Office Space in DHA',
      description:
        'Modern office space suitable for tech companies or corporate offices.',
      price: 28000000,
      location: 'Lahore',
      address: 'Y Block, DHA Phase 3, Lahore',
      propertyType: 'Commercial',
      bedrooms: 0,
      bathrooms: 3,
      areaSqft: 2500,
      status: 'Available',
    },
    {
      userId: users[4].id,
      title: 'Residential Plot in Lake City',
      description:
        'Well-located 10 marla plot in developed sector near park and mosque.',
      price: 11000000,
      location: 'Lahore',
      address: 'M3 Block, Lake City, Lahore',
      propertyType: 'Land',
      bedrooms: 0,
      bathrooms: 0,
      areaSqft: 2250,
      status: 'Sold',
    },
    {
      userId: users[7].id,
      title: 'Compact Apartment in Johar Town',
      description:
        '2-bedroom apartment in family-friendly neighborhood with good transport links.',
      price: 8800000,
      location: 'Lahore',
      address: 'Phase 2, Johar Town, Lahore',
      propertyType: 'Apartment',
      bedrooms: 2,
      bathrooms: 2,
      areaSqft: 1100,
      status: 'Available',
    },
    {
      userId: users[5].id,
      title: 'Luxury Bungalow in Model Town',
      description:
        '5-bedroom bungalow with basement, lawn, and premium location.',
      price: 55000000,
      location: 'Lahore',
      address: 'Block L, Model Town, Lahore',
      propertyType: 'House',
      bedrooms: 5,
      bathrooms: 5,
      areaSqft: 5000,
      status: 'Sold',
    },
    {
      userId: users[8].id,
      title: 'Affordable Flat in Wapda Town',
      description:
        'Budget-friendly 2-bedroom flat with basic amenities and parking.',
      price: 6500000,
      location: 'Lahore',
      address: 'Block E, Wapda Town, Lahore',
      propertyType: 'Apartment',
      bedrooms: 2,
      bathrooms: 2,
      areaSqft: 950,
      status: 'Available',
    },
    {
      userId: users[6].id,
      title: 'Showroom in MM Alam Road',
      description:
        'Premium showroom location ideal for car dealership or luxury goods.',
      price: 95000000,
      location: 'Lahore',
      address: 'MM Alam Road, Gulberg, Lahore',
      propertyType: 'Commercial',
      bedrooms: 0,
      bathrooms: 2,
      areaSqft: 4000,
      status: 'Available',
    },
    {
      userId: users[9].id,
      title: 'Penthouse in Emaar Canyon Views',
      description:
        'Exclusive penthouse with terrace, jacuzzi, and breathtaking city views.',
      price: 72000000,
      location: 'Lahore',
      address: 'Canyon Views, DHA Phase 5, Lahore',
      propertyType: 'Apartment',
      bedrooms: 4,
      bathrooms: 4,
      areaSqft: 3200,
      status: 'Available',
    },
    {
      userId: users[7].id,
      title: 'Farm House Plot in Barki Road',
      description:
        '2 kanal agricultural land suitable for farm house development.',
      price: 15000000,
      location: 'Lahore',
      address: 'Barki Road, Lahore',
      propertyType: 'Land',
      bedrooms: 0,
      bathrooms: 0,
      areaSqft: 9000,
      status: 'Available',
    },

    // Islamabad Properties (8)
    {
      userId: users[8].id,
      title: 'Luxury Apartment in F-11',
      description:
        'High-end 3-bedroom apartment with mountain views and premium finishes.',
      price: 18500000,
      location: 'Islamabad',
      address: 'F-11 Markaz, Islamabad',
      propertyType: 'Apartment',
      bedrooms: 3,
      bathrooms: 3,
      areaSqft: 1900,
      status: 'Available',
    },
    {
      userId: users[9].id,
      title: 'Modern House in E-11',
      description:
        '4-bedroom house with contemporary design and smart home features.',
      price: 48000000,
      location: 'Islamabad',
      address: 'E-11/3, Islamabad',
      propertyType: 'House',
      bedrooms: 4,
      bathrooms: 4,
      areaSqft: 4200,
      status: 'Available',
    },
    {
      userId: users[0].id,
      title: 'Corporate Office in Blue Area',
      description:
        'Premium office space in the heart of Islamabad business district.',
      price: 65000000,
      location: 'Islamabad',
      address: 'Jinnah Avenue, Blue Area, Islamabad',
      propertyType: 'Commercial',
      bedrooms: 0,
      bathrooms: 4,
      areaSqft: 3500,
      status: 'Sold',
    },
    {
      userId: users[8].id,
      title: 'Residential Plot in DHA Phase 2',
      description:
        '1 kanal plot in prime location with all utilities available.',
      price: 35000000,
      location: 'Islamabad',
      address: 'Sector S, DHA Phase 2, Islamabad',
      propertyType: 'Land',
      bedrooms: 0,
      bathrooms: 0,
      areaSqft: 4500,
      status: 'Available',
    },
    {
      userId: users[1].id,
      title: 'Studio in F-10',
      description:
        'Cozy studio apartment perfect for professionals and students.',
      price: 7200000,
      location: 'Islamabad',
      address: 'F-10/4, Islamabad',
      propertyType: 'Apartment',
      bedrooms: 1,
      bathrooms: 1,
      areaSqft: 650,
      status: 'Available',
    },
    {
      userId: users[9].id,
      title: 'Villa in Bahria Enclave',
      description:
        '5-bedroom villa with pool, home theater, and landscaped garden.',
      price: 68000000,
      location: 'Islamabad',
      address: 'Sector B, Bahria Enclave, Islamabad',
      propertyType: 'House',
      bedrooms: 5,
      bathrooms: 5,
      areaSqft: 5500,
      status: 'Sold',
    },
    {
      userId: users[2].id,
      title: 'Shopping Mall Unit in G-11',
      description:
        'Ground floor retail unit in busy shopping center with high foot traffic.',
      price: 22000000,
      location: 'Islamabad',
      address: 'G-11 Markaz, Islamabad',
      propertyType: 'Commercial',
      bedrooms: 0,
      bathrooms: 1,
      areaSqft: 1200,
      status: 'Available',
    },
    {
      userId: users[3].id,
      title: 'Corner Plot in Bahria Town Phase 7',
      description:
        '10 marla corner plot with park facing and wide road access.',
      price: 16500000,
      location: 'Islamabad',
      address: 'Sector C, Bahria Town Phase 7, Islamabad',
      propertyType: 'Land',
      bedrooms: 0,
      bathrooms: 0,
      areaSqft: 2250,
      status: 'Available',
    },

    // Rawalpindi Properties (6)
    {
      userId: users[3].id,
      title: 'Family Apartment in Bahria Town Phase 4',
      description:
        '3-bedroom apartment with community amenities and security.',
      price: 11000000,
      location: 'Rawalpindi',
      address: 'Phase 4, Bahria Town, Rawalpindi',
      propertyType: 'Apartment',
      bedrooms: 3,
      bathrooms: 2,
      areaSqft: 1400,
      status: 'Available',
    },
    {
      userId: users[4].id,
      title: 'Traditional House in Satellite Town',
      description:
        '4-bedroom traditional house with separate servant quarters.',
      price: 32000000,
      location: 'Rawalpindi',
      address: 'Block G, Satellite Town, Rawalpindi',
      propertyType: 'House',
      bedrooms: 4,
      bathrooms: 3,
      areaSqft: 3200,
      status: 'Available',
    },
    {
      userId: users[5].id,
      title: 'Warehouse in I-10 Industrial Area',
      description:
        'Large warehouse facility with loading docks and office space.',
      price: 45000000,
      location: 'Rawalpindi',
      address: 'I-10 Industrial Area, Rawalpindi',
      propertyType: 'Commercial',
      bedrooms: 0,
      bathrooms: 2,
      areaSqft: 6000,
      status: 'Sold',
    },
    {
      userId: users[6].id,
      title: 'Residential Plot in Gulraiz Housing',
      description:
        '8 marla plot in developed society with mosque and park nearby.',
      price: 8500000,
      location: 'Rawalpindi',
      address: 'Phase 2, Gulraiz Housing, Rawalpindi',
      propertyType: 'Land',
      bedrooms: 0,
      bathrooms: 0,
      areaSqft: 1800,
      status: 'Available',
    },
    {
      userId: users[7].id,
      title: 'Budget Flat in Westridge',
      description:
        '2-bedroom flat in established area with good access to amenities.',
      price: 5800000,
      location: 'Rawalpindi',
      address: 'Westridge 2, Rawalpindi',
      propertyType: 'Apartment',
      bedrooms: 2,
      bathrooms: 2,
      areaSqft: 900,
      status: 'Available',
    },
    {
      userId: users[8].id,
      title: 'Restaurant Space in Saddar',
      description:
        'Well-established restaurant location with existing kitchen setup.',
      price: 25000000,
      location: 'Rawalpindi',
      address: 'Saddar Bazaar, Rawalpindi',
      propertyType: 'Commercial',
      bedrooms: 0,
      bathrooms: 2,
      areaSqft: 1800,
      status: 'Available',
    },

    // Faisalabad Properties (6)
    {
      userId: users[9].id,
      title: 'Modern Apartment in Eden Valley',
      description:
        'Contemporary 3-bedroom apartment in gated community with pool.',
      price: 10500000,
      location: 'Faisalabad',
      address: 'Eden Valley, Faisalabad',
      propertyType: 'Apartment',
      bedrooms: 3,
      bathrooms: 2,
      areaSqft: 1500,
      status: 'Available',
    },
    {
      userId: users[0].id,
      title: 'Spacious House in Canal Road',
      description:
        '4-bedroom house with large drawing room and well-maintained lawn.',
      price: 28000000,
      location: 'Faisalabad',
      address: 'Canal Road, Faisalabad',
      propertyType: 'House',
      bedrooms: 4,
      bathrooms: 3,
      areaSqft: 3000,
      status: 'Available',
    },
    {
      userId: users[1].id,
      title: 'Textile Factory Unit',
      description:
        'Industrial unit suitable for textile manufacturing with power backup.',
      price: 52000000,
      location: 'Faisalabad',
      address: 'Jhang Road Industrial Estate, Faisalabad',
      propertyType: 'Commercial',
      bedrooms: 0,
      bathrooms: 3,
      areaSqft: 7500,
      status: 'Sold',
    },
    {
      userId: users[2].id,
      title: 'Agricultural Land Near Samundri',
      description:
        '5 acre agricultural land with tube well and electricity connection.',
      price: 18000000,
      location: 'Faisalabad',
      address: 'Samundri Road, Faisalabad',
      propertyType: 'Land',
      bedrooms: 0,
      bathrooms: 0,
      areaSqft: 217800,
      status: 'Available',
    },
    {
      userId: users[3].id,
      title: 'Apartment in Susan Road',
      description:
        '2-bedroom apartment in central location with elevator and parking.',
      price: 7500000,
      location: 'Faisalabad',
      address: 'Susan Road, Faisalabad',
      propertyType: 'Apartment',
      bedrooms: 2,
      bathrooms: 2,
      areaSqft: 1000,
      status: 'Available',
    },
    {
      userId: users[4].id,
      title: 'Plaza in D Ground',
      description:
        'Commercial plaza with shops on ground floor and offices on upper floors.',
      price: 38000000,
      location: 'Faisalabad',
      address: 'D Ground, Faisalabad',
      propertyType: 'Commercial',
      bedrooms: 0,
      bathrooms: 5,
      areaSqft: 5000,
      status: 'Available',
    },
  ];

  for (const property of properties) {
    await prisma.property.create({
      data: property,
    });
  }

  console.log(`Created ${properties.length} properties`);
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
