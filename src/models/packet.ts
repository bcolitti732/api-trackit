import { ObjectId, Schema, model } from 'mongoose';

export interface IPacket {
  _id: ObjectId;
  name: string;
  description: string;
  status: string;
  createdAt: Date;
  deliveredAt?: Date;
  size: Number;
  weight: Number;
  deliveryId?: ObjectId;
  origin?: string;
  destination?: string;
}

const packetSchema = new Schema<IPacket>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  deliveredAt: { type: Date },
  size: { type: Number, required: true },
  weight: { type: Number, required: true },
  deliveryId: { type: Schema.Types.ObjectId, ref: 'Delivery' },
  origin: { type: String },
  destination: { type: String },
});

export const PacketModel = model("Packet", packetSchema);