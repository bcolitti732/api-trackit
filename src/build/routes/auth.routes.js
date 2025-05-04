"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const router = (0, express_1.Router)();
/**
 * Ruta para registrar un nuevo usuario.
 */
router.post("/register", auth_controller_1.register);
/**
 * Ruta para iniciar sesión y obtener tokens.
 */
router.post("/login", auth_controller_1.login);
/**
 * Ruta para verificar un token (access o refresh).
 */
router.post("/verify", auth_controller_1.verifyTokenEndpoint);
/**
 * Ruta para refrescar el token de acceso.
 */
router.post("/refresh", auth_controller_1.refreshToken);
exports.default = router;
