import mongoose from 'mongoose';
import { IPacket, PacketModel } from '../models/packet';
import { UserModel } from '../models/user';

export class PacketService {

    async getUserByPacketId(packetId: string) {
        // Busca el usuario que tenga este paquete en su array de packets
        const user = await UserModel.findOne({ packets: packetId });
        return user;
    }

    async postPacket(packet: Partial<IPacket>): Promise<IPacket> {
    if (!packet.deliveryId || !mongoose.Types.ObjectId.isValid(packet.deliveryId.toString())) {
        delete packet.deliveryId;
    }

    // Asignar location si no se proporciona pero origin sí
    if (!packet.location && packet.origin) {
        packet.location = packet.origin;
    }

    const newPacket = new PacketModel(packet);
    return await newPacket.save();
}


    async getAllPackets(page: number, limit: number): Promise<{ 
        totalPackets: number; 
        totalPages: number; 
        currentPage: number; 
        data: IPacket[]; 
    }> {
        const skip = (page - 1) * limit;
    
        const totalPackets = await PacketModel.countDocuments();
    
        const packets = await PacketModel.find().skip(skip).limit(limit);
    
        return {
            totalPackets,
            totalPages: Math.ceil(totalPackets / limit),
            currentPage: page,
            data: packets,
        };
    }

    async getPacketById(id: string): Promise<IPacket | null> {
        return await PacketModel.findById(id);
    }

    async updatePacketById(id: string, packet: Partial<IPacket>): Promise<IPacket | null> {
    // Asignar location = origin si no se proporciona explícitamente
    if (!packet.location && packet.origin) {
        packet.location = packet.origin;
    }

    return await PacketModel.findByIdAndUpdate(id, packet, { new: true });
}


    async deletePacketById(id: string): Promise<IPacket | null> {
        return await PacketModel.findByIdAndDelete(id);
    }
}

export default new PacketService();
