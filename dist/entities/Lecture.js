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
exports.Lecture = void 0;
const typeorm_1 = require("typeorm");
const Section_1 = require("./Section");
let Lecture = class Lecture {
};
exports.Lecture = Lecture;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Lecture.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 180 }),
    __metadata("design:type", String)
], Lecture.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "content_text", type: "text", nullable: true }),
    __metadata("design:type", String)
], Lecture.prototype, "contentText", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "video_url", type: "varchar", length: 500, nullable: true }),
    __metadata("design:type", String)
], Lecture.prototype, "videoUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "order_index", type: "int", default: 1 }),
    __metadata("design:type", Number)
], Lecture.prototype, "orderIndex", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Section_1.Section, (section) => section.lectures, { onDelete: "CASCADE" }),
    __metadata("design:type", Section_1.Section)
], Lecture.prototype, "section", void 0);
exports.Lecture = Lecture = __decorate([
    (0, typeorm_1.Entity)({ name: "lectures" })
], Lecture);
//# sourceMappingURL=Lecture.js.map