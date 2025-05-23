import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { verifyToken } from "../utils/jwt.handle";

const authService = new AuthService();

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

/**
 * Endpoint para completar datos del perfil de un usuario OAuth (usando JWT basado en `name`)
 */
export async function completeProfile(req: Request, res: Response): Promise<void> {
    try {
      const payload = (req as any).user; // Obtenido del middleware JWT
      const { phone, birthdate, password } = req.body;
  
      // Llamamos al servicio para completar el perfil y obtener los tokens
      const { user, accessToken, refreshToken } = await authService.completeProfile(payload.name, phone, birthdate, password);
  
      // Devolver la respuesta con los nuevos tokens y los datos del usuario actualizado
      res.status(200).json({
        message: "Perfil completado",
        user: user,
        accessToken: accessToken,
        refreshToken: refreshToken
      });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }
