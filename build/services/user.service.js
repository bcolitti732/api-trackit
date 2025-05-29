"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_1 = require("../models/user");
const mongoose_1 = __importDefault(require("mongoose"));
const geoUtils_1 = require("../utils/geoUtils");
class UserService {
    postUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            if (user.packets && Array.isArray(user.packets)) {
                user.packets = user.packets.filter((id) => mongoose_1.default.Types.ObjectId.isValid(id.toString()));
            }
            const newUser = new user_1.UserModel(user);
            return yield newUser.save();
        });
    }
    getAllUsers(page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = (page - 1) * limit;
            const totalUsers = yield user_1.UserModel.countDocuments({ available: true });
            const users = yield user_1.UserModel.find().skip(skip).limit(limit);
            return {
                totalUsers,
                totalPages: Math.ceil(totalUsers / limit),
                currentPage: page,
                data: users,
            };
        });
    }
    getUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield user_1.UserModel.findOne({ _id: id, available: true });
        });
    }
    getUserByName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield user_1.UserModel.findOne({ name, available: true });
        });
    }
    updateUserById(id, user) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield user_1.UserModel.findOneAndUpdate({ _id: id, available: true }, user, { new: true });
        });
    }
    deleteUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield user_1.UserModel.findByIdAndDelete(id);
        });
    }
    deactivateUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_1.UserModel.findById(id);
            if (!user) {
                throw new Error("User not found");
            }
            user.available = !user.available;
            return yield user.save();
        });
    }
    getUserPacketsById(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_1.UserModel.findById(userId).populate("packets");
            return user ? user.packets : null;
        });
    }
    addPacketToUser(userName, packetId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_1.UserModel.findOne({ name: userName, available: true });
            if (!user) {
                throw new Error("User not found");
            }
            if (!user.packets.includes(packetId)) {
                return yield user_1.UserModel.findByIdAndUpdate(user._id, { $push: { packets: packetId } }, { new: true, runValidators: false });
            }
            return user;
        });
    }
    assignPacket(userId, packetId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_1.UserModel.findById(userId);
            if (!user) {
                throw new Error("User not found");
            }
            if (user.role !== "delivery") {
                throw new Error("User is not a delivery");
            }
            if (!user.assignedPackets) {
                user.assignedPackets = [];
            }
            if (!user.assignedPackets.map(id => id.toString()).includes(packetId.toString())) {
                user.assignedPackets.push(packetId);
                yield user.save();
            }
            return user;
        });
    }
    getAssignedPackets(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_1.UserModel.findById(userId).populate("assignedPackets");
            if (!user) {
                throw new Error("User not found");
            }
            if (user.role !== "delivery") {
                throw new Error("User is not a delivery");
            }
            return user.assignedPackets || [];
        });
    }
    getOptimizedRoute(userId, startLocation) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const user = yield user_1.UserModel.findById(userId).populate("assignedPackets");
            if (!user)
                throw new Error("User not found");
            if (user.role !== "delivery")
                throw new Error("User is not a delivery");
            const packets = user.assignedPackets || [];
            const packetsWithCoords = packets.filter(p => p.destination && (0, geoUtils_1.parseCoordinates)(p.destination));
            const startCoords = startLocation
                ? (0, geoUtils_1.parseCoordinates)(startLocation)
                : (0, geoUtils_1.parseCoordinates)(((_a = packetsWithCoords[0]) === null || _a === void 0 ? void 0 : _a.location) || ((_b = packetsWithCoords[0]) === null || _b === void 0 ? void 0 : _b.origin) || ((_c = packetsWithCoords[0]) === null || _c === void 0 ? void 0 : _c.destination));
            if (!startCoords)
                throw new Error("Starting location is invalid or missing");
            const sortedPackets = [...packetsWithCoords].sort((a, b) => {
                const aCoords = (0, geoUtils_1.parseCoordinates)(a.destination);
                const bCoords = (0, geoUtils_1.parseCoordinates)(b.destination);
                if (!aCoords || !bCoords)
                    return 0;
                const distA = (0, geoUtils_1.haversineDistance)(startCoords, aCoords);
                const distB = (0, geoUtils_1.haversineDistance)(startCoords, bCoords);
                return distA - distB;
            });
            return sortedPackets;
        });
    }
}
exports.UserService = UserService;
exports.default = new UserService();
//# sourceMappingURL=user.service.js.map