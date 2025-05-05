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
exports.register = register;
exports.login = login;
exports.verifyTokenEndpoint = verifyTokenEndpoint;
exports.refreshToken = refreshToken;
exports.completeProfile = completeProfile;
const auth_service_1 = require("../services/auth.service");
const jwt_handle_1 = require("../utils/jwt.handle");
const authService = new auth_service_1.AuthService();
function register(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = req.body;
            const newUser = yield authService.register(user);
            res.status(201).json(newUser);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    });
}
function login(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { email, password } = req.body;
            const tokens = yield authService.login(email, password);
            res.status(200).json(tokens);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    });
}
function verifyTokenEndpoint(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { token, type } = req.body;
            const payload = (0, jwt_handle_1.verifyToken)(token, type);
            if (!payload) {
                res.status(400).json({ message: "Invalid or expired token" });
                return;
            }
            res.status(200).json(payload);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    });
}
function refreshToken(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                res.status(400).json({ message: "Refresh token is required" });
                return;
            }
            const newAccessToken = yield authService.refreshToken(refreshToken);
            res.status(200).json({ accessToken: newAccessToken });
        }
        catch (error) {
            res.status(401).json({ message: error.message });
        }
    });
}
function completeProfile(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const payload = req.user;
            const { phone, birthdate, password } = req.body;
            const { user, accessToken, refreshToken } = yield authService.completeProfile(payload.name, phone, birthdate, password);
            res.status(200).json({
                message: "Perfil completado",
                user: user,
                accessToken: accessToken,
                refreshToken: refreshToken
            });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    });
}
//# sourceMappingURL=auth.controller.js.map