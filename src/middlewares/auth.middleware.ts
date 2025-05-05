import { Request, Response, NextFunction } from "express";

/**
 * Extiende la interfaz Request para incluir la propiedad `user`.
 */
declare global {
    namespace Express {
        interface Request {
            user?: any; // Cambia `any` por un tipo más específico si conoces la estructura de `payload`.
        }
    }
}
import { verifyToken } from "../utils/jwt.handle";

/**
 * Middleware para validar el token de acceso.
 * @param req - Objeto de solicitud.
 * @param res - Objeto de respuesta.
 * @param next - Función para pasar al siguiente middleware.
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.log("Authorization header missing or invalid");
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    const token = authHeader.split(" ")[1];

    const payload = verifyToken(token, "access");

    if (!payload) {
        console.log("Token inválido o expirado");
        res.status(401).json({ message: "Invalid or expired token" });
        return;
    }

    req.user = payload;
    next();
}