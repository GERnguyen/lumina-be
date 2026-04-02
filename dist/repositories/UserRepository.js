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
    async findById(id) {
        return this.repository.findOne({
            where: { id },
            relations: {
                profile: true,
            },
        });
    }
    async save(user) {
        return this.repository.save(user);
    }
    async findUsersByRole(role) {
        return this.repository
            .createQueryBuilder("user")
            .leftJoinAndSelect("user.profile", "profile")
            .select([
            "user.id",
            "user.email",
            "user.role",
            "user.phone",
            "user.isActive",
            "user.rewardPoints",
            "user.createdAt",
            "user.updatedAt",
            "profile.id",
            "profile.fullName",
            "profile.avatar",
            "profile.bio",
            "profile.phoneNumber",
        ])
            .where("LOWER(user.role) = :role", { role: role.toLowerCase() })
            .orderBy("user.createdAt", "DESC")
            .getMany();
    }
}
exports.UserRepository = UserRepository;
exports.userRepository = new UserRepository();
//# sourceMappingURL=UserRepository.js.map