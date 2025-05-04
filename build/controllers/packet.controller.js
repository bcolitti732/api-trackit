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
exports.postPacket = postPacket;
exports.getAllPackets = getAllPackets;
exports.getPacketById = getPacketById;
exports.updatePacketById = updatePacketById;
exports.deletePacketById = deletePacketById;
const packet_service_1 = require("../services/packet.service");
const packetService = new packet_service_1.PacketService();
function postPacket(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const packet = req.body;
            const newPacket = yield packetService.postPacket(packet);
            res.status(201).json(newPacket);
        }
        catch (error) {
            res.status(400).json({ message: "Error creating packet", error });
        }
    });
}
function getAllPackets(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const packetsPaginated = yield packetService.getAllPackets(page, limit);
            res.status(200).json(packetsPaginated);
        }
        catch (error) {
            res.status(400).json({ message: "Error getting packets", error });
        }
    });
}
function getPacketById(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const id = req.params.id;
            const packet = yield packetService.getPacketById(id);
            res.status(200).json(packet);
        }
        catch (error) {
            res.status(400).json({ message: "Error getting packet", error });
        }
    });
}
function updatePacketById(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const id = req.params.id;
            const packet = req.body;
            const updatedPacket = yield packetService.updatePacketById(id, packet);
            res.status(200).json(updatedPacket);
        }
        catch (error) {
            res.status(400).json({ message: "Error updating packet", error });
        }
    });
}
function deletePacketById(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const id = req.params.id;
            const deletedPacket = yield packetService.deletePacketById(id);
            res.status(200).json(deletedPacket);
        }
        catch (error) {
            res.status(400).json({ message: "Error deleting packet", error });
        }
    });
}
//# sourceMappingURL=packet.controller.js.map