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
exports.Answer = void 0;
const typeorm_1 = require("typeorm");
const Question_1 = require("./Question");
let Answer = class Answer {
};
exports.Answer = Answer;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Answer.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text" }),
    __metadata("design:type", String)
], Answer.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "is_correct", type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], Answer.prototype, "isCorrect", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "order_index", type: "int", default: 1 }),
    __metadata("design:type", Number)
], Answer.prototype, "orderIndex", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Question_1.Question, (question) => question.answers, { onDelete: "CASCADE" }),
    __metadata("design:type", Question_1.Question)
], Answer.prototype, "question", void 0);
exports.Answer = Answer = __decorate([
    (0, typeorm_1.Entity)({ name: "answers" })
], Answer);
//# sourceMappingURL=Answer.js.map