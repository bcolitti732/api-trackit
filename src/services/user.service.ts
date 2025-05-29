import { IPacket } from '../models/packet';
import { IUser, UserModel } from '../models/user';
import mongoose from 'mongoose';
import { parseCoordinates, haversineDistance, LatLng } from "../utils/geoUtils";
export class UserService {
    async postUser(user: Partial<IUser>): Promise<IUser> {
        // Limpia el array de packets: elimina vacíos o IDs inválidos
        if (user.packets && Array.isArray(user.packets)) {
            user.packets = user.packets.filter(
                (id) => mongoose.Types.ObjectId.isValid(id.toString())
            );
        }
    
        const newUser = new UserModel(user);
        return await newUser.save();
    }

    async getAllUsers(page: number, limit: number): Promise<{ 
        totalUsers: number; 
        totalPages: number; 
        currentPage: number; 
        data: IUser[]; 
    }> {
        const skip = (page - 1) * limit;
    
        const totalUsers = await UserModel.countDocuments({ available: true });
    
        const users = await UserModel.find().skip(skip).limit(limit);
    
        return {
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page,
            data: users,
        };
    }

    async getUserById(id: string): Promise<IUser | null> {
        return await UserModel.findOne({ _id: id, available: true });
    }

    async getUserByName(name: string): Promise<IUser | null> {
        return await UserModel.findOne({ name, available: true });
    }

    async updateUserById(id: string, user: Partial<IUser>): Promise<IUser | null> {
        return await UserModel.findOneAndUpdate({ _id: id, available: true }, user, { new: true });
    }

    async deleteUserById(id: string): Promise<IUser | null> {
        return await UserModel.findByIdAndDelete(id);
    }

    async deactivateUserById(id: string): Promise<IUser | null> {
        const user = await UserModel.findById(id);
        if (!user) {
            throw new Error("User not found");
        }
    
        user.available = !user.available; // para clickar y desclickar al usuario y que se active o desactive en funcion de su estado
        return await user.save();
    }

    async getUserPacketsById(userId: string): Promise<IUser["packets"] | null> {
        const user = await UserModel.findById(userId).populate("packets");
        return user ? user.packets : null;
    }

    async addPacketToUser(userName: string, packetId: string): Promise<IUser | null> {
        const user = await UserModel.findOne({ name: userName, available: true });
        if (!user) {
            throw new Error("User not found");
        }

        if (!user.packets.includes(packetId as any)) {
            return await UserModel.findByIdAndUpdate(
                user._id,
                { $push: { packets: packetId } },
                { new: true, runValidators: false }
            );
        }

        return user;
    }
    
    async assignPacket(userId: string, packetId: string): Promise<IUser | null> {
        const user = await UserModel.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        if (user.role !== "delivery") {
            throw new Error("User is not a delivery");
        }
        if (!user.assignedPackets) {
            user.assignedPackets = [];
        }
        if (!user.assignedPackets.map(id => id.toString()).includes(packetId.toString())) {
            user.assignedPackets.push(packetId as any);
            await user.save();
        }
        return user;
    }
    async getAssignedPackets(userId: string): Promise<IUser["assignedPackets"]> {
        const user = await UserModel.findById(userId).populate("assignedPackets");
        if (!user) {
            throw new Error("User not found");
        }
        if (user.role !== "delivery") {
            throw new Error("User is not a delivery");
        }
        return user.assignedPackets || [];
    }

    async getOptimizedRoute(userId: string, startLocation?: string): Promise<IPacket[]> {
        const user = await UserModel.findById(userId).populate("assignedPackets");
        if (!user) throw new Error("User not found");
        if (user.role !== "delivery") throw new Error("User is not a delivery");

        const packets: IPacket[] = (user.assignedPackets as unknown as IPacket[]) || [];

        // Filtramos los que tienen coordenadas válidas
        const packetsWithCoords = packets.filter(p => p.destination && parseCoordinates(p.destination));

        // Punto de partida
        const startCoords = startLocation
            ? parseCoordinates(startLocation)
            : parseCoordinates(packetsWithCoords[0]?.location || packetsWithCoords[0]?.origin || packetsWithCoords[0]?.destination!);

        if (!startCoords) throw new Error("Starting location is invalid or missing");

        // Ordenar paquetes por distancia desde el punto de partida
        const sortedPackets = [...packetsWithCoords].sort((a, b) => {
            const aCoords = parseCoordinates(a.destination!);
            const bCoords = parseCoordinates(b.destination!);
            if (!aCoords || !bCoords) return 0;

            const distA = haversineDistance(startCoords, aCoords);
            const distB = haversineDistance(startCoords, bCoords);

            return distA - distB;
        });

        return sortedPackets;
    }

}

export default new UserService();