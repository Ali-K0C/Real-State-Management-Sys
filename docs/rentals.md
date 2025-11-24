# Rental Management System Documentation

## Overview

The Rental Management System is a comprehensive feature that allows property owners to list their properties for rent, manage tenants, track lease agreements, monitor rent payments, and handle maintenance requests. The system includes automated email notifications for upcoming and overdue rent payments.

## Features

### 1. Public Rental Listings
- Browse available rental properties
- Filter by location, rent range, and number of bedrooms
- View detailed property information
- See occupancy status (Available/Occupied)
- Contact landlord information

### 2. Landlord Role & Promotion
- Users are automatically promoted to LANDLORD role when creating their first rental listing
- LANDLORD role grants access to the Rental Tracker dashboard
- Role-based access control throughout the system

### 3. Rental Tracker Dashboard (Landlord Only)
- Statistics overview:
  - Total rental properties
  - Occupied vs vacant properties
  - Active and pending leases
  - Overdue payments count
- Upcoming rent payments (next 7 days)
- Properties by location distribution

### 4. Lease Management
- Create new leases for tenants
- Automatic payment schedule generation upon lease activation
- Lease status transitions:
  - PENDING → ACTIVE
  - ACTIVE → COMPLETED/TERMINATED
  - PENDING → CANCELED
- View lease details and payment history

### 5. Rent Payment Tracking
- Automatic monthly payment generation based on lease terms
- Payment statuses: DUE, PAID, OVERDUE, WAIVED
- Record payments with method and notes
- Landlord can waive payments
- System automatically marks overdue payments

### 6. Email Notifications
- **Rent Due Warning**: Sent 3 days before due date (configurable)
- **Rent Overdue**: Sent when payment becomes overdue
- **Lease Activation**: Sent to both tenant and landlord when lease is activated
- HTML email templates with property and payment details

### 7. Maintenance Requests
- Tenants and landlords can create maintenance requests
- Track status: PENDING, IN_PROGRESS, COMPLETED, CANCELED
- Priority levels: LOW, MEDIUM, HIGH, URGENT
- Timestamped notes for communication

## User Roles

### USER (Default)
- Browse rental listings
- View property details
- Register and login

### LANDLORD (Promoted Automatically)
- All USER permissions
- Create and manage rental listings
- Create and manage leases
- View landlord dashboard and statistics
- Manage maintenance requests for owned properties
- Waive rent payments

### ADMIN
- All LANDLORD permissions
- System administration capabilities

## API Endpoints

### Rental Listings
```
GET    /rentals/listings              - List all active rental listings (public)
GET    /rentals/listings/:id          - Get specific listing details (public)
POST   /rentals/listings              - Create new rental listing (auth required)
PATCH  /rentals/listings/:id          - Update listing (owner only)
DELETE /rentals/listings/:id          - Soft delete listing (owner only)
```

### Rental Leases
```
POST   /rentals/leases                - Create new lease (landlord only)
GET    /rentals/leases/:id            - Get lease details (landlord or tenant)
GET    /rentals/leases?landlord=true  - Get landlord's leases
GET    /rentals/leases?tenant=true    - Get tenant's leases
PATCH  /rentals/leases/:id/status     - Update lease status (landlord only)
```

### Rent Payments
```
GET    /rentals/payments?leaseId=xxx  - Get payments for lease
PATCH  /rentals/payments/:id/pay      - Mark payment as paid
PATCH  /rentals/payments/:id/waive    - Waive payment (landlord only)
PATCH  /rentals/payments/:id/mark-overdue - Mark as overdue (system)
```

### Landlord Statistics
```
GET    /rentals/landlord/stats        - Get dashboard statistics (landlord only)
GET    /rentals/landlord/overview     - Get property overview (landlord only)
```

### Maintenance Requests
```
POST   /rentals/maintenance           - Create maintenance request
GET    /rentals/maintenance           - List maintenance requests
GET    /rentals/maintenance/:id       - Get specific request
PATCH  /rentals/maintenance/:id       - Update request status/notes
```

## Environment Configuration

Add the following to your `.env` file:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"

# Session Secret
SESSION_SECRET="your-secret-key-here"

# SMTP Mail Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
MAIL_FROM="Rent Tracker <no-reply@yourapp.com>"

