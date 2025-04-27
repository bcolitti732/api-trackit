import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { verifyToken } from "../utils/jwt.handle"; // Importamos la función reutilizable de utils

const authService = new AuthService();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request
 */
export async function register(req: Request, res: Response): Promise<void> {
    try {
        const user = req.body;
        const newUser = await authService.register(user);
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ message: error });
    }
}

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthTokens'
 *       400:
 *         description: Invalid credentials
 */
export async function login(req: Request, res: Response): Promise<void> {
    try {
        const { email, password } = req.body;
        const tokens = await authService.login(email, password);
        res.status(200).json(tokens);
    } catch (error) {
        res.status(400).json({ message: error});
    }
}

/**
 * @swagger
 * /api/auth/verify:
 *   post:
 *     summary: Verify a token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [access, refresh]
 *     responses:
 *       200:
 *         description: Token is valid
 *       400:
 *         description: Invalid token
 */
export async function verifyTokenEndpoint(req: Request, res: Response): Promise<void> {
    try {
        const { token, type } = req.body;
        const payload = verifyToken(token, type); // Usamos la función de utils para verificar el token

        if (!payload) {
            res.status(400).json({ message: "Invalid or expired token" });
            return;
        }

        res.status(200).json(payload);
    } catch (error) {
        res.status(400).json({ message: error });
    }
}

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh an access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: New access token generated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthTokens'
 *       400:
 *         description: Refresh token is required
 *       401:
 *         description: Invalid or expired refresh token
 */
export async function refreshToken(req: Request, res: Response): Promise<void> {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(400).json({ message: "Refresh token is required" });
            return;
        }

        const newAccessToken = await authService.refreshToken(refreshToken); // Lógica delegada al servicio
        res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
        res.status(401).json({ message: error });
    }
}