# Real Estate Management System

A comprehensive property management system built with NestJS (backend) and Next.js (frontend) that handles both property sales and rental management with automated notifications.

## Features

### Property Buy/Sell Management
- Browse and search property listings
- Create and manage property listings
- User authentication and authorization
- Property filtering and pagination
- User dashboard with statistics

### Rental Management System 🆕
- **Public Rental Listings**: Browse available rental properties with advanced filtering
- **Landlord Dashboard**: Comprehensive stats and management tools
- **Lease Management**: Create and track rental agreements with automatic payment schedules
- **Rent Payment Tracking**: Monitor payments with DUE, PAID, OVERDUE, and WAIVED statuses
- **Automated Email Notifications**: Rent due reminders and overdue alerts
- **Maintenance Requests**: Track property maintenance with status and priority
- **Role-Based Access**: Automatic LANDLORD role promotion and access control

## Tech Stack

### Backend
- **Framework**: NestJS 11.x
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Session-based auth with express-session
- **Email**: Nodemailer with HTML templates
- **Scheduling**: @nestjs/schedule for cron jobs
- **Validation**: class-validator, class-transformer

### Frontend
- **Framework**: Next.js 16.x with React 19
- **Styling**: Tailwind CSS 4.x
- **TypeScript**: Full type safety
- **API Communication**: Fetch with credential support

## Project Structure

```
.
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   ├── migrations/            # Database migrations
│   │   └── seed.ts                # Seed data
│   ├── src/
│   │   ├── auth/                  # Authentication module
│   │   ├── property/              # Property management
│   │   ├── rental-listings/       # Rental listings module
│   │   ├── rental-leases/         # Lease management
│   │   ├── rent-payments/         # Payment tracking
│   │   ├── landlord-stats/        # Landlord statistics
│   │   ├── maintenance/           # Maintenance requests
│   │   ├── mail/                  # Email service
│   │   │   └── templates/         # HTML email templates
│   │   ├── scheduler/             # Cron jobs
│   │   └── prisma/                # Prisma service
│   └── test/                      # Tests
├── frontend/
│   ├── src/
│   │   ├── app/                   # Next.js pages
│   │   │   ├── properties/        # Property pages
│   │   │   ├── rentals/           # Rental pages
│   │   │   ├── rental-tracker/    # Landlord dashboard
│   │   │   └── auth/              # Auth pages
│   │   ├── components/            # Reusable components
│   │   │   ├── layout/           # Layout components
│   │   │   ├── property/         # Property components
│   │   │   └── rental/           # Rental components
│   │   ├── context/               # React contexts
│   │   ├── hooks/                 # Custom hooks
│   │   ├── lib/                   # Utilities
│   │   │   ├── api.ts            # API client
│   │   │   └── rental-api.ts     # Rental API client
│   │   └── types/                 # TypeScript types
│   └── public/                    # Static assets
└── docs/
    └── rentals.md                 # Rental system documentation
```

## Installation & Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Backend Setup

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"
   SESSION_SECRET="your-secret-key"
   
   # Email configuration
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   MAIL_FROM="Rent Tracker <no-reply@yourapp.com>"
   
   # Rent notifications
   RENT_UPCOMING_WINDOW_DAYS=3
   ```

3. **Setup database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

4. **Seed database (optional)**
   ```bash
   npx prisma db seed
   ```

5. **Run development server**
   ```bash
   npm run start:dev
   ```
   Backend runs on `http://localhost:4000`

### Frontend Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment**
   ```bash
   # Create .env.local
   echo "NEXT_PUBLIC_API_URL=http://localhost:4000" > .env.local
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```
   Frontend runs on `http://localhost:3000`

## Usage

### User Registration & Authentication
1. Navigate to `/auth/register` to create an account
2. Login at `/auth/login`
3. Access dashboard at `/dashboard`

### Property Management (Buy/Sell)
1. Browse properties at `/properties`
2. Create listings at `/my-listings` (requires auth)
3. View property details at `/properties/[id]`

### Rental Management
1. **Browse Rentals** (Public)
   - Go to `/rentals`
   - Filter by location, rent range, bedrooms
   - View details at `/rentals/[id]`

2. **Create Rental Listing** (Landlord)
   - Create a property first
   - POST to `/rentals/listings` with property details
   - User automatically promoted to LANDLORD role

3. **Landlord Dashboard** (Landlord Only)
   - Access at `/rental-tracker`
   - View statistics, upcoming payments, property distribution
   - Navigate to properties, leases, maintenance

4. **Manage Leases**
   - Create lease for tenant
   - Activate lease to generate payment schedule
   - Track lease status and payments

