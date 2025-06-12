import { IUser, UserModel } from "../models/user";
import { encrypt, verified } from "../utils/bcrypt.handle";
import { generateToken, verifyToken } from "../utils/jwt.handle";

export class AuthService {
  async register(user: Partial<IUser>): Promise<IUser> {
    const { email, password, name, phone, available, packets, birthdate, role, deliveryProfile, location } = user;

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await encrypt(password!);

    // Validación y normalización del deliveryProfile
    let deliveryProfileCleaned = deliveryProfile;
    if (deliveryProfile) {
      const { assignedPacket, deliveredPackets, vehicle } = deliveryProfile;

      // Validar tipos
      if (
        (assignedPacket && !Array.isArray(assignedPacket)) ||
        (deliveredPackets && !Array.isArray(deliveredPackets)) ||
        (vehicle && typeof vehicle !== 'string')
      ) {
        throw new Error("Invalid deliveryProfile format.");
      }

      // Asignar valores por defecto si faltan
      deliveryProfileCleaned = {
        assignedPacket: assignedPacket ?? [],
        deliveredPackets: deliveredPackets ?? [],
        vehicle: vehicle || 'N/A',
      };
    }

    // Asignar ubicación por defecto si no se proporciona
    const userLocation = location || "41.27721, 1.99017";

    const newUser = new UserModel({
      email,
      password: hashedPassword,
      name,
      phone,
      available,
      packets,
      birthdate,
      role,
      deliveryProfile: deliveryProfileCleaned,
      location: userLocation, // Asignar ubicación
    });
    return await newUser.save();
  }

  async login(email: string, password: string): Promise<{ accessToken: string; refreshToken: string; isProfileComplete: boolean; user: IUser }> {
    const user = await UserModel.findOne({ email }).populate('packets');
    if (!user) {
      throw new Error("User not found");
    }

    const isPasswordValid = await verified(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    const accessToken = generateToken({ name: user.name, role: user.role, id: user._id.toString(), email: user.email, type: "access" }, "access");
    const refreshToken = generateToken({ name: user.name, role: user.role, id: user._id.toString(),email: user.email, type: "refresh" }, "refresh");
    const isProfileComplete = user.isProfileComplete;

    return {
      accessToken,
      refreshToken,
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        birthdate: user.birthdate,
        password: user.password,
        available: user.available,
        role: user.role,
        deliveryProfile: user.deliveryProfile,
        isProfileComplete: user.isProfileComplete,
        packets: user.packets,
        location: user.location, // Incluir ubicación en la respuesta
      },
      isProfileComplete,
    };
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

    return generateToken({ name: user.name, role: user.role, id: user._id.toString(),email: user.email, type: "access" }, "access");
  }

  async completeProfile(userName: string, phone: string, birthdate: string, password: string, location?: string): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    const user = await UserModel.findOne({ name: userName });
    if (!user) {
      throw new Error("User not found");
    }

    user.phone = phone;
    user.birthdate = new Date(birthdate);
    user.password = await encrypt(password);
    user.isProfileComplete = true;

    // Actualizar ubicación si se proporciona
    if (location) {
      user.location = location;
    }

    const updatedUser = await user.save();

    const accessToken = generateToken({ name: user.name, role: user.role, id: user._id.toString(),email: user.email, type: "access" }, "access");
    const refreshToken = generateToken({ name: user.name, role: user.role, id: user._id.toString(),email: user.email, type: "refresh" }, "refresh");

    return { user: updatedUser, accessToken, refreshToken };
  }

  async loginOrRegisterGoogleUser(email: string, name?: string, location?: string): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    let user = await UserModel.findOne({ email });

    if (!user) {
      user = new UserModel({
        email,
        name: name || email.split("@")[0],
        isProfileComplete: false,
        location: location || "41.27721, 1.99017", // Asignar ubicación por defecto
      });

      await user.save();
    }

    const accessToken = generateToken({ name: user.name, role: user.role, id: user._id.toString(),email: user.email, type: "access" }, "access");
    const refreshToken = generateToken({ name: user.name, role: user.role, id: user._id.toString(),email: user.email, type: "refresh" }, "refresh");

    return { user, accessToken, refreshToken };
  }
}
