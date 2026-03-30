# Cinx E-learning Backend

Backend API cho he thong E-learning, su dung Express + TypeORM + MySQL.

## 1. Yeu cau moi truong

- Node.js >= 18
- npm >= 9
- Docker + Docker Compose

## 2. Cai dat

```bash
npm install
```

## 3. Chay MySQL bang Docker

File [docker-compose.yml](docker-compose.yml) da map MySQL ra cong `3307` tren may local.

```bash
docker compose up -d
```

Kiem tra container:

```bash
docker ps
```

Ban can thay container `cinx_mysql` o trang thai `Up`.

## 4. Cau hinh bien moi truong

Tao file `.env` o thu muc goc project (neu chua co), voi noi dung:

```env
PORT=9090

DB_HOST=127.0.0.1
DB_PORT=3307
DB_USERNAME=root
DB_PASSWORD=root
DB_NAME=cinx_db

JWT_SECRET=cinx_dev_secret

# Optional: OTP Email
EMAIL_USER=
EMAIL_PASS=

# Optional: Worker don hang pending
ORDER_EXPIRATION_CHECK_MS=60000
ORDER_PENDING_TTL_MINUTES=30
```

## 5. Seed du lieu mau lon (test UI/Pagination)

Du lieu seed tao:

- 50 users (1 admin, 5 instructors, 44 students)
- 100 courses
- 200 reviews
- learning content cho 30 courses

Chay seed:

```bash
npm run seed
```

Neu muon override nhanh bien DB trong 1 lan chay:

```bash
DB_HOST=127.0.0.1 DB_PORT=3307 DB_USERNAME=root DB_PASSWORD=root DB_NAME=cinx_db npm run seed
```

## 6. Chay server dev

```bash
npm run dev
```

Khi thanh cong, log se hien:

- `Database connected successfully.`
- `Server running at http://localhost:9090`

## 7. Build va chay production mode

```bash
npm run build
npm start
```

## 8. Loi thuong gap

1. Loi `Access denied for user 'root'@'localhost'`

- Kiem tra `.env` co dung `DB_PORT=3307` (khong phai 3306).
- Kiem tra container MySQL dang chay: `docker ps`.
- Neu can, restart DB:
  ```bash
  docker compose down
  docker compose up -d
  ```

2. Server crash do khong ket noi DB

- Dam bao Docker da chay truoc khi `npm run dev`.
- Kiem tra thong tin DB trong `.env` trung voi [docker-compose.yml](docker-compose.yml).

3. Seed that bai

- Chay lai voi bien DB inline:
  ```bash
  DB_HOST=127.0.0.1 DB_PORT=3307 DB_USERNAME=root DB_PASSWORD=root DB_NAME=cinx_db npm run seed
  ```
