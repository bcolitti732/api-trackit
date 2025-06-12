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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const user_1 = require("../models/user");
const bcrypt_handle_1 = require("../utils/bcrypt.handle");
const jwt_handle_1 = require("../utils/jwt.handle");
class AuthService {
    register(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password, name, phone, available, packets, birthdate, role, deliveryProfile, location } = user;
            const existingUser = yield user_1.UserModel.findOne({ email });
            if (existingUser) {
                throw new Error("User already exists");
            }
            const hashedPassword = yield (0, bcrypt_handle_1.encrypt)(password);
            let deliveryProfileCleaned = deliveryProfile;
            if (deliveryProfile) {
                const { assignedPacket, deliveredPackets, vehicle } = deliveryProfile;
                if ((assignedPacket && !Array.isArray(assignedPacket)) ||
                    (deliveredPackets && !Array.isArray(deliveredPackets)) ||
                    (vehicle && typeof vehicle !== 'string')) {
                    throw new Error("Invalid deliveryProfile format.");
                }
                deliveryProfileCleaned = {
                    assignedPacket: assignedPacket !== null && assignedPacket !== void 0 ? assignedPacket : [],
                    deliveredPackets: deliveredPackets !== null && deliveredPackets !== void 0 ? deliveredPackets : [],
                    vehicle: vehicle || 'N/A',
                };
            }
            const userLocation = location || "41.27721, 1.99017";
            const newUser = new user_1.UserModel({
                email,
                password: hashedPassword,
                name,
                phone,
                available,
                packets,
                birthdate,
                role,
                deliveryProfile: deliveryProfileCleaned,
                location: userLocation,
            });
            return yield newUser.save();
        });
    }
    login(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_1.UserModel.findOne({ email }).populate('packets');
            if (!user) {
                throw new Error("User not found");
            }
            const isPasswordValid = yield (0, bcrypt_handle_1.verified)(password, user.password);
            if (!isPasswordValid) {
                throw new Error("Invalid credentials");
            }
            const accessToken = (0, jwt_handle_1.generateToken)({ name: user.name, role: user.role, id: user._id.toString(), type: "access" }, "access");
            const refreshToken = (0, jwt_handle_1.generateToken)({ name: user.name, role: user.role, id: user._id.toString(), type: "refresh" }, "refresh");
            const isProfileComplete = user.isProfileComplete;
            return {
                accessToken,
                refreshToken,
                user: {
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    birthdate: user.birthdate,
                    password: user.password,
                    available: user.available,
                    role: user.role,
                    deliveryProfile: user.deliveryProfile,
                    isProfileComplete: user.isProfileComplete,
                    packets: user.packets,
                    location: user.location,
                },
                isProfileComplete,
            };
        });
    }
    refreshToken(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = (0, jwt_handle_1.verifyToken)(refreshToken, "refresh");
            if (!payload || payload.type !== "refresh") {
                throw new Error("Invalid or expired refresh token");
            }
            const user = yield user_1.UserModel.findOne({ name: payload.name });
            if (!user) {
                throw new Error("User not found");
            }
            return (0, jwt_handle_1.generateToken)({ name: user.name, role: user.role, id: user._id.toString(), type: "access" }, "access");
        });
    }
    completeProfile(userName, phone, birthdate, password, location) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_1.UserModel.findOne({ name: userName });
            if (!user) {
                throw new Error("User not found");
            }
            user.phone = phone;
            user.birthdate = new Date(birthdate);
            user.password = yield (0, bcrypt_handle_1.encrypt)(password);
            user.isProfileComplete = true;
            if (location) {
                user.location = location;
            }
            const updatedUser = yield user.save();
            const accessToken = (0, jwt_handle_1.generateToken)({ name: user.name, role: user.role, id: user._id.toString(), type: "access" }, "access");
            const refreshToken = (0, jwt_handle_1.generateToken)({ name: user.name, role: user.role, id: user._id.toString(), type: "refresh" }, "refresh");
            return { user: updatedUser, accessToken, refreshToken };
        });
    }
    loginOrRegisterGoogleUser(email, name, location) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = yield user_1.UserModel.findOne({ email });
            if (!user) {
                user = new user_1.UserModel({
                    email,
                    name: name || email.split("@")[0],
                    isProfileComplete: false,
                    location: location || "41.27721, 1.99017",
                });
                yield user.save();
            }
            const accessToken = (0, jwt_handle_1.generateToken)({ name: user.name, role: user.role, id: user._id.toString(), type: "access" }, "access");
            const refreshToken = (0, jwt_handle_1.generateToken)({ name: user.name, role: user.role, id: user._id.toString(), type: "refresh" }, "refresh");
            return { user, accessToken, refreshToken };
        });
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map