import mongoose from 'mongoose';
import { IPacket, PacketModel } from '../models/packet';

export class PacketService {
    async postPacket(packet: Partial<IPacket>): Promise<IPacket> {
        // Validar que deliveryId sea un ObjectId válido o eliminarlo si es incorrecto
        if (!packet.deliveryId || !mongoose.Types.ObjectId.isValid(packet.deliveryId.toString())) {
            delete packet.deliveryId;
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
        return await PacketModel.findByIdAndUpdate(id, packet, { new: true });
    }

    async deletePacketById(id: string): Promise<IPacket | null> {
        return await PacketModel.findByIdAndDelete(id);
    }
}

export default new PacketService();
