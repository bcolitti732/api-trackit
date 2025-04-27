import { Router } from "express";
import { login, refreshToken, register, verifyTokenEndpoint } from "../controllers/auth.controller";

const router = Router();

/**
 * Ruta para registrar un nuevo usuario.
 */
router.post("/register", register);

/**
 * Ruta para iniciar sesión y obtener tokens.
 */
router.post("/login", login);

/**
 * Ruta para verificar un token (access o refresh).
 */
router.post("/verify", verifyTokenEndpoint);

/**
 * Ruta para refrescar el token de acceso.
 */
router.post("/refresh", refreshToken);

export default router;