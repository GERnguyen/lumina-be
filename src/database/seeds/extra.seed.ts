import "reflect-metadata";
import { Faker, vi } from "@faker-js/faker";
import { AppDataSource, initializeDatabase } from "../../data-source";
import { Category } from "../../entities/Category";
import { Course } from "../../entities/Course";
import { Enrollment } from "../../entities/Enrollment";
import { Review } from "../../entities/Review";
import { Tag } from "../../entities/Tag";
import { User } from "../../entities/User";

const faker = new Faker({ locale: [vi] });

const EXTRA_COURSES_COUNT = Number(process.env.EXTRA_COURSES_COUNT ?? 10);
const EXTRA_REVIEW_COUNT = Number(process.env.EXTRA_REVIEW_COUNT ?? 30);
const EXTRA_ENROLLMENT_COUNT = Number(process.env.EXTRA_ENROLLMENT_COUNT ?? 40);

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function randomSubset<T>(source: T[], maxItems: number): T[] {
  const copied = [...source];
  const size = Math.max(0, Math.min(maxItems, copied.length));

  for (let i = copied.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copied[i], copied[j]] = [copied[j], copied[i]];
  }

  return copied.slice(0, size);
}

async function runExtraSeed(): Promise<void> {
  await initializeDatabase();

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const manager = queryRunner.manager;

    const userRepo = manager.getRepository(User);
    const categoryRepo = manager.getRepository(Category);
    const courseRepo = manager.getRepository(Course);
    const enrollmentRepo = manager.getRepository(Enrollment);
    const reviewRepo = manager.getRepository(Review);
    const tagRepo = manager.getRepository(Tag);

    const instructors = await userRepo.find({
      where: { role: "instructor" },
      relations: { profile: true },
    });

    const students = await userRepo.find({
      where: { role: "student" },
      relations: { profile: true },
    });

    if (instructors.length === 0) {
      throw new Error("No instructor found. Cannot seed extra courses.");
    }

    if (students.length === 0) {
      throw new Error("No student found. Cannot seed enrollments/reviews.");
    }

    const categories = await categoryRepo
      .createQueryBuilder("category")
      .leftJoin("category.courses", "course")
      .addSelect("COUNT(course.id)", "courseCount")
      .groupBy("category.id")
      .addGroupBy("category.name")
      .addGroupBy("category.description")
      .addGroupBy("category.createdAt")
      .addGroupBy("category.updatedAt")
      .orderBy("courseCount", "ASC")
      .getMany();

    if (categories.length === 0) {
      throw new Error("No category found. Cannot seed extra courses.");
    }

    const allTags = await tagRepo.find();

    const createdCourses: Course[] = [];

    for (let index = 0; index < EXTRA_COURSES_COUNT; index += 1) {
      const instructor = instructors[index % instructors.length];
      const category = categories[index % categories.length];
      const title = `${category.name} Masterclass ${faker.number.int({ min: 1000, max: 9999 })}`;
      const slug = `${slugify(title)}-${Date.now()}-${index}`;

      const course = courseRepo.create({
        title,
        slug,
        description: faker.lorem.paragraphs(2),
        thumbnailUrl: faker.helpers.arrayElement([
          "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1516321310762-479bf5f6f0c?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1487014679447-9f8336841d58?auto=format&fit=crop&w=1200&q=80",
        ]),
        price: Number(
          faker.number.float({ min: 199000, max: 999000, fractionDigits: 0 }),
        ),
        enrollmentCount: 0,
        discountPercent: faker.helpers.arrayElement([0, 10, 15, 20]),
        averageRating: 0,
        reviewCount: 0,
        isActive: true,
        publishedAt: new Date(),
        instructor,
        category,
        tags: randomSubset(allTags, Math.max(1, Math.min(3, allTags.length))),
      });

      createdCourses.push(await courseRepo.save(course));
    }

    const existingCourses = await courseRepo.find({
      where: { isActive: true },
      relations: { instructor: true },
    });

    const candidateCourses = existingCourses.filter(
      (course) => course.instructor.role.toLowerCase() === "instructor",
    );

    const enrollmentCreated = new Set<string>();
    let enrollmentAdded = 0;

    while (
      enrollmentAdded < EXTRA_ENROLLMENT_COUNT &&
      candidateCourses.length > 0 &&
      students.length > 0
    ) {
      const student = faker.helpers.arrayElement(students);
      const course = faker.helpers.arrayElement(candidateCourses);
      const key = `${student.id}-${course.id}`;

      if (enrollmentCreated.has(key)) {
        continue;
      }

      const exists = await enrollmentRepo.exist({
        where: {
          user: { id: student.id },
          course: { id: course.id },
        },
      });

      if (exists) {
        enrollmentCreated.add(key);
        continue;
      }

      const progressPercent = faker.helpers.arrayElement([
        0, 20, 40, 60, 80, 100,
      ]);

      await enrollmentRepo.save(
        enrollmentRepo.create({
          user: student,
          course,
          progressPercent,
          completedAt: progressPercent === 100 ? new Date() : undefined,
        }),
      );

      await courseRepo.update(course.id, {
        enrollmentCount: Number(course.enrollmentCount) + 1,
      });

      enrollmentCreated.add(key);
      enrollmentAdded += 1;
    }

    const reviewCreated = new Set<string>();
    let reviewAdded = 0;

    while (
      reviewAdded < EXTRA_REVIEW_COUNT &&
      candidateCourses.length > 0 &&
      students.length > 0
    ) {
      const student = faker.helpers.arrayElement(students);
      const course = faker.helpers.arrayElement(candidateCourses);
      const key = `${student.id}-${course.id}`;

      if (reviewCreated.has(key)) {
        continue;
      }

      const exists = await reviewRepo.exist({
        where: {
          user: { id: student.id },
          course: { id: course.id },
        },
      });

      if (exists) {
        reviewCreated.add(key);
        continue;
      }

      const rating = faker.helpers.arrayElement([3, 4, 5]);

      await reviewRepo.save(
        reviewRepo.create({
          user: student,
          course,
          rating,
          comment: faker.lorem.sentences(2),
        }),
      );

      const aggregates = await reviewRepo
        .createQueryBuilder("review")
        .select("COUNT(review.id)", "count")
        .addSelect("AVG(review.rating)", "avg")
        .where("review.courseId = :courseId", { courseId: course.id })
        .getRawOne<{ count: string; avg: string }>();

      await courseRepo.update(course.id, {
        reviewCount: Number(aggregates?.count ?? 0),
        averageRating: Number(Number(aggregates?.avg ?? 0).toFixed(2)),
      });

      reviewCreated.add(key);
      reviewAdded += 1;
    }

    await queryRunner.commitTransaction();

    console.log("[ExtraSeed] Done.");
    console.log(`[ExtraSeed] Courses added: ${createdCourses.length}`);
    console.log(`[ExtraSeed] Enrollments added: ${enrollmentAdded}`);
    console.log(`[ExtraSeed] Reviews added: ${reviewAdded}`);
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();

    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

void runExtraSeed().catch((error) => {
  console.error("[ExtraSeed] Failed:", error);
  process.exitCode = 1;
});
