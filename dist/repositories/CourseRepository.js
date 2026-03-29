"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.courseRepository = exports.CourseRepository = void 0;
const data_source_1 = require("../data-source");
const Course_1 = require("../entities/Course");
class CourseRepository {
    constructor() {
        this.repository = data_source_1.AppDataSource.getRepository(Course_1.Course);
    }
    async findActiveCourses() {
        return this.repository.find({
            where: { isActive: true },
            relations: {
                category: true,
                instructor: true,
            },
            order: {
                createdAt: "DESC",
            },
        });
    }
}
exports.CourseRepository = CourseRepository;
exports.courseRepository = new CourseRepository();
//# sourceMappingURL=CourseRepository.js.map