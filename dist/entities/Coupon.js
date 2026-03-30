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
exports.Coupon = exports.CouponDiscountType = void 0;
const typeorm_1 = require("typeorm");
const Order_1 = require("./Order");
var CouponDiscountType;
(function (CouponDiscountType) {
    CouponDiscountType["PERCENT"] = "percent";
    CouponDiscountType["FIXED"] = "fixed";
})(CouponDiscountType || (exports.CouponDiscountType = CouponDiscountType = {}));
let Coupon = class Coupon {
};
exports.Coupon = Coupon;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Coupon.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 50, unique: true }),
    __metadata("design:type", String)
], Coupon.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "discount_type",
        type: "enum",
        enum: CouponDiscountType,
        default: CouponDiscountType.PERCENT,
    }),
    __metadata("design:type", String)
], Coupon.prototype, "discountType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "discount_value", type: "decimal", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Coupon.prototype, "discountValue", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "max_discount",
        type: "decimal",
        precision: 10,
        scale: 2,
        nullable: true,
    }),
    __metadata("design:type", Number)
], Coupon.prototype, "maxDiscount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "min_order_value",
        type: "decimal",
        precision: 10,
        scale: 2,
        nullable: true,
    }),
    __metadata("design:type", Number)
], Coupon.prototype, "minOrderValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "starts_at", type: "datetime", nullable: true }),
    __metadata("design:type", Date)
], Coupon.prototype, "startsAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "ends_at", type: "datetime", nullable: true }),
    __metadata("design:type", Date)
], Coupon.prototype, "endsAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "usage_limit", type: "int", nullable: true }),
    __metadata("design:type", Number)
], Coupon.prototype, "usageLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "used_count", type: "int", default: 0 }),
    __metadata("design:type", Number)
], Coupon.prototype, "usedCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "is_active", type: "boolean", default: true }),
    __metadata("design:type", Boolean)
], Coupon.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Order_1.Order, (order) => order.coupon),
    __metadata("design:type", Array)
], Coupon.prototype, "orders", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], Coupon.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], Coupon.prototype, "updatedAt", void 0);
exports.Coupon = Coupon = __decorate([
    (0, typeorm_1.Entity)({ name: "coupons" })
], Coupon);
//# sourceMappingURL=Coupon.js.map