import { IUser, UserModel } from "../models/user";
import { encrypt, verified } from "../utils/bcrypt.handle";
import { generateToken, verifyToken } from "../utils/jwt.handle";

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
            email,
            password: hashedPassword,
            name,
            phone,
            available,
            packets,
        });

        // Guarda el usuario en la base de datos
        return await newUser.save();
    }

    async login(email: string, password: string): Promise<{ accessToken: string; refreshToken: string }> {
        const user = await UserModel.findOne({ email });
        if (!user) {
            throw new Error("User not found");
        }

        const isPasswordValid = await verified(password, user.password);
        if (!isPasswordValid) {
            throw new Error("Invalid credentials");
        }

        const accessToken = generateToken({ id: user._id }, "access");
        const refreshToken = generateToken({ id: user._id }, "refresh");

        return { accessToken, refreshToken };
    }

    async refreshToken(refreshToken: string): Promise<string> {
        const payload = verifyToken(refreshToken, "refresh") as { id: string; type: string };
        if (!payload || payload.type !== "refresh") {
            throw new Error("Invalid or expired refresh token");
        }

        const user = await UserModel.findById(payload.id);
        if (!user) {
            throw new Error("User not found");
        }

        return generateToken({ id: user._id }, "access");
    }
}