5. **Payment Tracking**
   - View all payments for a lease
   - Mark payments as paid with method and notes
   - Waive payments if needed
   - System auto-marks overdue payments

6. **Maintenance Requests**
   - Create requests for properties
   - Update status and add notes
   - View all requests by property

## API Documentation

See [docs/rentals.md](docs/rentals.md) for comprehensive API documentation.

### Key Endpoints

**Authentication**
- POST `/auth/register` - Register new user
- POST `/auth/login` - Login
- POST `/auth/logout` - Logout
- GET `/auth/me` - Get current user

**Properties**
- GET `/properties` - List properties
- POST `/properties` - Create property
- GET `/properties/:id` - Get property details
- PUT `/properties/:id` - Update property
- DELETE `/properties/:id` - Delete property

**Rental Listings**
- GET `/rentals/listings` - List rental properties
- POST `/rentals/listings` - Create rental listing
- GET `/rentals/listings/:id` - Get listing details
- PATCH `/rentals/listings/:id` - Update listing
- DELETE `/rentals/listings/:id` - Delete listing

**Rental Leases**
- POST `/rentals/leases` - Create lease
- GET `/rentals/leases/:id` - Get lease details
- GET `/rentals/leases?landlord=true` - Get landlord leases
- GET `/rentals/leases?tenant=true` - Get tenant leases
- PATCH `/rentals/leases/:id/status` - Update lease status

**Rent Payments**
- GET `/rentals/payments?leaseId=xxx` - Get payments
- PATCH `/rentals/payments/:id/pay` - Mark paid
- PATCH `/rentals/payments/:id/waive` - Waive payment

**Landlord Stats**
- GET `/rentals/landlord/stats` - Get statistics
- GET `/rentals/landlord/overview` - Get property overview

**Maintenance**
- POST `/rentals/maintenance` - Create request
- GET `/rentals/maintenance` - List requests
- PATCH `/rentals/maintenance/:id` - Update request

## Email Notifications

The system sends automated emails for:

1. **Rent Due Warning** (3 days before due date)
   - Property details
   - Amount due and due date
   - Landlord contact information

2. **Rent Overdue** (when payment passes due date)
   - Overdue amount and days overdue
   - Warning about potential consequences
   - Landlord contact information

3. **Lease Activation** (when lease becomes active)
   - Lease details and payment schedule
   - Property information
   - Sent to both tenant and landlord

## Scheduled Jobs

**Daily Rent Notification Job** (9:00 AM)
- Scans for upcoming payments within configured window
- Sends reminder emails to tenants
- Identifies and marks overdue payments
- Sends overdue notification emails

## Database Models

### Core Models
- **User**: User accounts with roles (USER, LANDLORD, ADMIN)
- **Property**: Property details (buy/sell and rental)
- **RentalListing**: Rental-specific information
- **RentalLease**: Lease agreements between landlords and tenants
- **RentPayment**: Individual rent payment records
- **MaintenanceRequest**: Property maintenance tracking

### Relationships
- User → Properties (one-to-many)
- Property → RentalListing (one-to-one)
- RentalListing → RentalLeases (one-to-many)
- RentalLease → RentPayments (one-to-many)
- Property → MaintenanceRequests (one-to-many)

## Development

### Running Tests
```bash
cd backend
npm test
```

### Building for Production

**Backend**
```bash
cd backend
npm run build
npm run start:prod
```

**Frontend**
```bash
cd frontend
npm run build
npm start
```

### Database Operations

**Create migration**
```bash
cd backend
npx prisma migrate dev --name migration_name
```

**Reset database**
```bash
npx prisma migrate reset
```

**Open Prisma Studio**
```bash
npx prisma studio
```

## Security Notes

⚠️ **Important**: This project stores passwords in plain text as per requirements. This is **NOT RECOMMENDED** for production use. In a real application:
- Use bcrypt or argon2 for password hashing
- Implement rate limiting on auth endpoints
- Use HTTPS in production
- Secure session secrets
- Validate and sanitize all inputs
- Implement CSRF protection

## Troubleshooting

### Email Not Sending
- Verify SMTP configuration in .env
- For Gmail: use App Password, enable 2FA
- Check firewall rules for SMTP port

### Role Not Updating
- Create rental listing (not just property)
- Refresh user session
- Check browser console for errors

### Payments Not Generated
- Ensure lease status is ACTIVE
- Verify start/end dates are valid
- Check payment day is 1-31

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Ensure database exists

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Check [docs/rentals.md](docs/rentals.md) for detailed documentation
- Review troubleshooting section
- Open an issue on GitHub

## Acknowledgments

Built with:
- [NestJS](https://nestjs.com/)
- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Nodemailer](https://nodemailer.com/)
