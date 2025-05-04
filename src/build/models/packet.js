"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PacketModel = void 0;
const mongoose_1 = require("mongoose");
const packetSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, required: true },
});
exports.PacketModel = (0, mongoose_1.model)("Packet", packetSchema);
