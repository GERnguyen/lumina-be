# Cinx E-learning Backend

Backend API service for the Lumina (Cinx) online learning platform.
This project is built around real e-learning workflows for student, instructor, and admin roles.

Front-end repo: https://github.com/GERnguyen/lumina-fe-oose

## Project Overview

The backend provides APIs for:

- Authentication, authorization, and role-based access.
- Course management: sections, lectures, quizzes, questions, answers.
- Orders, enrollments, and learning progress tracking.
- Course reviews and instructor replies.
- Admin moderation: user management and course approval.

## Core Roles

- `student`: discover, purchase, learn, and review courses.
- `instructor`: create/update course content, monitor learners, reply to reviews.
- `admin`: manage users and moderate course publishing lifecycle.

## Tech Stack

- Runtime: Node.js + TypeScript
- Framework: Express
- ORM: TypeORM
- Database: MySQL 8
- Auth: JWT

## High-Level Architecture

- `src/controllers`: request/response handling and input-level checks.
- `src/services`: business rules and domain logic.
- `src/repositories`: data access and query composition.
- `src/entities`: relational data model definitions.
- `src/routes`: API route modules grouped by domain.
- `src/middlewares`: auth middleware and role guards.

Main flow: `Route -> Controller -> Service -> Repository -> Entity/DB`.

## Important Business Flows

### Course lifecycle

1. Instructors create and update course content.
2. New/updated courses can stay in pending state before approval.
3. Only active courses are visible on public endpoints.
4. Instructor/admin private endpoints are available for non-active course management.

### Learning and progress

1. Student purchases a course.
2. Enrollment is created.
3. Lecture completion updates learning progress.
4. Student can submit course reviews after enrollment.

### Review and instructor reply

- Student submits a review.
- Course owner (instructor) or admin can reply.
- Reply is returned by review APIs for frontend rendering.

## Data Model Snapshot

Core entities include:

- `User`, `Profile`, `OtpRecord`
- `Category`, `Course`, `Section`, `Lecture`
- `Quiz`, `Question`, `Answer`, `QuizAttempt`
- `Order`, `OrderDetail`, `Enrollment`, `Cart`, `CartItem`
- `Review`, `Tag`

## Setup and Run

### Prerequisites

- Node.js >= 18
- npm >= 9
- Docker + Docker Compose

### 1) Install dependencies

```bash
npm install
```

### 2) Start MySQL

`docker-compose.yml` maps MySQL to local port `3307`.

```bash
docker compose up -d
```

### 3) Environment variables

Create a `.env` file in the `be` directory:

```env
PORT=9090

DB_HOST=127.0.0.1
DB_PORT=3307
DB_USERNAME=root
DB_PASSWORD=root
DB_NAME=cinx_db

JWT_SECRET=cinx_dev_secret

EMAIL_USER=
EMAIL_PASS=

ORDER_EXPIRATION_CHECK_MS=60000
ORDER_PENDING_TTL_MINUTES=30
```

### 4) Seed data

```bash
npm run seed
```

Extra seed (append-only, no reset):

```bash
npm run seed:extra
```

### 5) Run dev server

```bash
npm run dev
```

API base URL: `http://localhost:9090/api`

### 6) Build production

```bash
npm run build
npm start
```

## Scripts

- `npm run dev`: run backend locally with `ts-node` + `nodemon`.
- `npm run build`: compile TypeScript to `dist`.
- `npm start`: run production from `dist/index.js`.
- `npm run seed`: seed full demo dataset.
- `npm run seed:extra`: add extra demo data (append-only).

## Notes

- `synchronize: true` is currently enabled in `src/data-source.ts` for local development convenience.
- Production environments should use migrations instead of synchronize.