# Rent Notification Settings
RENT_UPCOMING_WINDOW_DAYS=3
```

## Database Schema

### Key Models

**RentalListing**
- Links to Property (one-to-one)
- Monthly rent and security deposit
- Available from date and lease duration
- Active status flag

**RentalLease**
- Links to RentalListing, Landlord (User), and Tenant (User)
- Start and end dates
- Payment day of month
- Status (PENDING, ACTIVE, COMPLETED, TERMINATED, CANCELED)
- Related payments

**RentPayment**
- Links to RentalLease
- Amount, due date, paid date
- Status (DUE, PAID, OVERDUE, WAIVED)
- Payment method and notes

**MaintenanceRequest**
- Links to Property and User (requester)
- Title, description, status, priority
- Timestamped notes

## Automated Processes

### Daily Cron Job (9:00 AM)
1. **Upcoming Payment Reminders**
   - Scans for payments due within configured window (default: 3 days)
   - Sends email reminders to tenants
   - Includes property and payment details

2. **Overdue Payment Detection**
   - Identifies payments with due date in the past and status still DUE
   - Marks payments as OVERDUE
   - Sends overdue notification emails to tenants
   - Calculates days overdue

## Frontend Routes

### Public Routes
- `/rentals` - Browse rental listings
- `/rentals/[id]` - View rental listing details

### Protected Routes (Landlord Only)
- `/rental-tracker` - Dashboard with statistics
- `/rental-tracker/properties` - Manage rental properties
- `/rental-tracker/leases` - View and manage leases
- `/rental-tracker/maintenance` - Handle maintenance requests

## Testing the Feature

### 1. Create a Rental Listing
```bash
POST http://localhost:4000/rentals/listings
Content-Type: application/json

{
  "propertyId": "property-uuid",
  "monthlyRent": 2000,
  "securityDeposit": 2000,
  "availableFrom": "2024-12-01",
  "leaseDuration": 12
}
```

### 2. Create a Lease
```bash
POST http://localhost:4000/rentals/leases
Content-Type: application/json

{
  "rentalListingId": "listing-uuid",
  "tenantId": "tenant-user-uuid",
  "startDate": "2024-12-01",
  "endDate": "2025-11-30",
  "paymentDay": 1,
  "notes": "Standard lease terms apply"
}
```

### 3. Activate Lease (Generates Payments)
```bash
PATCH http://localhost:4000/rentals/leases/:leaseId/status
Content-Type: application/json

{
  "status": "ACTIVE"
}
```

### 4. Record a Payment
```bash
PATCH http://localhost:4000/rentals/payments/:paymentId/pay
Content-Type: application/json

{
  "paymentMethod": "BANK_TRANSFER",
  "notes": "Payment received via ACH transfer"
}
```

## Security Considerations

### Access Control
- All rental management endpoints require authentication
- Landlord-specific endpoints verify LANDLORD role
- Lease and payment access verified by landlord/tenant relationship
- Property ownership verified for rental listing operations

### Data Protection
- User passwords stored in plain text (as per project requirements)
  - **WARNING**: This is for demo purposes only. In production, use bcrypt or argon2
- Session-based authentication with secure cookies
- SQL injection prevented by Prisma ORM
- Input validation on all endpoints

### Email Security
- SMTP credentials stored in environment variables
- Graceful fallback when SMTP not configured (logs instead of sending)
- No sensitive data in email templates beyond necessary transaction details

## Common Issues & Troubleshooting

### Email Not Sending
- Verify SMTP configuration in .env
- Check SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
- For Gmail, use App Password, not regular password
- Check firewall allows outbound SMTP connections

### Role Not Updating
- Ensure user creates rental listing (not just property)
- Role promotion happens automatically on first listing creation
- Refresh user session after creating listing

### Payments Not Generated
- Verify lease status is ACTIVE
- Check start date and end date are valid
- Payment day must be 1-31
- Payments generated in transaction with lease activation

### Cron Job Not Running
- Ensure SchedulerModule is imported in AppModule
- Check @nestjs/schedule package is installed
- Verify server is running continuously
- Check server logs for scheduler execution

## Future Enhancements

- Tenant portal for rent payment processing
- Automatic late fee calculation
- Document upload (lease agreements, receipts)
- SMS notifications in addition to email
- Rent payment history reports
- Property inspection scheduling
- Multi-property bulk operations
- Integration with payment gateways (Stripe, PayPal)
- Tenant screening and application process
- Property analytics and insights
