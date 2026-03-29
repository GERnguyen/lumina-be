"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = exports.UserRepository = void 0;
const data_source_1 = require("../data-source");
const User_1 = require("../entities/User");
class UserRepository {
    constructor() {
        this.repository = data_source_1.AppDataSource.getRepository(User_1.User);
    }
    async findByEmail(email) {
        return this.repository.findOne({
            where: { email },
            relations: {
                profile: true,
            },
        });
    }
    async save(user) {
        return this.repository.save(user);
    }
}
exports.UserRepository = UserRepository;
exports.userRepository = new UserRepository();
//# sourceMappingURL=UserRepository.js.map