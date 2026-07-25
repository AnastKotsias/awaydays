# Away Days — "Where's the Game?"

A full-stack web app for travelling sports fans. Pick an away game, see the stadium on a
map, and discover the sports bars, local food spots and fan meeting points around it —
then build and share your own away-day itinerary.

Built as a university project by [Anastasis Kotsias](https://github.com/AnastKotsias).

## Tech stack

| Layer    | Choice                                                    |
| -------- | --------------------------------------------------------- |
| Frontend | React + TypeScript, Vite, Tailwind CSS, TanStack Query     |
| Maps     | React-Leaflet + OpenStreetMap (free, no API key)          |
| Backend  | Node.js + Express, TypeScript, Zod validation              |
| Database | PostgreSQL (Docker), Prisma ORM                            |
| Auth     | JWT + bcrypt                                               |

## Repository layout

```
awaydays/
├── server/              Express + Prisma REST API
├── client/              Vite + React single-page app
└── docker-compose.yml   Local PostgreSQL
```

## Getting started

Requirements: Node.js 20+, Docker.

```bash
# 1. Start the database
docker compose up -d

# 2. Backend
cd server
cp .env.example .env
npm install
npx prisma migrate dev
npm run seed
npm run dev          # http://localhost:4000

# 3. Frontend (in a second terminal)
cd client
cp .env.example .env
npm install
npm run dev          # http://localhost:5173
```

## Roadmap

- [ ] **Phase 1** — Database schema, seed data, REST API
- [ ] **Phase 2** — Map view with stadiums and nearby spots
- [ ] **Phase 3** — Itinerary builder with shareable links
- [ ] **Phase 4** — Authentication, reviews, deployment
