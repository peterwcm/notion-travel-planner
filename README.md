# Notion Travel Planner

Airbnb-inspired personal travel planner built with `Next.js App Router`. The UI is now English-first, deployment targets `Vercel Free`, `Notion` remains the single source of truth, and the repo keeps a small `Figma` sync scaffold.

## Product Summary

This project reshapes travel data stored in Notion into a UI that is easier to use during planning and while traveling:

- A shared password protects the private workspace
- Trip cards show dates and summaries at a glance
- A dedicated trip page organizes days and itinerary items
- All create, edit, and delete actions write directly back to Notion
- The visual direction is clean, modern, and Airbnb-style

## Core Features

- `/login`
  Password-protected entry page with a signed-cookie session
- `/trips`
  Trip list, summary stats, and a new-trip form
- `/trips/[id]`
  Trip overview plus create/edit/delete flows for days, itinerary items, flights, and stays
- `Notion` integration
  `Trips`, `Days`, `Items`, `Flights`, and `Stays` data sources act as the only backend
- `Figma` scaffold
  Reserved component-mapping and design-sync structure

## Stack

- `Next.js 14`
- `React 18`
- `TypeScript`
- `@notionhq/client`
- `Zod`
- Custom CSS design system

## Local Development

1. Install dependencies

```bash
npm install
```

2. Create `.env.local`

```bash
NOTION_TOKEN=
NOTION_TRIPS_DB_ID=
NOTION_DAYS_DB_ID=
NOTION_ITEMS_DB_ID=
NOTION_FLIGHTS_DB_ID=
NOTION_STAYS_DB_ID=
APP_PASSWORD=
SESSION_SECRET=
```

Note: although the variable names still use `*_DB_ID`, the current `@notionhq/client` integration expects the Notion data source ID for each database.

3. Start the development server

```bash
npm run dev
```

4. Verify

```bash
npm run lint
npm run build
```

## Required Notion Schema

### Trips

- `Destination` Title
- `Start Date` Date
- `End Date` Date
- `Notes` Rich text

### Days

- `Name` Title
- `Trip` Relation -> Trips
- `Date` Date
- `Day Number` Number
- `Summary` Rich text

### Items

- `Name` Title
- `Day` Relation -> Days
- `Start Time` Rich text
- `End Time` Rich text
- `Item Type` Select: `Sightseeing`, `Transit`, `Stay`, `Food`, `Shopping`, `Reminder`, `Other`
- `Location` Rich text
- `Cost` Number
- `Link` URL
- `Notes` Rich text
- `Order` Number

### Flights

- `Name` Title
- `Trip` Relation -> Trips
- `Airline` Rich text
- `Flight Number` Rich text
- `Departure Airport` Rich text
- `Arrival Airport` Rich text
- `Departure Time` Date
- `Arrival Time` Date
- `Aircraft` Rich text
- `Baggage Info` Rich text
- `Cost` Number
- `Passengers` Rich text
- `Notes` Rich text

### Stays

- `Name` Title
- `Trip` Relation -> Trips
- `Check-in Date` Date
- `Check-out Date` Date
- `Check-in Time` Rich text
- `Check-out Time` Rich text
- `Cost` Number
- `Address` Rich text
- `Link` URL
- `Booking Reference` Rich text
- `Notes` Rich text

## Project Structure

```text
app/
  login/                  login page + server action
  (protected)/trips/      trip list and detail pages
components/               shared UI components
lib/                      auth, notion, validators, utilities
figma/                    component mapping scaffold
```

## Deployment Notes

- Sync the values from `.env.local` into Vercel Project Settings
- `middleware` protects `/trips`, so `APP_PASSWORD` and `SESSION_SECRET` are required
- This project is suitable for `Vercel Free`

## Roadmap

- Richer Figma component sync
- More detailed trip filters and sorting
- Better budget analysis and trip summaries
- More stable dev-mode form flows and UX polish
