# Real Estate Management System - Frontend

This is the Next.js frontend for the Real Estate Management System, providing a complete UI for buying, selling, and managing properties.

## Tech Stack

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **Session-based Authentication**

## Prerequisites

Before running the frontend, ensure you have:

1. Node.js 18+ installed
2. The backend server running on `http://localhost:4000`
3. Database configured and migrated

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### Build for Production

```bash
npm run build
npm run start
```

### Linting

```bash
npm run lint
```

## Features Implemented

### Authentication (Tasks 4)
- **Login Page** (`/auth/login`)
  - Email and password authentication
  - Client-side validation
  - Error handling
  - Auto-redirect if already logged in

- **Register Page** (`/auth/register`)
  - Full registration form
  - Password confirmation
  - Field validation (email format, password length >= 6)
  - Auto-redirect on success

### Dashboard (Task 5)
- **Dashboard** (`/dashboard`)
  - Protected route with authentication guard
  - Property statistics display
  - Recent properties grid
  - Quick action buttons

### Property Listings (Task 6)
- **Listings Page** (`/properties`)
  - Paginated property grid
  - Location filter
  - Sort by price or date
  - Query parameter handling

### Property Details (Task 7)
- **Property Detail Page** (`/properties/[id]`)
  - Full property information display
  - Seller contact information
  - Edit/Delete buttons (owner only)
  - Delete confirmation dialog

### Property Management (Tasks 8-10)
- **Create Property Modal**
  - Comprehensive form with all property fields
  - Client-side validation
  - Success/error handling

- **Edit Property Modal**
  - Pre-filled form with existing data
  - Status update capability
  - Ownership validation

- **My Listings Page** (`/my-listings`)
  - Protected route
  - User's property listings
  - Quick edit/delete actions
  - Empty state handling

## Project Structure

```
frontend/
├── src/
│   ├── app/                     # Next.js app directory
│   │   ├── auth/               # Authentication pages
│   │   ├── dashboard/          # Dashboard page
│   │   ├── properties/         # Property pages
│   │   ├── my-listings/        # My listings page
│   │   └── page.tsx            # Home page
│   ├── components/             # Reusable components
│   │   ├── layout/            # Layout components (AppLayout, ProtectedRoute)
│   │   ├── property/          # Property components (PropertyCard, Modals)
│   │   └── ui/                # UI components (Modal)
│   ├── context/               # React context providers
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility functions (API client)
│   └── types/                 # TypeScript type definitions
```

## API Integration

All API calls use `credentials: 'include'` for session-based authentication.

Base URL: `http://localhost:4000`

### Endpoints Used:
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user
- `POST /auth/logout` - User logout
- `GET /properties` - List all properties (with filters)
- `GET /properties/stats` - Get property statistics
- `GET /properties/locations` - Get available locations
- `GET /properties/my-listings` - Get user's properties
- `GET /properties/:id` - Get property details
- `POST /properties` - Create new property
- `PUT /properties/:id` - Update property
- `DELETE /properties/:id` - Delete property

## Testing the Application

1. **Start the Backend**
   ```bash
   cd ../backend
   npm run start:dev
   ```

2. **Start the Frontend**
   ```bash
   npm run dev
   ```

3. **Test Authentication Flow**
   - Visit `http://localhost:3000`
   - Click "Get Started" or "Register"
   - Create a new account
   - Verify redirect to dashboard

4. **Test Property Management**
   - Create a new property from dashboard
   - Browse properties in listings
   - View property details
   - Edit your own properties
   - Delete a property

5. **Test Filtering & Pagination**
   - Go to `/properties`
   - Filter by location
   - Sort by price/date
   - Navigate through pages

## Environment Variables

Create a `.env.local` file if you need to override the API URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Common Issues

### Build Errors
- Make sure all dependencies are installed: `npm install`
- Clear Next.js cache: `rm -rf .next`

### Authentication Issues
- Ensure backend is running on port 4000
- Check browser console for CORS errors
- Verify session configuration in backend

### API Connection Issues
- Confirm backend is accessible at `http://localhost:4000`
- Check network tab in browser dev tools
- Verify credentials are being sent with requests
