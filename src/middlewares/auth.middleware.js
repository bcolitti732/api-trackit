"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jwt_handle_1 = require("../utils/jwt.handle");
/**
 * Middleware para validar el token de acceso.
 * @param req - Objeto de solicitud.
 * @param res - Objeto de respuesta.
 * @param next - Función para pasar al siguiente middleware.
 */
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const token = authHeader.split(" ")[1];
    const payload = (0, jwt_handle_1.verifyToken)(token, "access");
    if (!payload) {
        res.status(401).json({ message: "Invalid or expired token" });
        return;
    }
    req.user = payload; // Adjunta los datos del usuario al objeto `req`
    next();
}
