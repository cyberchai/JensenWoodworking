# Client Portal - Your Project

A Next.js App Router application for managing woodworking projects with a client portal interface. Styled to match the Jensen Woodworking site design.

## Features

- **Project Lookup** (`/project`): Clients can enter a project code to view their project
- **Project Details** (`/p/[token]`): View project status, payment information, and submit feedback
- **Admin Dashboard** (`/admin`): Create and manage projects
- **Feedback System**: Clients can submit ratings and feedback

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
cd Site2/client-portal
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Navigation Integration

The client portal is linked from the main Site2/nordic navigation menu as "Your Project". 

**Note:** The navigation links use relative paths (`../client-portal/project`). If deploying separately:
- Update the links in `Site2/nordic/*.html` to use the full URL of your Next.js deployment
- Or configure a reverse proxy to serve both on the same domain

## Routes

- `/` - Redirects to `/project`
- `/project` - Project lookup form
- `/p/[token]` - Project detail page (e.g., `/p/DEMO1`)
- `/feedback/success` - Feedback submission confirmation
- `/admin` - Admin dashboard

## Example Project Codes

The app comes pre-loaded with example projects:

- `DEMO1` - Custom Walnut Dining Table (In Progress)
- `DEMO2` - Kitchen Island Countertop (Quality Check)
- Random token - Live Edge Mantel (Approved)

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **In-memory mock store** (no database required)

## Project Structure

```
client-portal/
├── app/                    # Next.js App Router pages
│   ├── project/           # Project lookup page
│   ├── p/[token]/        # Project detail page
│   ├── feedback/success/  # Feedback success page
│   └── admin/             # Admin dashboard
├── components/            # React components
│   ├── ProjectLookupForm.tsx
│   ├── ProjectStatusTimeline.tsx
│   ├── PaymentPanel.tsx
│   ├── FeedbackForm.tsx
│   ├── AdminCreateProject.tsx
│   └── AdminProjectList.tsx
└── lib/
    └── mockStore.ts       # In-memory data store
```

## Notes

- All data is stored in-memory and will reset on server restart
- No authentication is implemented (UI-only)
- Payment links open external Venmo/PayPal pages
- Feedback submission routes to success page but doesn't persist data

