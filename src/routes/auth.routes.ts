import { Router } from "express";
import passport from "passport";
import { completeProfile, login, refreshToken, register, verifyTokenEndpoint, loginWithGoogleMobile } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

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

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4002';
    const redirectUrl = new URL(`${frontendUrl}/login/callback`);
    redirectUrl.searchParams.append('accessToken', accessToken);
    redirectUrl.searchParams.append('refreshToken', refreshToken);
    redirectUrl.searchParams.append('isProfileComplete', String(isProfileComplete));

    res.redirect(redirectUrl.toString());
});

router.post('/google/mobile', loginWithGoogleMobile);

router.put("/complete-profile", authMiddleware, completeProfile);




export default router;
