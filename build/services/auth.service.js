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
            const { email, password, name, phone, available, packets, birthdate, role, deliveryProfileId } = user;
            const existingUser = yield user_1.UserModel.findOne({ email });
            if (existingUser) {
                throw new Error("User already exists");
            }
            const hashedPassword = yield (0, bcrypt_handle_1.encrypt)(password);
            const newUser = new user_1.UserModel({
                email,
                password: hashedPassword,
                name,
                phone,
                available,
                packets,
                birthdate,
                role,
                deliveryProfileId,
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
            return {
                accessToken,
                refreshToken,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    birthdate: user.birthdate,
                    packets: user.packets,
                },
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
    completeProfile(userName, phone, birthdate, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_1.UserModel.findOne({ name: userName });
            if (!user) {
                throw new Error("User not found");
            }
            user.phone = phone;
            user.birthdate = new Date(birthdate);
            user.password = yield (0, bcrypt_handle_1.encrypt)(password);
            user.isProfileComplete = true;
            const updatedUser = yield user.save();
            const accessToken = (0, jwt_handle_1.generateToken)({ name: user.name, role: user.role, id: user._id.toString(), type: "access" }, "access");
            const refreshToken = (0, jwt_handle_1.generateToken)({ name: user.name, role: user.role, id: user._id.toString(), type: "refresh" }, "refresh");
            console.log("Perfil completado:", updatedUser);
            return { user: updatedUser, accessToken, refreshToken };
        });
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map