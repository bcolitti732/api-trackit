"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const router = (0, express_1.Router)();
router.post("/register", auth_controller_1.register);
router.post("/login", auth_controller_1.login);
router.post("/verify", auth_controller_1.verifyToken);
router.post("/refresh", auth_controller_1.refreshToken); // Nueva ruta para refrescar el token
exports.default = router;
