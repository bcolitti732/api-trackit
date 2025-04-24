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
exports.verifyToken = verifyToken;
exports.refreshToken = refreshToken;
const auth_service_1 = require("../services/auth.service");
const authService = new auth_service_1.AuthService();
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request
 */
function register(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = req.body;
            const newUser = yield authService.register(user);
            res.status(201).json(newUser);
        }
        catch (error) {
            res.status(400).json({ message: error });
        }
    });
}
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthTokens'
 *       400:
 *         description: Invalid credentials
 */
function login(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { email, password } = req.body;
            const tokens = yield authService.login(email, password);
            res.status(200).json(tokens);
        }
        catch (error) {
            res.status(400).json({ message: error });
        }
    });
}
/**
 * @swagger
 * /api/auth/verify:
 *   post:
 *     summary: Verify a token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [access, refresh]
 *     responses:
 *       200:
 *         description: Token is valid
 *       400:
 *         description: Invalid token
 */
function verifyToken(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { token, type } = req.body;
            const payload = authService.verifyToken(token, type);
            res.status(200).json(payload);
        }
        catch (error) {
            res.status(400).json({ message: error });
        }
    });
}
/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh an access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: New access token generated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthTokens'
 *       400:
 *         description: Refresh token is required
 *       401:
 *         description: Invalid or expired refresh token
 */
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
            res.status(401).json({ message: error });
        }
    });
}
