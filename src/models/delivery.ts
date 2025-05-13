import e from 'express';
import {ObjectId, Schema, model} from 'mongoose';

export interface IDelivery {
  userId: ObjectId;
  assignedPacket: ObjectId[];
  deliveredPackets: ObjectId[];
  vehicle: string;
}

const deliverySchema = new Schema<IDelivery>({
    userId: {
        type: String,
        required: true,
    },
    assignedPacket: [{ type: Schema.Types.ObjectId, ref: "Packet" }],
    deliveredPackets: [{ type: Schema.Types.ObjectId, ref: "Packet" }],
    vehicle: {
        type: String,
        required: true,
    },
});

export const DeliveryModel = model("Delivery", deliverySchema);
