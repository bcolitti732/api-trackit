import { Schema, model } from 'mongoose';

export interface IPacket {
  _id?: string;
  name: string;
  description: string;
  status: string;
  createdAt: Date; // Fecha de creación
  deliveredAt?: Date; // Fecha de entrega (opcional)
  size: number; // Tamaño del paquete
  weight: number; // Peso del paquete
  deliveryId?: string; // ID de la entrega (opcional)
  origin?: string; // Origen del paquete (opcional)
  destination?: string; // Destino del paquete (opcional)
  location?: string; // Ubicación actual del paquete (opcional)
}

const packetSchema = new Schema<IPacket>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
  deliveredAt: { type: Date, required: false },
  size: { type: Number, required: true },
  weight: { type: Number, required: true },
  deliveryId: { type: String, required: false },
  origin: { type: String, required: false },
  destination: { type: String, required: false },
  location: { type: String, required: false },
});

export const PacketModel = model("Packet", packetSchema);