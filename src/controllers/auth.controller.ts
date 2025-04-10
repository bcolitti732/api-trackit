import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";


const authService = new AuthService();

export async function register(req: Request, res: Response): Promise<void> {
    try {
        const user = req.body;
        const newUser = await authService.register(user);
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ message: error });
    }
}

export async function login(req: Request, res: Response): Promise<void> {
    try {
        const { email, password } = req.body;
        const tokens = await authService.login(email, password);
        res.status(200).json(tokens);
    } catch (error) {
        res.status(400).json({ message: error });
    }
}

export async function verifyToken(req: Request, res: Response): Promise<void> {
    try {
        const { token, type } = req.body;
        const payload = authService.verifyToken(token, type);
        res.status(200).json(payload);
    } catch (error) {
        res.status(400).json({ message: error });
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
        res.status(401).json({ message: error });
    }
}