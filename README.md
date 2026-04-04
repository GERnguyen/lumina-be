# Cinx E-learning Backend

Backend service cho nen tang hoc truc tuyen Lumina (Cinx), phuc vu cac luong student, instructor, admin.
Project nay tap trung vao nghiep vu E-learning day du thay vi chi la demo CRUD.

## Project Overview

Backend cung cap API cho:

- Dang ky, dang nhap, phan quyen theo role.
- Quan ly khoa hoc, chuong, bai giang, quiz, cau hoi va dap an.
- Mua khoa hoc, ghi nhan enrollments, lich su hoc va tien do hoc.
- Danh gia khoa hoc va phan hoi review tu instructor.
- Moderation cho admin: duyet khoa hoc, quan ly nguoi dung.

## Core Roles

- `student`: tim kiem khoa hoc, mua khoa hoc, hoc bai, lam quiz, danh gia.
- `instructor`: tao/chinh sua khoa hoc, quan ly hoc vien, tra loi review.
- `admin`: quan ly user va duyet noi dung truoc khi public.

## Tech Stack

- Runtime: Node.js + TypeScript
- Framework: Express
- ORM: TypeORM
- Database: MySQL 8
- Auth: JWT

## High-Level Architecture

- `src/controllers`: xu ly request/response, validate input co ban.
- `src/services`: business logic va quy tac nghiep vu.
- `src/repositories`: truy van du lieu theo use-case.
- `src/entities`: mo hinh bang du lieu va relation.
- `src/routes`: route modules theo domain.
- `src/middlewares`: auth + role guard.

Pattern chinh: `Route -> Controller -> Service -> Repository -> Entity/DB`.

## Important Business Flows

### Course lifecycle

1. Instructor tao va cap nhat khoa hoc.
2. Khoa hoc pending truoc khi duoc admin duyet.
3. Khoa hoc active se hien thi tren trang public.
4. Instructor/admin van co endpoint private de quan ly khoa hoc chua active.

### Learning and progress

1. Student mua khoa hoc.
2. Enrollment duoc tao.
3. Lecture completion cap nhat phan tram tien do.
4. Student co the review sau khi da mua khoa hoc.

### Review and instructor reply

- Student gui review cho course.
- Instructor (owner) hoac admin co the reply review.
- Reply duoc tra ve trong API review de FE render.

## Data Model Snapshot

Mot so entity trung tam:

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

`docker-compose.yml` map MySQL ra local port `3307`.

```bash
docker compose up -d
```

### 3) Environment variables

Tao file `.env` trong thu muc `be/`:

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

Seed bo sung (khong reset):

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

- `npm run dev`: chay backend local bang `ts-node` + `nodemon`.
- `npm run build`: compile TypeScript sang `dist/`.
- `npm start`: chay production tu `dist/index.js`.
- `npm run seed`: seed full du lieu demo.
- `npm run seed:extra`: bo sung them du lieu mau.

## Notes

- `synchronize: true` dang duoc bat trong `src/data-source.ts` de dong bo schema nhanh khi dev.
- Moi truong production nen dung migration thay vi synchronize.
