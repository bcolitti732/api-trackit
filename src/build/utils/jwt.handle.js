"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SECRET = process.env._SECRET || "api+jwt";
const REFRESH_SECRET = process.env._REFRESH_SECRET || "refresh+jwt";
/**
 * Genera un token JWT.
 * @param payload - Datos que se incluirán en el token.
 * @param type - Tipo de token: "access" o "refresh".
 * @returns El token generado.
 */
function generateToken(payload, type) {
    const secret = type === "access" ? SECRET : REFRESH_SECRET;
    const expiresIn = type === "access" ? "1h" : "7d";
    return jsonwebtoken_1.default.sign(payload, secret, { expiresIn });
}
/**
 * Verifica un token JWT.
 * @param token - El token a verificar.
 * @param type - Tipo de token: "access" o "refresh".
 * @returns El payload decodificado si el token es válido.
 */
function verifyToken(token, type) {
    const secret = type === "access" ? SECRET : REFRESH_SECRET;
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        return typeof decoded === "object" ? decoded : null;
    }
    catch (error) {
        return null;
    }
}
