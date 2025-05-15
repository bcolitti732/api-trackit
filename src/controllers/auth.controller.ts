import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { verifyToken } from "../utils/jwt.handle";
import { OAuth2Client } from "google-auth-library";

const authService = new AuthService();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const user = req.body;
    const newUser = await authService.register(user);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;
    const tokens = await authService.login(email, password);
    res.status(200).json(tokens);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
}

export async function verifyTokenEndpoint(req: Request, res: Response): Promise<void> {
  try {
    const { token, type } = req.body;
    const payload = verifyToken(token, type);
    if (!payload) {
      res.status(400).json({ message: "Invalid or expired token" });
      return;
    }
    res.status(200).json(payload);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
}

export async function refreshToken(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ message: "Refresh token is required" });
      return;
    }

    const newAccessToken = await authService.refreshToken(refreshToken);
    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(401).json({ message: (error as Error).message });
  }
}

export async function completeProfile(req: Request, res: Response): Promise<void> {
  try {
    const payload = (req as any).user;
    const { phone, birthdate, password } = req.body;

    const { user, accessToken, refreshToken } = await authService.completeProfile(
      payload.name,
      phone,
      birthdate,
      password
    );

    res.status(200).json({
      message: "Perfil completado",
      user,
      accessToken,
      refreshToken
    });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
}

/**
 * Login con Google desde aplicación móvil usando idToken
 */
export async function loginWithGoogleMobile(req: Request, res: Response): Promise<void> {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      res.status(400).json({ message: "idToken is required" });
      return;
    }

    // Verificar el idToken con Google
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload?.email;
    const name = payload?.name;

    if (!email) {
      res.status(400).json({ message: "Google token does not contain email" });
      return;
    }

    // Delegar la lógica al servicio
    const { user, accessToken, refreshToken } = await authService.loginOrRegisterGoogleUser(email, name);

    // Si el usuario no tiene `birthdate`, marca el perfil como incompleto
    if (!user.birthdate) {
      user.isProfileComplete = false;
    }

    res.status(200).json({
      user: {
        ...user,
        isProfileComplete: user.isProfileComplete,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(401).json({ message: "Invalid Google token" });
  }
}
