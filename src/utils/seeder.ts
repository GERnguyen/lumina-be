import bcrypt from "bcrypt";
import { faker } from "@faker-js/faker/locale/vi";
import { AppDataSource, initializeDatabase } from "../data-source";
import { User } from "../entities/User";
import { Profile } from "../entities/Profile";
import { Category } from "../entities/Category";
import { Tag } from "../entities/Tag";
import { Course } from "../entities/Course";
import { Section } from "../entities/Section";
import { Lecture } from "../entities/Lecture";
import { Quiz } from "../entities/Quiz";
import { Question } from "../entities/Question";
import { Answer } from "../entities/Answer";
import { Review } from "../entities/Review";

const TOTAL_USERS = 50;
const TOTAL_INSTRUCTORS = 5;
const TOTAL_STUDENTS = TOTAL_USERS - 1 - TOTAL_INSTRUCTORS;
const TOTAL_COURSES = 100;
const TOTAL_REVIEWS = 200;
const TOTAL_DETAIL_COURSES = 30;

const categoryData = [
  { name: "Lap trinh Web", desc: "Xay dung website hien dai" },
  { name: "Lap trinh Mobile", desc: "Tao ung dung iOS/Android" },
  { name: "Data Science", desc: "Phan tich du lieu & AI" },
  { name: "UI/UX Design", desc: "Thiet ke giao dien nguoi dung" },
];

const coursePrefixes = [
  "Thuc chien",
  "Masterclass",
  "Toan tap",
  "Bootcamp",
  "Tu Zero den Hero",
];

const courseTechnologies = [
  "React Native",
  "Node.js",
  "Java Spring Boot",
  "Python Django",
  "Figma",
  "Flutter",
  "AWS",
  "Docker",
  "Next.js",
];

const courseDescriptions = [
  "Khoa hoc thiet ke chuan ky su, thuc hanh qua 5 du an thuc te.",
  "Phu hop cho nguoi moi bat dau, lo trinh hoc chi tiet ro rang.",
  "Hoc xong tu tin apply phong van tai cac tap doan cong nghe lon.",
  "Cung cap tron bo source code va ho tro truc tiep tu Mentor.",
];

const sectionTitles = [
  "Chuong 1: Gioi thieu & Cai dat moi truong",
  "Chuong 2: Cac khai niem cot loi",
  "Chuong 3: Thuc hanh lam Project 1",
  "Chuong 4: Toi uu va Deploy",
  "Chuong 5: Tong ket khoa hoc",
];

const review5Stars = [
  "Khoa hoc cuc ky chat luong, giang vien day rat co tam!",
  "Kien thuc thuc te, de hieu. Rat dang tien!",
  "Minh da xin duoc viec ngay sau khi hoc xong khoa nay.",
];

const review4Stars = [
  "Noi dung hay nhung video doi cho hoi be.",
  "Khoa hoc rat tot, mong giang vien ra them phan nang cao.",
];

const review3Stars = [
  "Muc do co ban, phu hop voi newbie hon.",
  "Can them nhieu bai tap thuc hanh hon.",
];

const tagNames = [
  "react",
  "nodejs",
  "python",
  "design",
  "web",
  "mobile",
  "database",
];

const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const pickOne = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const pickManyUnique = <T>(arr: T[], min: number, max: number): T[] => {
  const size = randomInt(min, Math.min(max, arr.length));
  const pool = [...arr];
  const out: T[] = [];

  for (let i = 0; i < size; i += 1) {
    const idx = Math.floor(Math.random() * pool.length);
    out.push(pool[idx]);
    pool.splice(idx, 1);
  }

  return out;
};

const makeSlug = (title: string, index: number): string => {
  const normalized = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

  return `${normalized}-${index + 1}-${faker.string.alphanumeric(5).toLowerCase()}`;
};

const cleanOldData = async (): Promise<void> => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    await queryRunner.query("SET FOREIGN_KEY_CHECKS = 0");

    const tables = [
      "answers",
      "questions",
      "quizzes",
      "lectures",
      "sections",
      "reviews",
      "enrollments",
      "order_details",
      "orders",
      "cart_items",
      "carts",
      "course_tags",
      "user_favorites",
      "courses",
      "tags",
      "categories",
      "otp_records",
      "profiles",
      "users",
      "coupons",
    ];

    for (const table of tables) {
      await queryRunner.query(`TRUNCATE TABLE ${table}`);
    }
  } finally {
    await queryRunner.query("SET FOREIGN_KEY_CHECKS = 1");
    await queryRunner.release();
  }
};

