"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = exports.AppDataSource = void 0;
require("reflect-metadata");
const dotenv_1 = __importDefault(require("dotenv"));
const typeorm_1 = require("typeorm");
const Answer_1 = require("./entities/Answer");
const Cart_1 = require("./entities/Cart");
const CartItem_1 = require("./entities/CartItem");
const Category_1 = require("./entities/Category");
const Coupon_1 = require("./entities/Coupon");
const Course_1 = require("./entities/Course");
const Enrollment_1 = require("./entities/Enrollment");
const Lecture_1 = require("./entities/Lecture");
const LectureCompletion_1 = require("./entities/LectureCompletion");
const OtpRecord_1 = require("./entities/OtpRecord");
const Order_1 = require("./entities/Order");
const OrderDetail_1 = require("./entities/OrderDetail");
const Profile_1 = require("./entities/Profile");
const Question_1 = require("./entities/Question");
const Quiz_1 = require("./entities/Quiz");
const QuizAttempt_1 = require("./entities/QuizAttempt");
const Review_1 = require("./entities/Review");
const Section_1 = require("./entities/Section");
const Tag_1 = require("./entities/Tag");
const User_1 = require("./entities/User");
dotenv_1.default.config();
exports.AppDataSource = new typeorm_1.DataSource({
    type: "mysql",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "root",
    database: process.env.DB_NAME || "cinx_db",
    entities: [
        User_1.User,
        OtpRecord_1.OtpRecord,
        Profile_1.Profile,
        Category_1.Category,
        Course_1.Course,
        Section_1.Section,
        Lecture_1.Lecture,
        LectureCompletion_1.LectureCompletion,
        Quiz_1.Quiz,
        QuizAttempt_1.QuizAttempt,
        Question_1.Question,
        Answer_1.Answer,
        Cart_1.Cart,
        CartItem_1.CartItem,
        Order_1.Order,
        OrderDetail_1.OrderDetail,
        Coupon_1.Coupon,
        Enrollment_1.Enrollment,
        Review_1.Review,
        Tag_1.Tag,
    ],
    synchronize: true,
    logging: false,
});
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
// Initialize database connection once and retry while MySQL container is still booting.
const initializeDatabase = async () => {
    if (exports.AppDataSource.isInitialized) {
        return;
    }
    const maxAttempts = 10;
    const retryDelayMs = 3000;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
            await exports.AppDataSource.initialize();
            console.log("Database connected successfully.");
            return;
        }
        catch (error) {
            if (attempt === maxAttempts) {
                throw error;
            }
            console.warn(`Database connection attempt ${attempt}/${maxAttempts} failed. Retrying in ${retryDelayMs / 1000}s...`);
            await sleep(retryDelayMs);
        }
    }
};
exports.initializeDatabase = initializeDatabase;
//# sourceMappingURL=data-source.js.map