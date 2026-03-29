"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRepository = exports.OrderRepository = void 0;
const data_source_1 = require("../data-source");
const Order_1 = require("../entities/Order");
class OrderRepository {
    constructor() {
        this.repository = data_source_1.AppDataSource.getRepository(Order_1.Order);
    }
    async save(order) {
        return this.repository.save(order);
    }
    async findById(orderId) {
        return this.repository.findOne({
            where: { id: orderId },
            relations: {
                details: true,
                user: true,
                coupon: true,
            },
        });
    }
}
exports.OrderRepository = OrderRepository;
exports.orderRepository = new OrderRepository();
//# sourceMappingURL=OrderRepository.js.map