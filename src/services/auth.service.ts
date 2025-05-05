import { IUser, UserModel } from "../models/user";
import { encrypt, verified } from "../utils/bcrypt.handle";
import { generateToken, verifyToken } from "../utils/jwt.handle";

export class AuthService {
  async register(user: Partial<IUser>): Promise<IUser> {
    const { email, password, name, phone, available, packets, birthdate } = user;

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await encrypt(password!);

    const newUser = new UserModel({
      email,
      password: hashedPassword,
      name,
      phone,
      available,
      packets,
      birthdate,
    });

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

    const accessToken = generateToken({ name: user.name }, "access");
    const refreshToken = generateToken({ name: user.name }, "refresh");

    return { accessToken, refreshToken };
  }

  async refreshToken(refreshToken: string): Promise<string> {
    const payload = verifyToken(refreshToken, "refresh") as { name: string; type: string };
    if (!payload || payload.type !== "refresh") {
      throw new Error("Invalid or expired refresh token");
    }

    const user = await UserModel.findOne({ name: payload.name });
    if (!user) {
      throw new Error("User not found");
    }

    return generateToken({ name: user.name }, "access");
  }

  async completeProfile(userName: string, phone: string, birthdate: string, password: string): Promise<{ user: IUser, accessToken: string, refreshToken: string }> {
    // Busca al usuario
    const user = await UserModel.findOne({ name: userName });
    if (!user) {
      throw new Error("User not found");
    }
  
    // Actualiza los datos del usuario
    user.phone = phone;
    user.birthdate = new Date(birthdate);
    user.password = await encrypt(password); // Encriptar la nueva contraseña
    user.isProfileComplete = true; // Marca el perfil como completo
    const updatedUser = await user.save();
  
    // Genera los nuevos tokens utilizando las funciones existentes
    const accessToken = generateToken({name: updatedUser.name}, "access");  // Función que ya tienes
    const refreshToken = generateToken({name: updatedUser.name}, "refresh"); // Función que ya tienes
    console.log("Perfil completado:", updatedUser);
  
    return { user: updatedUser, accessToken, refreshToken };
  }
}
