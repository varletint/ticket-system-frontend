# Ticket System Client

This is the frontend application for the Ticket System, built with React, Vite, and Tailwind CSS.

## Features

- **Buyer**: Browse events, view event details, purchase tickets, and manage tickets/orders.
- **Organizer**: Create & manage events, view event dashboards, publish events, and set up payout accounts.
- **Validator**: Scan & validate ticket QR codes at event entrances.
- **Admin**: Manage users, organizers, transactions, disputes, and audit logs.

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM (v6)
- **Icons**: React Icons
- **QR Scanning**: html5-qrcode
- **API Communication**: Axios
- **theme setting enhancement**: Theme
- **Logo**: getick_logo.png

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Navigate to the client directory:

   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Development Server

Start the development server with:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## Environment Variables

Create a `.env` file in the `client` directory with the following variables:

```env

```

## Available Scripts

- `npm run dev`: Starts the development server using Vite.
- `npm run build`: Builds the application for production.
- `npm run lint`: Runs ESLint for code linting.
- `npm run preview`: Previews the production build locally.

---

## Development Journal

### January 15, 2026

**Payout Setup Requirement for Event Creation**

- Organizers must now set up their payout account before creating events
- **Backend**: Added validation in `eventController.js` → `createEvent` that checks `paystack.isActive`
- **Frontend**: Added blocker UI in `CreateEvent.jsx` that redirects to payout setup if not configured
- Added "Setup Payout" quick link to `OrganizerDashboard.jsx`

**Fixed Paystack Subaccount Split Configuration**

- **Issue**: Paystack dashboard showed wrong split (subaccount 10%, platform 90%)
- **Root cause**: Was using `share: 90` instead of `percentage_charge: 10`
- **Fix**: Changed to `percentage_charge` which represents the platform's cut
- Updated `paystackService.js` and `organizerController.js`
- **New logic**: Platform fee = 10%, Organizer receives = 90%

**AuthContext Improvements**

- Added `refreshUser()` function to re-fetch user data from API
- Exported `refreshUser` in context value for use in Profile and SetupPayout pages
- Fixes issue where profile data wasn't refreshing after updates

**Organizer Profile Data**

- Fixed organizer data (businessName, description) loading in Profile page
- Added `platformFeePercent` field to track platform's percentage
- Updated paystack storage to include `percentageCharge` (organizer's share: 90%)

**Code Cleanup**

- Removed mock Paystack code from `paystackService.js`
- Cleaned up button styling in `SetupPayout.jsx`
