"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jwt_handle_1 = require("../utils/jwt.handle");
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.log("Authorization header missing or invalid");
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const token = authHeader.split(" ")[1];
    const payload = (0, jwt_handle_1.verifyToken)(token, "access");
    if (!payload) {
        console.log("Token inválido o expirado");
        res.status(401).json({ message: "Invalid or expired token" });
        return;
    }
    req.user = payload;
    next();
}
//# sourceMappingURL=auth.middleware.js.map