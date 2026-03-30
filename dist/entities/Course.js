"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Course = void 0;
const typeorm_1 = require("typeorm");
const CartItem_1 = require("./CartItem");
const Category_1 = require("./Category");
const Enrollment_1 = require("./Enrollment");
const OrderDetail_1 = require("./OrderDetail");
const Review_1 = require("./Review");
const Section_1 = require("./Section");
const Tag_1 = require("./Tag");
const User_1 = require("./User");
let Course = class Course {
};
exports.Course = Course;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Course.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 160 }),
    __metadata("design:type", String)
], Course.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 180, unique: true }),
    __metadata("design:type", String)
], Course.prototype, "slug", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Course.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "thumbnail_url",
        type: "varchar",
        length: 500,
        nullable: true,
    }),
    __metadata("design:type", String)
], Course.prototype, "thumbnailUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Course.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "enrollment_count", type: "int", default: 0 }),
    __metadata("design:type", Number)
], Course.prototype, "enrollmentCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "discount_percent", type: "int", default: 0 }),
    __metadata("design:type", Number)
], Course.prototype, "discountPercent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "is_active", type: "boolean", default: true }),
    __metadata("design:type", Boolean)
], Course.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "published_at", type: "datetime", nullable: true }),
    __metadata("design:type", Date)
], Course.prototype, "publishedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, (user) => user.instructorCourses, {
        onDelete: "CASCADE",
    }),
    __metadata("design:type", User_1.User)
], Course.prototype, "instructor", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Category_1.Category, (category) => category.courses, {
        nullable: true,
        onDelete: "SET NULL",
    }),
    __metadata("design:type", Category_1.Category)
], Course.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Section_1.Section, (section) => section.course, { cascade: true }),
    __metadata("design:type", Array)
], Course.prototype, "sections", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Review_1.Review, (review) => review.course),
    __metadata("design:type", Array)
], Course.prototype, "reviews", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Enrollment_1.Enrollment, (enrollment) => enrollment.course),
    __metadata("design:type", Array)
], Course.prototype, "enrollments", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => CartItem_1.CartItem, (cartItem) => cartItem.course),
    __metadata("design:type", Array)
], Course.prototype, "cartItems", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => OrderDetail_1.OrderDetail, (orderDetail) => orderDetail.course),
    __metadata("design:type", Array)
], Course.prototype, "orderDetails", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => Tag_1.Tag, (tag) => tag.courses, { cascade: false }),
    (0, typeorm_1.JoinTable)({ name: "course_tags" }),
    __metadata("design:type", Array)
], Course.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => User_1.User, (user) => user.favoriteCourses),
    __metadata("design:type", Array)
], Course.prototype, "favoritedByUsers", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], Course.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], Course.prototype, "updatedAt", void 0);
exports.Course = Course = __decorate([
    (0, typeorm_1.Entity)({ name: "courses" })
], Course);
//# sourceMappingURL=Course.js.map