const buildCourseDescription = (): string => {
  const first = pickOne(courseDescriptions);
  let second = pickOne(courseDescriptions);

  while (second === first) {
    second = pickOne(courseDescriptions);
  }

  return `${first} ${second}`;
};

const buildReviewComment = (rating: number): string => {
  if (rating === 5) {
    return pickOne(review5Stars);
  }

  if (rating === 4) {
    return pickOne(review4Stars);
  }

  return pickOne(review3Stars);
};

const seed = async (): Promise<void> => {
  await initializeDatabase();

  const userRepo = AppDataSource.getRepository(User);
  const profileRepo = AppDataSource.getRepository(Profile);
  const categoryRepo = AppDataSource.getRepository(Category);
  const tagRepo = AppDataSource.getRepository(Tag);
  const courseRepo = AppDataSource.getRepository(Course);
  const sectionRepo = AppDataSource.getRepository(Section);
  const lectureRepo = AppDataSource.getRepository(Lecture);
  const quizRepo = AppDataSource.getRepository(Quiz);
  const questionRepo = AppDataSource.getRepository(Question);
  const answerRepo = AppDataSource.getRepository(Answer);
  const reviewRepo = AppDataSource.getRepository(Review);

  console.log("[Seeder] Step 1/8 - Cleaning old data...");
  await cleanOldData();

  console.log(
    "[Seeder] Step 2/8 - Seeding users (1 admin, 5 instructors, 44 students)...",
  );
  const hashedPassword = await bcrypt.hash("123456", 10);

  const usersPayload: User[] = [];
  usersPayload.push(
    userRepo.create({
      email: "admin@cinx.local",
      password: hashedPassword,
      role: "admin",
      rewardPoints: 1000,
      isActive: true,
    }),
  );

  for (let i = 0; i < TOTAL_INSTRUCTORS; i += 1) {
    usersPayload.push(
      userRepo.create({
        email: `instructor${i + 1}@cinx.local`,
        password: hashedPassword,
        role: "instructor",
        rewardPoints: randomInt(100, 500),
        isActive: true,
      }),
    );
  }

  for (let i = 0; i < TOTAL_STUDENTS; i += 1) {
    usersPayload.push(
      userRepo.create({
        email: faker.internet.email().toLowerCase(),
        password: hashedPassword,
        role: "student",
        rewardPoints: Math.random() < 0.35 ? randomInt(100, 1000) : 0,
        isActive: true,
      }),
    );
  }

  const users = await userRepo.save(usersPayload);

  const profilesPayload = users.map((u) =>
    profileRepo.create({
      fullName: faker.person.fullName(),
      phoneNumber: faker.phone.number({ style: "national" }).slice(0, 20),
      avatar: faker.image.avatar(),
      bio: faker.person.jobDescriptor(),
      user: u,
    }),
  );
  await profileRepo.save(profilesPayload);

  const instructors = users.filter((u) => u.role === "instructor");
  const students = users.filter((u) => u.role === "student");

  console.log("[Seeder] Step 3/8 - Seeding categories and tags...");
  const categories = await categoryRepo.save(
    categoryData.map((item) =>
      categoryRepo.create({
        name: item.name,
        description: item.desc,
      }),
    ),
  );

  const tags = await tagRepo.save(
    tagNames.map((name) =>
      tagRepo.create({
        name,
      }),
    ),
  );

  console.log("[Seeder] Step 4/8 - Seeding 100 courses...");
  const coursesPayload: Course[] = [];

  for (let i = 0; i < TOTAL_COURSES; i += 1) {
    const tech = pickOne(courseTechnologies);
    const prefix = pickOne(coursePrefixes);
    const title = `${tech} ${prefix}`;
    const price = randomInt(20, 300) * 10_000;

    coursesPayload.push(
      courseRepo.create({
        title,
        slug: makeSlug(title, i),
        description: buildCourseDescription(),
        thumbnailUrl: `https://picsum.photos/seed/${Math.random()}/600/400`,
        price,
        discountPercent: randomInt(0, 60),
        enrollmentCount: randomInt(0, 5000),
        isActive: true,
        publishedAt: faker.date.past({ years: 1 }),
        instructor: pickOne(instructors),
        category: pickOne(categories),
        tags: pickManyUnique(tags, 2, 3),
      }),
    );
  }

  const courses = await courseRepo.save(coursesPayload);

  console.log(
    "[Seeder] Step 5/8 - Seeding learning content for 30 random courses...",
  );
  const detailedCourses = pickManyUnique(
    courses,
    TOTAL_DETAIL_COURSES,
    TOTAL_DETAIL_COURSES,
  );

  const sectionsPayload: Section[] = [];
  for (const course of detailedCourses) {
    const selectedSectionTitles = pickManyUnique(sectionTitles, 3, 3);

    for (let i = 0; i < selectedSectionTitles.length; i += 1) {
      sectionsPayload.push(
        sectionRepo.create({
          title: selectedSectionTitles[i],
          orderIndex: i + 1,
          course,
        }),
      );
    }
  }

  const sections = await sectionRepo.save(sectionsPayload);

  const lecturesPayload: Lecture[] = [];
  const quizzesPayload: Quiz[] = [];

  for (const section of sections) {
    for (let i = 1; i <= 3; i += 1) {
      lecturesPayload.push(
        lectureRepo.create({
          title: `Bai ${i}: Noi dung bai hoc ${i}`,
          contentText: `Tom tat bai ${i} thuoc ${section.title}`,
          videoUrl: `https://www.youtube.com/watch?v=${faker.string.alphanumeric(11)}`,
          orderIndex: i,
          section,
        }),
      );
    }

    quizzesPayload.push(
      quizRepo.create({
        title: `Quiz ${section.title}`,
        description: "Bai kiem tra nhanh cuoi chuong",
        orderIndex: 1,
        section,
      }),
    );
  }

  await lectureRepo.save(lecturesPayload);
  const quizzes = await quizRepo.save(quizzesPayload);

  console.log("[Seeder] Step 6/8 - Seeding quizzes/questions/answers...");
  const questionsPayload: Question[] = [];

  for (const quiz of quizzes) {
    for (let q = 1; q <= 2; q += 1) {
      questionsPayload.push(
        questionRepo.create({
          content: `Cau hoi ${q} cua ${quiz.title}?`,
          orderIndex: q,
          quiz,
        }),
      );
    }
  }

  const questions = await questionRepo.save(questionsPayload);

  const answersPayload: Answer[] = [];
  for (const question of questions) {
    const correctIndex = randomInt(1, 4);

    for (let a = 1; a <= 4; a += 1) {
      answersPayload.push(
        answerRepo.create({
          content: `Dap an ${a} cho cau hoi ${question.orderIndex}`,
          isCorrect: a === correctIndex,
          orderIndex: a,
          question,
        }),
      );
    }
  }

  await answerRepo.save(answersPayload);

  console.log("[Seeder] Step 7/8 - Seeding 200 reviews...");
  const reviewsPayload: Review[] = [];
  const uniquePairs = new Set<string>();

  while (reviewsPayload.length < TOTAL_REVIEWS) {
    const user = pickOne(students);
    const course = pickOne(courses);
    const key = `${user.id}-${course.id}`;

    if (uniquePairs.has(key)) {
      continue;
    }

    uniquePairs.add(key);
    const rating = randomInt(3, 5);

    reviewsPayload.push(
      reviewRepo.create({
        user,
        course,
        rating,
        comment: buildReviewComment(rating),
      }),
    );
  }

  await reviewRepo.save(reviewsPayload);

  console.log("[Seeder] Step 8/8 - Done.");
  console.log("----------------------------------------");
  console.log("[Seeder] Seed completed successfully.");
  console.log(`[Seeder] Users: ${users.length}`);
  console.log(`[Seeder] Categories: ${categories.length}`);
  console.log(`[Seeder] Tags: ${tags.length}`);
  console.log(`[Seeder] Courses: ${courses.length}`);
  console.log(`[Seeder] Reviews: ${reviewsPayload.length}`);
  console.log("[Seeder] SUCCESS: Seeded 100 courses for pagination tests.");
  console.log("[Seeder] Default password for all users: 123456");
  console.log("----------------------------------------");
};

void seed()
  .catch((error) => {
    console.error("[Seeder] Failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });
