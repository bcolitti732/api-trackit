"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PacketService = void 0;
const packet_1 = require("../models/packet");
class PacketService {
    postPacket(packet) {
        return __awaiter(this, void 0, void 0, function* () {
            const newPacket = new packet_1.PacketModel(packet);
            return yield newPacket.save();
        });
    }
    getAllPackets(page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = (page - 1) * limit;
            const totalPackets = yield packet_1.PacketModel.countDocuments();
            const users = yield packet_1.PacketModel.find().skip(skip).limit(limit);
            return {
                totalPackets,
                totalPages: Math.ceil(totalPackets / limit),
                currentPage: page,
                data: users,
            };
        });
    }
    getPacketById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield packet_1.PacketModel.findById(id);
        });
    }
    updatePacketById(id, packet) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield packet_1.PacketModel.findByIdAndUpdate(id, packet, { new: true });
        });
    }
    deletePacketById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield packet_1.PacketModel.findByIdAndDelete(id);
        });
    }
}
exports.PacketService = PacketService;
exports.default = new PacketService();
