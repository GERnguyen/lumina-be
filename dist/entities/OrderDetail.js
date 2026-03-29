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
exports.OrderDetail = void 0;
const typeorm_1 = require("typeorm");
const Course_1 = require("./Course");
const Order_1 = require("./Order");
let OrderDetail = class OrderDetail {
};
exports.OrderDetail = OrderDetail;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], OrderDetail.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Order_1.Order, (order) => order.details, { onDelete: "CASCADE" }),
    __metadata("design:type", Order_1.Order)
], OrderDetail.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Course_1.Course, (course) => course.orderDetails, { onDelete: "RESTRICT" }),
    __metadata("design:type", Course_1.Course)
], OrderDetail.prototype, "course", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "unit_price", type: "decimal", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], OrderDetail.prototype, "unitPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "discount_amount", type: "decimal", precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], OrderDetail.prototype, "discountAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "final_price", type: "decimal", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], OrderDetail.prototype, "finalPrice", void 0);
exports.OrderDetail = OrderDetail = __decorate([
    (0, typeorm_1.Entity)({ name: "order_details" })
], OrderDetail);
//# sourceMappingURL=OrderDetail.js.map