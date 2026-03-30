"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const data_source_1 = require("./data-source");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const cart_routes_1 = __importDefault(require("./routes/cart.routes"));
const category_routes_1 = __importDefault(require("./routes/category.routes"));
const course_routes_1 = __importDefault(require("./routes/course.routes"));
const learning_routes_1 = __importDefault(require("./routes/learning.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const quiz_routes_1 = __importDefault(require("./routes/quiz.routes"));
const review_routes_1 = __importDefault(require("./routes/review.routes"));
const tag_routes_1 = __importDefault(require("./routes/tag.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const wishlist_routes_1 = __importDefault(require("./routes/wishlist.routes"));
const OrderService_1 = require("./services/OrderService");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 9090;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/api/auth", auth_routes_1.default);
app.use("/api/cart", cart_routes_1.default);
app.use("/api/categories", category_routes_1.default);
app.use("/api/courses", course_routes_1.default);
app.use("/api/learning", learning_routes_1.default);
app.use("/api/learning", quiz_routes_1.default);
app.use("/api/orders", order_routes_1.default);
app.use("/api/reviews", review_routes_1.default);
app.use("/api/tags", tag_routes_1.default);
app.use("/api/users", user_routes_1.default);
app.use("/api/wishlist", wishlist_routes_1.default);
app.get("/", (_req, res) => {
    res.status(200).json({ message: "Cinx backend is running." });
});
const bootstrap = async () => {
    try {
        await (0, data_source_1.initializeDatabase)();
        OrderService_1.orderService.startPendingOrderExpirationWorker();
        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};
void bootstrap();
//# sourceMappingURL=index.js.map