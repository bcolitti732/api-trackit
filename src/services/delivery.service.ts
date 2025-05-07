import { IDelivery, DeliveryModel } from "../models/delivery";
import mongoose from "mongoose";

export class DeliveryService {
    async postDelivery(delivery: Partial<IDelivery>): Promise<IDelivery> {
        // Limpiar deliveredPackets: quitar IDs vacíos o inválidos
        if (delivery.deliveredPackets && Array.isArray(delivery.deliveredPackets)) {
            delivery.deliveredPackets = delivery.deliveredPackets.filter(
                (id) => mongoose.Types.ObjectId.isValid(id.toString())
            );
        }

        const newDelivery = new DeliveryModel(delivery);
        return await newDelivery.save();
    }

    async getAllDeliveries(page: number, limit: number): Promise<{ 
        totalDeliveries: number; 
        totalPages: number; 
        currentPage: number; 
        data: IDelivery[]; 
    }> {
        const skip = (page - 1) * limit;
    
        const totalDeliveries = await DeliveryModel.countDocuments({});
    
        const deliveries = await DeliveryModel.find().skip(skip).limit(limit);
    
        return {
            totalDeliveries,
            totalPages: Math.ceil(totalDeliveries / limit),
            currentPage: page,
            data: deliveries,
        };
    }
    async deleteDelivery(deliveryId: string): Promise<IDelivery | null> {
        const deletedDelivery = await DeliveryModel.findByIdAndDelete(deliveryId);
        return deletedDelivery;
    }
    async updateDelivery(deliveryId: string, delivery: Partial<IDelivery>): Promise<IDelivery | null> {
        const updatedDelivery = await DeliveryModel.findByIdAndUpdate(deliveryId, delivery, { new: true });
        return updatedDelivery;
    }
}