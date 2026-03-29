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
exports.Enrollment = void 0;
const typeorm_1 = require("typeorm");
const Course_1 = require("./Course");
const User_1 = require("./User");
let Enrollment = class Enrollment {
};
exports.Enrollment = Enrollment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Enrollment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, (user) => user.enrollments, { onDelete: "CASCADE" }),
    __metadata("design:type", User_1.User)
], Enrollment.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Course_1.Course, (course) => course.enrollments, { onDelete: "CASCADE" }),
    __metadata("design:type", Course_1.Course)
], Enrollment.prototype, "course", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "progress_percent", type: "decimal", precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Enrollment.prototype, "progressPercent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "completed_at", type: "datetime", nullable: true }),
    __metadata("design:type", Date)
], Enrollment.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "enrolled_at" }),
    __metadata("design:type", Date)
], Enrollment.prototype, "enrolledAt", void 0);
exports.Enrollment = Enrollment = __decorate([
    (0, typeorm_1.Entity)({ name: "enrollments" }),
    (0, typeorm_1.Unique)(["user", "course"])
], Enrollment);
//# sourceMappingURL=Enrollment.js.map