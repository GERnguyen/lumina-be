"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.courseRepository = exports.CourseRepository = void 0;
const data_source_1 = require("../data-source");
const Course_1 = require("../entities/Course");
class CourseRepository {
    constructor() {
        this.repository = data_source_1.AppDataSource.getRepository(Course_1.Course);
    }
    async findAllCourses(filters) {
        const page = filters.page && filters.page > 0 ? filters.page : 1;
        const limit = filters.limit && filters.limit > 0 ? filters.limit : 10;
        const sortBy = filters.sortBy?.trim().toLowerCase();
        const priceType = filters.priceType?.trim().toLowerCase();
        const isDiscounted = filters.isDiscounted === true;
        const queryBuilder = this.repository
            .createQueryBuilder("course")
            .leftJoinAndSelect("course.category", "category")
            .leftJoinAndSelect("course.instructor", "instructor")
            .leftJoinAndSelect("instructor.profile", "profile")
            .leftJoinAndSelect("course.tags", "tag")
            .distinct(true)
            .select([
            "course.id",
            "course.title",
            "course.slug",
            "course.description",
            "course.thumbnailUrl",
            "course.price",
            "course.enrollmentCount",
            "course.discountPercent",
            "course.averageRating",
            "course.reviewCount",
            "course.isActive",
            "course.publishedAt",
            "course.createdAt",
            "course.updatedAt",
            "category.id",
            "category.name",
            "category.description",
            "instructor.id",
            "instructor.email",
            "instructor.role",
            "profile.id",
            "profile.fullName",
            "profile.avatar",
            "tag.id",
            "tag.name",
        ])
            .where("course.isActive = :isActive", { isActive: true });
        if (filters.categoryId) {
            queryBuilder.andWhere("category.id = :categoryId", {
                categoryId: filters.categoryId,
            });
        }
        if (filters.keyword) {
            queryBuilder.andWhere("(course.title LIKE :keyword OR course.description LIKE :keyword)", { keyword: `%${filters.keyword}%` });
        }
        if (filters.tag) {
            queryBuilder.andWhere("LOWER(tag.name) = :tag", {
                tag: filters.tag.trim().toLowerCase(),
            });
        }
        if (priceType === "free") {
            queryBuilder.andWhere("course.price = 0");
        }
        else if (priceType === "paid") {
            queryBuilder.andWhere("course.price > 0");
        }
        if (isDiscounted) {
            queryBuilder.andWhere("course.discountPercent > 0");
        }
        switch (sortBy) {
            case "best_seller":
                queryBuilder.orderBy("course.enrollmentCount", "DESC");
                break;
            case "newest":
                queryBuilder.orderBy("course.createdAt", "DESC");
                break;
            case "price_asc":
                queryBuilder.orderBy("course.price", "ASC");
                break;
            case "price_desc":
                queryBuilder.orderBy("course.price", "DESC");
                break;
            case "top_rated":
                queryBuilder
                    .orderBy("course.averageRating", "DESC")
                    .addOrderBy("course.reviewCount", "DESC")
                    .addOrderBy("course.enrollmentCount", "DESC");
                break;
            default:
                queryBuilder.orderBy("course.createdAt", "DESC");
                break;
        }
        queryBuilder
            .addOrderBy("course.createdAt", "DESC")
            .skip((page - 1) * limit)
            .take(limit);
        const [courses, total] = await queryBuilder.getManyAndCount();
        return {
            data: courses,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getBestSellers() {
        return this.repository
            .createQueryBuilder("course")
            .leftJoinAndSelect("course.category", "category")
            .leftJoinAndSelect("course.instructor", "instructor")
            .leftJoinAndSelect("instructor.profile", "profile")
            .leftJoinAndSelect("course.tags", "tag")
            .select([
            "course.id",
            "course.title",
            "course.slug",
            "course.description",
            "course.thumbnailUrl",
            "course.price",
            "course.enrollmentCount",
            "course.discountPercent",
            "course.averageRating",
            "course.reviewCount",
            "course.isActive",
            "course.publishedAt",
            "course.createdAt",
            "course.updatedAt",
            "category.id",
            "category.name",
            "category.description",
            "instructor.id",
            "instructor.email",
            "instructor.role",
            "profile.id",
            "profile.fullName",
            "profile.avatar",
            "tag.id",
            "tag.name",
        ])
            .where("course.isActive = :isActive", { isActive: true })
            .orderBy("course.enrollmentCount", "DESC")
            .addOrderBy("course.createdAt", "DESC")
            .take(10)
            .getMany();
    }
    async getTopDiscounted() {
        return this.repository
            .createQueryBuilder("course")
            .leftJoinAndSelect("course.category", "category")
            .leftJoinAndSelect("course.instructor", "instructor")
            .leftJoinAndSelect("instructor.profile", "profile")
            .leftJoinAndSelect("course.tags", "tag")
            .select([
            "course.id",
            "course.title",
            "course.slug",
            "course.description",
            "course.thumbnailUrl",
            "course.price",
            "course.enrollmentCount",
            "course.discountPercent",
            "course.averageRating",
            "course.reviewCount",
            "course.isActive",
            "course.publishedAt",
            "course.createdAt",
            "course.updatedAt",
            "category.id",
            "category.name",
            "category.description",
            "instructor.id",
            "instructor.email",
            "instructor.role",
            "profile.id",
            "profile.fullName",
            "profile.avatar",
            "tag.id",
            "tag.name",
        ])
            .where("course.isActive = :isActive", { isActive: true })
            .orderBy("course.discountPercent", "DESC")
            .addOrderBy("course.createdAt", "DESC")
            .take(20)
            .getMany();
    }
    async getSimilarCourses(courseId) {
        const baseCourse = await this.repository.findOne({
            where: { id: courseId },
            relations: {
                category: true,
            },
            select: {
                id: true,
                category: {
                    id: true,
                },
            },
        });
        if (!baseCourse?.category?.id) {
            return [];
        }
        return this.repository
            .createQueryBuilder("course")
            .leftJoinAndSelect("course.category", "category")
            .leftJoinAndSelect("course.instructor", "instructor")
            .leftJoinAndSelect("instructor.profile", "profile")
            .leftJoinAndSelect("course.tags", "tag")
            .select([
            "course.id",
            "course.title",
            "course.slug",
            "course.description",
            "course.thumbnailUrl",
            "course.price",
            "course.enrollmentCount",
            "course.discountPercent",
            "course.averageRating",
            "course.reviewCount",
            "course.isActive",
            "course.publishedAt",
            "course.createdAt",
            "course.updatedAt",
            "category.id",
            "category.name",
            "category.description",
            "instructor.id",
            "instructor.email",
            "instructor.role",
            "profile.id",
            "profile.fullName",
            "profile.avatar",
            "tag.id",
            "tag.name",
        ])
            .where("course.isActive = :isActive", { isActive: true })
            .andWhere("category.id = :categoryId", {
            categoryId: baseCourse.category.id,
        })
            .andWhere("course.id != :courseId", { courseId })
            .orderBy("course.enrollmentCount", "DESC")
            .addOrderBy("course.createdAt", "DESC")
            .take(5)
            .getMany();
    }
    async findCourseById(id) {
        return this.repository
            .createQueryBuilder("course")
            .leftJoinAndSelect("course.category", "category")
            .leftJoinAndSelect("course.instructor", "instructor")
            .leftJoinAndSelect("instructor.profile", "profile")
            .leftJoinAndSelect("course.tags", "tag")
            .leftJoinAndSelect("course.sections", "section")
            .leftJoinAndSelect("section.lectures", "lecture")
            .leftJoinAndSelect("section.quizzes", "quiz")
            .select([
            "course.id",
            "course.title",
            "course.slug",
            "course.description",
            "course.thumbnailUrl",
            "course.price",
            "course.enrollmentCount",
            "course.discountPercent",
            "course.averageRating",
            "course.reviewCount",
            "course.isActive",
            "course.publishedAt",
            "course.createdAt",
            "course.updatedAt",
            "category.id",
            "category.name",
            "category.description",
            "instructor.id",
            "instructor.email",
            "instructor.role",
            "profile.id",
            "profile.fullName",
            "profile.avatar",
            "tag.id",
            "tag.name",
            "section.id",
            "section.title",
            "section.orderIndex",
            "lecture.id",
            "lecture.title",
            "lecture.contentText",
            "lecture.videoUrl",
            "lecture.orderIndex",
            "quiz.id",
            "quiz.title",
            "quiz.description",
            "quiz.orderIndex",
        ])
            .where("course.id = :id", { id })
            .orderBy("section.orderIndex", "ASC")
            .addOrderBy("lecture.orderIndex", "ASC")
            .getOne();
    }
    async createCourse(input) {
        const course = this.repository.create({
            title: input.title,
            slug: input.slug,
            description: input.description,
            thumbnailUrl: input.thumbnailUrl,
            price: input.price ?? 0,
            enrollmentCount: 0,
            discountPercent: 0,
            instructor: input.instructor,
            category: input.category,
            tags: input.tags,
            publishedAt: undefined,
            isActive: false,
        });
        const savedCourse = await this.repository.save(course);
        const hydratedCourse = await this.findCourseById(savedCourse.id);
        if (!hydratedCourse) {
            throw new Error("Failed to load created course.");
        }
        return hydratedCourse;
    }
    async findCoursesByInstructor(instructorId) {
        return this.repository
            .createQueryBuilder("course")
            .leftJoinAndSelect("course.category", "category")
            .leftJoinAndSelect("course.instructor", "instructor")
            .leftJoinAndSelect("instructor.profile", "profile")
            .leftJoinAndSelect("course.tags", "tag")
            .select([
            "course.id",
            "course.title",
            "course.slug",
            "course.description",
            "course.thumbnailUrl",
            "course.price",
            "course.enrollmentCount",
            "course.discountPercent",
            "course.averageRating",
            "course.reviewCount",
            "course.isActive",
            "course.publishedAt",
            "course.createdAt",
            "course.updatedAt",
            "category.id",
            "category.name",
            "category.description",
            "instructor.id",
            "instructor.email",
            "instructor.role",
            "profile.id",
            "profile.fullName",
            "profile.avatar",
            "tag.id",
            "tag.name",
        ])
            .where("instructor.id = :instructorId", { instructorId })
            .orderBy("course.createdAt", "DESC")
            .getMany();
    }
    async updateCourseByInstructor(courseId, instructorId, input) {
        const course = await this.repository.findOne({
            where: { id: courseId },
            relations: {
                instructor: true,
            },
        });
        if (!course) {
            throw new Error("Course not found");
        }
        if (course.instructor.id !== instructorId) {
            throw new Error("FORBIDDEN_NOT_INSTRUCTOR_COURSE");
        }
        course.title = input.title;
        course.slug = input.slug;
        course.description = input.description;
        course.thumbnailUrl = input.thumbnailUrl;
        course.price = input.price ?? 0;
        course.category = input.category;
        course.tags = input.tags;
        const savedCourse = await this.repository.save(course);
        const hydratedCourse = await this.findCourseById(savedCourse.id);
        if (!hydratedCourse) {
            throw new Error("Failed to load updated course.");
        }
        return hydratedCourse;
    }
    async findCourseByIdForInstructor(courseId, instructorId) {
        return this.repository
            .createQueryBuilder("course")
            .leftJoinAndSelect("course.category", "category")
            .leftJoinAndSelect("course.instructor", "instructor")
            .leftJoinAndSelect("instructor.profile", "profile")
            .leftJoinAndSelect("course.tags", "tag")
            .leftJoinAndSelect("course.sections", "section")
            .leftJoinAndSelect("section.lectures", "lecture")
            .leftJoinAndSelect("section.quizzes", "quiz")
            .select([
            "course.id",
            "course.title",
            "course.slug",
            "course.description",
            "course.thumbnailUrl",
            "course.price",
            "course.enrollmentCount",
            "course.discountPercent",
            "course.averageRating",
            "course.reviewCount",
            "course.isActive",
            "course.publishedAt",
            "course.createdAt",
            "course.updatedAt",
            "category.id",
            "category.name",
            "category.description",
            "instructor.id",
            "instructor.email",
            "instructor.role",
            "profile.id",
            "profile.fullName",
            "profile.avatar",
            "tag.id",
            "tag.name",
            "section.id",
            "section.title",
            "section.orderIndex",
            "lecture.id",
            "lecture.title",
            "lecture.contentText",
            "lecture.videoUrl",
            "lecture.orderIndex",
            "quiz.id",
            "quiz.title",
            "quiz.description",
            "quiz.orderIndex",
        ])
            .where("course.id = :courseId", { courseId })
            .andWhere("instructor.id = :instructorId", { instructorId })
            .orderBy("section.orderIndex", "ASC")
            .addOrderBy("lecture.orderIndex", "ASC")
            .getOne();
    }
    async findPendingCoursesForAdmin() {
        return this.repository
            .createQueryBuilder("course")
            .leftJoinAndSelect("course.category", "category")
            .leftJoinAndSelect("course.instructor", "instructor")
            .leftJoinAndSelect("instructor.profile", "profile")
            .leftJoinAndSelect("course.tags", "tag")
            .select([
            "course.id",
            "course.title",
            "course.slug",
            "course.description",
            "course.thumbnailUrl",
            "course.price",
            "course.enrollmentCount",
            "course.discountPercent",
            "course.averageRating",
            "course.reviewCount",
            "course.isActive",
            "course.publishedAt",
            "course.createdAt",
            "course.updatedAt",
            "category.id",
            "category.name",
            "category.description",
            "instructor.id",
            "instructor.email",
            "instructor.role",
            "profile.id",
            "profile.fullName",
            "profile.avatar",
            "tag.id",
            "tag.name",
        ])
            .where("course.isActive = :isActive", { isActive: false })
            .orderBy("course.createdAt", "DESC")
            .getMany();
    }
}
exports.CourseRepository = CourseRepository;
exports.courseRepository = new CourseRepository();
//# sourceMappingURL=CourseRepository.js.map