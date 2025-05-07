"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PacketModel = void 0;
const mongoose_1 = require("mongoose");
const packetSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    deliveredAt: { type: Date },
    size: { type: Number, required: true },
    weight: { type: Number, required: true },
    deliveryId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Delivery' },
    origin: { type: String },
    destination: { type: String },
});
exports.PacketModel = (0, mongoose_1.model)("Packet", packetSchema);
//# sourceMappingURL=packet.js.map