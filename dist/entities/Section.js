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
exports.Section = void 0;
const typeorm_1 = require("typeorm");
const Course_1 = require("./Course");
const Lecture_1 = require("./Lecture");
const Quiz_1 = require("./Quiz");
let Section = class Section {
};
exports.Section = Section;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Section.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 160 }),
    __metadata("design:type", String)
], Section.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "order_index", type: "int", default: 1 }),
    __metadata("design:type", Number)
], Section.prototype, "orderIndex", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Course_1.Course, (course) => course.sections, { onDelete: "CASCADE" }),
    __metadata("design:type", Course_1.Course)
], Section.prototype, "course", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Lecture_1.Lecture, (lecture) => lecture.section, { cascade: true }),
    __metadata("design:type", Array)
], Section.prototype, "lectures", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Quiz_1.Quiz, (quiz) => quiz.section, { cascade: true }),
    __metadata("design:type", Array)
], Section.prototype, "quizzes", void 0);
exports.Section = Section = __decorate([
    (0, typeorm_1.Entity)({ name: "sections" })
], Section);
//# sourceMappingURL=Section.js.map