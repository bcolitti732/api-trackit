import { Router } from "express";
import passport from "passport";
import { completeProfile, login, refreshToken, register, verifyTokenEndpoint, loginWithGoogleMobile } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registra un nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *               available:
 *                 type: boolean
 *               packets:
 *                 type: array
 *                 items:
 *                   type: string
 *               birthdate:
 *                 type: string
 *                 format: date
 *               role:
 *                 type: string
 *               deliveryProfile:
 *                 type: object
 *                 properties:
 *                   assignedPacket:
 *                     type: array
 *                     items:
 *                       type: string
 *                   deliveredPackets:
 *                     type: array
 *                     items:
 *                       type: string
 *                   vehicle:
 *                     type: string
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       400:
 *         description: Error en la solicitud
 */
router.post("/register", register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Inicia sesión de un usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso
 *       401:
 *         description: Credenciales inválidas
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

/**
 * Ruta para iniciar login con Google.
 */
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

/**
 * Callback después de que Google autoriza al usuario.
 */
router.get('/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
    const { accessToken, refreshToken, isProfileComplete } = req.user as any;

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4001';
    const redirectUrl = new URL(`${frontendUrl}/login/callback`);
    redirectUrl.searchParams.append('accessToken', accessToken);
    redirectUrl.searchParams.append('refreshToken', refreshToken);
    redirectUrl.searchParams.append('isProfileComplete', String(isProfileComplete));

    res.redirect(redirectUrl.toString());
});

router.post('/google/mobile', loginWithGoogleMobile);

router.put("/complete-profile", authMiddleware, completeProfile);




export default router;
