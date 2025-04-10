import { Router } from "express";
import { login, refreshToken, register, verifyToken } from "../controllers/auth.controller";


const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify", verifyToken);
router.post("/refresh", refreshToken); // Nueva ruta para refrescar el token

export default router;