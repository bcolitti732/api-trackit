import { IPacket } from '../models/packet';
import { IUser, UserModel } from '../models/user';
import mongoose, { ObjectId } from 'mongoose';
import { parseCoordinates, haversineDistance, LatLng } from "../utils/geoUtils";
export class UserService {
 async postUser(user: Partial<IUser>): Promise<IUser> {
    // Limpia el array de packets: elimina vacíos o IDs inválidos
    if (user.packets && Array.isArray(user.packets)) {
        user.packets = user.packets.filter(
            (id) => mongoose.Types.ObjectId.isValid(id.toString())
        );
    }

    // Si deliveryProfile existe, validar que tenga la estructura correcta (opcional)
    if (user.deliveryProfile) {
        const { assignedPacket, deliveredPackets, vehicle } = user.deliveryProfile;

        if (
            (assignedPacket && !Array.isArray(assignedPacket)) ||
            (deliveredPackets && !Array.isArray(deliveredPackets)) ||
            (vehicle && typeof vehicle !== 'string')
        ) {
            throw new Error("Invalid deliveryProfile format.");
        }

        // Asignar valor por defecto a vehicle si no existe o está vacío
        if (!vehicle || vehicle.trim() === '') {
            user.deliveryProfile.vehicle = 'N/A';  // o '' si prefieres cadena vacía pero forzada
        }
    } else {
        // Si no existe deliveryProfile, podrías inicializarlo vacío si quieres
        user.deliveryProfile = {
            assignedPacket: [],
            deliveredPackets: [],
            vehicle: 'N/A',
        };
    }

    // Ahora sí crear el usuario
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
        const users = await UserModel.find({ available: true }).skip(skip).limit(limit);
    
        return {
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page,
            data: users,
        };
    }

    async getUserById(id: string): Promise<IUser | null> {
        return await UserModel.findOne({ _id: id, available: true }).lean();
    }

    async getUserByName(name: string): Promise<IUser | null> {
        return await UserModel.findOne({ name, available: true });
    }

    async updateUserById(id: string, user: Partial<IUser>): Promise<IUser | null> {
        // Validación: no permitir deliveryProfile en usuarios que no sean 'delivery'
        if (user.deliveryProfile && user.role !== "delivery") {
            throw new Error("Only users with role 'delivery' can have a delivery profile.");
        }

        return await UserModel.findOneAndUpdate(
            { _id: id, available: true },
            user,
            { new: true }
        );
    }

    async deleteUserById(id: string): Promise<IUser | null> {
        return await UserModel.findByIdAndDelete(id);
    }

    async deactivateUserById(id: string): Promise<IUser | null> {
        const user = await UserModel.findById(id);
        if (!user) {
            throw new Error("User not found");
        }

        user.available = !user.available;
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
    async getAssignedPacketsByUserId(userId: string) {
    const user = await UserModel.findById(userId)
      .populate('deliveryProfile.assignedPacket')
      .exec();

    if (!user || !user.deliveryProfile) return null;

    return user.deliveryProfile.assignedPacket;
  }
  async assignPacketToDelivery(userId: string, packetId: string): Promise<IUser | null> {
  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(packetId)) {
    throw new Error("Invalid userId or packetId.");
  }

  const user = await UserModel.findById(userId);
  if (!user || user.role !== 'delivery') {
    throw new Error("Delivery user not found.");
  }

  if (!user.deliveryProfile) {
    user.deliveryProfile = {
      assignedPacket: [],
      deliveredPackets: [],
      vehicle: 'N/A',
    };
  }

  const alreadyAssigned = user.deliveryProfile.assignedPacket.some(
    (assigned) => assigned.toString() === packetId
  );

  if (alreadyAssigned) {
    throw new Error("Packet already assigned to this delivery.");
  }

  // 👇 agrega el packetId como string (o Schema.Types.ObjectId si tu esquema lo requiere)
  user.deliveryProfile.assignedPacket.push(packetId as any);

  return await user.save();
}
 async getOptimizedRoute(userId: string, startLocation?: string): Promise<IPacket[]> {
        const user = await UserModel.findById(userId).populate("deliveryProfile.assignedPacket");
        if (!user) throw new Error("User not found");
        if (user.role !== "delivery") throw new Error("User is not a delivery");

        const packets: IPacket[] = (user.deliveryProfile?.assignedPacket as unknown as IPacket[]) || [];

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
   async updateDeliveryQueue(userID: string, newQueue: ObjectId []): Promise<IUser | null> {
        const user = await UserModel.findById(userID);
        if (!user) {
            throw new Error("User not found");
        }


        if (user.deliveryProfile) {
            user.deliveryProfile.assignedPacket = newQueue;
        }
        await user.save();
        return user;
    }
    async markPacketAsDelivered(userId: string, packetId: string): Promise<IUser | null> {
    
        console.log('ID recibido:', userId);
  console.log('¿ID válido?', mongoose.Types.ObjectId.isValid(userId));
  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(packetId)) {
    throw new Error("Invalid userId or packetId.");
  }

  const user = await UserModel.findById(userId);
  console.log('Usuario encontrado:', user);
  if (!user || user.role !== 'delivery') {
    throw new Error("Delivery user not found or user is not a delivery.");
  }
 
  
  if (!user || user.role !== 'delivery') {
    throw new Error("Delivery user not found or user is not a delivery.");
  }

  if (!user.deliveryProfile) {
    throw new Error("User deliveryProfile not found.");
  }

  // Eliminar packetId de assignedPacket si está ahí
  user.deliveryProfile.assignedPacket = user.deliveryProfile.assignedPacket.filter(
    (id) => id.toString() !== packetId
  );

  // Añadir packetId a deliveredPackets si no está ya
  if (!user.deliveryProfile.deliveredPackets.includes(packetId as any)) {
    user.deliveryProfile.deliveredPackets.push(packetId as any);
  }

  return await user.save();
}

}


export default new UserService();
