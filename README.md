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
VITE_API_URL=http://localhost:5000/api
```

## Available Scripts

- `npm run dev`: Starts the development server using Vite.
- `npm run build`: Builds the application for production.
- `npm run lint`: Runs ESLint for code linting.
- `npm run preview`: Previews the production build locally.
