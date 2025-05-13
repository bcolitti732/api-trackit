import jwt from "jsonwebtoken";
import IJwtPayload from "../models/JWTPayload";

const SECRET = process.env._SECRET || "api+jwt";
const REFRESH_SECRET = process.env._REFRESH_SECRET || "refresh+jwt";

/**
 * Genera un token JWT.
 * @param payload - Datos que se incluirán en el token.
 * @param type - Tipo de token: "access" o "refresh".
 * @returns El token generado.
 */
export function generateToken(payload: IJwtPayload, type: "access" | "refresh"): string {
    const secret = type === "access" ? SECRET : REFRESH_SECRET;
    const expiresIn = type === "access" ? "1h" : "7d";
    return jwt.sign(payload, secret, { expiresIn });
}

/**
 * Verifica un token JWT.
 * @param token - El token a verificar.
 * @param type - Tipo de token: "access" o "refresh".
 * @returns El payload decodificado si el token es válido.
 */
export function verifyToken(token: string, type: "access" | "refresh"): IJwtPayload | null {
    const secret = type === "access" ? SECRET : REFRESH_SECRET;
    try {
        const decoded = jwt.verify(token, secret) as IJwtPayload;
        return typeof decoded === "object" ? decoded : null;
    } catch (error) {
        return null;
    }
}