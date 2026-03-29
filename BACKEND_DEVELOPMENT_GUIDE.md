# BACKEND DEVELOPMENT GUIDE (NODE.JS + MYSQL)

Dự án: Cinx E-learning Backend
Mục tiêu: Xây dựng hệ thống API phục vụ React Native App và đáp ứng tiêu chuẩn Hướng đối tượng (OOP) cho đồ án OOSE.

## 1. TECH STACK & KIẾN TRÚC

- **Ngôn ngữ:** TypeScript (Strict mode).
- **Framework:** Express.js.
- **Database & ORM:** MySQL kết hợp với TypeORM.
- **Kiến trúc:** 3-Layer Architecture (Controller -> Service -> Repository).
- **Design Patterns BẮT BUỘC:** - Repository Pattern (Truy xuất dữ liệu).
  - Dependency Injection / Singleton (Quản lý Instance).
  - Strategy Pattern (Xử lý giả lập Thanh toán).

## 2. DATABASE SCHEMA (TYPEORM ENTITIES)

Dựa trên thiết kế ERD, hãy tạo các Class Entities với Relationship chặt chẽ:

- `User` (1-1 `Profile`, 1-N `Order`, `Enrollment`, `Review`).
- `Category` (Tự tham chiếu Parent-Child, 1-N `Course`).
- `Course` (1-N `Section`, `Review`, thuộc về `Instructor/User`).
- `Section` (1-N `Lecture`, `Quiz`).
- `Lecture` (Có trường `ContentText`, `VideoUrl`, `OrderIndex`).
- `Quiz` (1-N `Question`). `Question` (1-N `Answer`).
- `Cart` và `CartItem` (1 `User` có 1 `Cart`, 1 `Cart` có nhiều `CartItem` trỏ tới `Course`).
- `Order`, `OrderDetail`, `Coupon`.

## 3. PHẠM VI GIAI ĐOẠN 1 (CORE MVP)

Chỉ tập trung xây dựng các RESTful API cốt lõi sau:

1. **Auth:** Register, Login (Trả về JWT Token).
2. **Course:** Lấy danh sách khóa học (kèm filter/search), Chi tiết khóa học.
3. **Cart & Order:** Thêm vào giỏ hàng, Checkout (Sử dụng Strategy Pattern mô phỏng thanh toán thành công, chuyển giỏ hàng thành Order).
4. **Learning:** Lấy chi tiết bài giảng cho học viên đã mua khóa học (Check quyền qua Enrollment).

## 4. QUY TRÌNH LÀM VIỆC DÀNH CHO AI AGENT

**Bước 1: Khởi tạo Project & Docker**

- Sinh ra file `package.json` với các thư viện: `express`, `typeorm`, `mysql2`, `jsonwebtoken`, `bcrypt`, `cors`, `dotenv`. (Cùng các type dev-dependencies).
- Viết file `docker-compose.yml` thiết lập 1 container MySQL (database: cinx_db, root password: root).
- Setup file `ormconfig.ts` (hoặc `data-source.ts`) để kết nối TypeORM.

**Bước 2: Xây dựng Entities**

- Tạo toàn bộ các file Entity trong `/src/entities/` bám sát UML và bổ sung thêm `Cart`, `CartItem`.

**Bước 3: Scaffolding 3-Layer**

- Tạo `/src/repositories/`, `/src/services/`, `/src/controllers/`, `/src/routes/`.
- Tuân thủ nguyên tắc SOLID. Không viết logic database vào Controller.

Hãy bắt đầu bằng Bước 1 & Bước 2. Cung cấp cho tôi các lệnh Terminal để cài đặt và show file `docker-compose.yml` cùng các Entity cơ bản để tôi kiểm tra.
