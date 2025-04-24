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
exports.AuthService = void 0;
const user_1 = require("../models/user");
const bcrypt_handle_1 = require("../utils/bcrypt.handle");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SECRET = process.env._SECRET || "api+jwt";
const REFRESH_SECRET = process.env._REFRESH_SECRERT || "refresh+jwt";
class AuthService {
    register(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password, name, phone, available, packets } = user;
            // Verifica si el usuario ya existe
            const existingUser = yield user_1.UserModel.findOne({ email });
            if (existingUser) {
                throw new Error("User already exists");
            }
            // Encripta la contraseña
            const hashedPassword = yield (0, bcrypt_handle_1.encrypt)(password);
            // Crea un nuevo usuario con todos los datos
            const newUser = new user_1.UserModel({
                name,
                email,
                password: hashedPassword,
                phone,
                available,
                packets,
            });
            // Guarda el usuario en la base de datos
            return yield newUser.save();
        });
    }
    login(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_1.UserModel.findOne({ email });
            if (!user) {
                throw new Error("User not found");
            }
            const isPasswordValid = yield (0, bcrypt_handle_1.verified)(password, user.password);
            if (!isPasswordValid) {
                throw new Error("Invalid credentials");
            }
            /** LOGICA DE GENERACION O REFRESCO DEL TOKEN */
            const accessToken = this.generateToken(user._id.toString(), "access");
            const refreshToken = this.generateToken(user._id.toString(), "refresh");
            return { accessToken, refreshToken };
        });
    }
    generateToken(userId, type) {
        const secre = type === "access" ? SECRET : REFRESH_SECRET;
        const expiresIn = type === "access" ? "1h" : "7d";
        const payload = { id: userId, type };
        return jsonwebtoken_1.default.sign(payload, SECRET, { expiresIn });
    }
    verifyToken(token, type) {
        const secret = type === "access" ? SECRET : REFRESH_SECRET;
        return jsonwebtoken_1.default.verify(token, secret);
    }
    refreshToken(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = jsonwebtoken_1.default.verify(refreshToken, REFRESH_SECRET);
                if (payload.type !== "refresh") {
                    throw new Error("Invalid token type");
                }
                // Verifica si el usuario aún existe
                const user = yield user_1.UserModel.findById(payload.id);
                if (!user) {
                    throw new Error("User not found");
                }
                // Genera un nuevo token de acceso
                return this.generateToken(user._id.toString(), "access");
            }
            catch (error) {
                throw new Error("Invalid or expired refresh token");
            }
        });
    }
}
exports.AuthService = AuthService;
exports.default = new AuthService();
