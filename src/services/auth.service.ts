import { IUser, UserModel } from "../models/user";
import { encrypt, verified } from "../utils/bcrypt.handle";
import jwt from "jsonwebtoken";
import IJwtPayload from "../models/JWTPayload";

const SECRET = process.env._SECRET || "api+jwt";
const REFRESH_SECRET = process.env._REFRESH_SECRERT || "refresh+jwt";

export class AuthService {
    async register(user: Partial<IUser>): Promise<IUser> {
        const { email, password, name, phone, available, packets } = user;

        // Verifica si el usuario ya existe
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            throw new Error("User already exists");
        }

        // Encripta la contraseña
        const hashedPassword = await encrypt(password!);

        // Crea un nuevo usuario con todos los datos
        const newUser = new UserModel({
            name,
            email,
            password: hashedPassword,
            phone,
            available,
            packets,
        });

        // Guarda el usuario en la base de datos
        return await newUser.save();
    }

    async login(email: string, password: string): Promise<{ accessToken: string, refreshToken: string}> {
        const user = await UserModel.findOne({ email });
        if (!user) {
            throw new Error("User not found");
        }
        const isPasswordValid = await verified(password, user.password);
        if (!isPasswordValid) {
            throw new Error("Invalid credentials");
        }
        /** LOGICA DE GENERACION O REFRESCO DEL TOKEN */
        const accessToken = this.generateToken(user._id.toString(), "access");
        const refreshToken = this.generateToken(user._id.toString(), "refresh");
        return { accessToken, refreshToken };
    }

    generateToken(userId: string, type: "access" | "refresh"): string {
        const secre = type === "access" ? SECRET : REFRESH_SECRET;
        const expiresIn = type === "access" ? "1h" : "7d";
        const payload: IJwtPayload = { id: userId, type };
        return jwt.sign(payload, SECRET, { expiresIn});
    }

    verifyToken(token: string, type: "access" | "refresh"): IJwtPayload {
        const secret = type === "access" ? SECRET : REFRESH_SECRET;
        return jwt.verify(token, secret) as IJwtPayload;
    }

    async refreshToken(refreshToken: string): Promise<string> {
        try {
            const payload = jwt.verify(refreshToken, REFRESH_SECRET) as { id: string, type: string};
            if (payload.type !== "refresh") {
                throw new Error("Invalid token type");
            }
            // Verifica si el usuario aún existe
            const user = await UserModel.findById(payload.id);
            if (!user) {
                throw new Error("User not found");
            }
            // Genera un nuevo token de acceso
            return this.generateToken(user._id.toString(), "access");
        } catch (error) {
            throw new Error("Invalid or expired refresh token");
        }
    }
}

export default new AuthService();