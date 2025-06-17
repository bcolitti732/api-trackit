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
exports.postUser = postUser;
exports.getAllUsers = getAllUsers;
exports.getUserById = getUserById;
exports.getUserByName = getUserByName;
exports.updateUserById = updateUserById;
exports.deactivateUserById = deactivateUserById;
exports.getUserPackets = getUserPackets;
exports.getOptimizedRoute = getOptimizedRoute;
exports.addPacketToUser = addPacketToUser;
exports.deleteUserById = deleteUserById;
exports.getAssignedPackets = getAssignedPackets;
exports.assignPacketToDelivery = assignPacketToDelivery;
exports.updateDeliveryQueue = updateDeliveryQueue;
exports.markPacketDeliveredHandler = markPacketDeliveredHandler;
const user_service_1 = require("../services/user.service");
const userService = new user_service_1.UserService();
function postUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = req.body;
            const newUser = yield userService.postUser(user);
            res.status(201).json(newUser);
        }
        catch (error) {
            res.status(400).json({ message: "Error creating user", error: error instanceof Error ? error.message : error });
        }
    });
}
function getAllUsers(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const usersPaginated = yield userService.getAllUsers(page, limit);
            res.status(200).json(usersPaginated);
        }
        catch (error) {
            res.status(400).json({ message: "Error getting users", error });
        }
    });
}
function getUserById(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const id = req.params.id;
            const user = yield userService.getUserById(id);
            res.status(200).json(user);
        }
        catch (error) {
            res.status(400).json({ message: "Error getting user", error });
        }
    });
}
function getUserByName(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const name = req.params.name;
            const user = yield userService.getUserByName(name);
            res.status(200).json(user);
        }
        catch (error) {
            res.status(400).json({ message: "Error getting user", error });
        }
    });
}
function updateUserById(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const id = req.params.id;
            const userUpdates = req.body;
            const existingUser = yield userService.getUserById(id);
            if (!existingUser) {
                res.status(404).json({ message: "User not found" });
                return;
            }
            const updatedUserData = {
                name: userUpdates.name || existingUser.name,
                email: userUpdates.email || existingUser.email,
                password: userUpdates.password || existingUser.password,
                phone: userUpdates.phone || existingUser.phone,
                available: userUpdates.available !== undefined ? userUpdates.available : existingUser.available,
                birthdate: userUpdates.birthdate || existingUser.birthdate,
                role: userUpdates.role || existingUser.role,
            };
            const updatedUser = yield userService.updateUserById(id, updatedUserData);
            res.status(200).json(updatedUser);
        }
        catch (error) {
            res.status(400).json({ message: "Error updating user", error });
        }
    });
}
function deactivateUserById(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const id = req.params.id;
            const toggledUser = yield userService.deactivateUserById(id);
            res.status(200).json(toggledUser);
        }
        catch (error) {
            res.status(400).json({ message: "Error toggling user availability", error });
        }
    });
}
function getUserPackets(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userId = req.params.id;
            const packets = yield userService.getUserPacketsById(userId);
            if (!packets) {
                res.status(404).json({ message: "User not found or no packets available" });
                return;
            }
            res.status(200).json(packets);
        }
        catch (error) {
            res.status(500).json({ message: "Error retrieving packets", error });
        }
    });
}
function getOptimizedRoute(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userId = req.params.id;
            const startLocation = req.query.startLocation;
            const route = yield userService.getOptimizedRoute(userId, startLocation);
            res.status(200).json(route);
        }
        catch (error) {
            if (error.message === "User is not a delivery") {
                res.status(400).json({ message: error.message });
            }
            else if (error.message === "User not found") {
                res.status(404).json({ message: error.message });
            }
            else {
                console.log("Error retrieving optimized route:", error);
                res.status(500).json({ message: "Error retrieving optimized route", error });
            }
        }
    });
}
function addPacketToUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userName = req.params.name;
            const { packetId } = req.body;
            if (!packetId) {
                res.status(400).json({ message: "Packet ID is required" });
                return;
            }
            const updatedUser = yield userService.addPacketToUser(userName, packetId);
            if (!updatedUser) {
                res.status(404).json({ message: "User not found" });
                return;
            }
            res.status(200).json(updatedUser);
        }
        catch (error) {
            res.status(500).json({ message: "Error adding packet to user", error });
        }
    });
}
function deleteUserById(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const id = req.params.id;
            const deletedUser = yield userService.deleteUserById(id);
            if (!deletedUser) {
                res.status(404).json({ message: "User not found" });
                return;
            }
            res.status(200).json({ message: "User deleted successfully" });
        }
        catch (error) {
            res.status(500).json({ message: "Error deleting user", error });
        }
    });
}
function getAssignedPackets(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userId = req.params.id;
            const packets = yield userService.getAssignedPacketsByUserId(userId);
            if (!packets || packets.length === 0) {
                res.status(404).json({ message: "User not found or no assigned packets available" });
                return;
            }
            res.status(200).json(packets);
        }
        catch (error) {
            res.status(500).json({ message: "Error retrieving assigned packets", error });
        }
    });
}
function assignPacketToDelivery(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { userId, packetId } = req.body;
        if (!userId || !packetId) {
            res.status(400).json({ message: "userId and packetId are required" });
            return;
        }
        try {
            const updatedUser = yield userService.assignPacketToDelivery(userId, packetId);
            if (!updatedUser) {
                res.status(404).json({ message: "User not found or invalid role" });
                return;
            }
            res.status(200).json(updatedUser);
        }
        catch (error) {
            res.status(500).json({ message: "Error assigning packet", error });
        }
    });
}
function updateDeliveryQueue(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userID = req.params.id;
            const { queue } = req.body;
            if (!Array.isArray(queue)) {
                res.status(400).json({ message: "Queue must be an array of packet IDs" });
                return;
            }
            const updatedUser = yield userService.updateDeliveryQueue(userID, queue);
            if (!updatedUser) {
                res.status(404).json({ message: "User not found" });
                return;
            }
            res.status(200).json({ user: updatedUser, message: "Delivery queue updated successfully" });
        }
        catch (error) {
            res.status(500).json({ message: "Error updating delivery queue", error });
            console.log("Error updating delivery queue:", error);
        }
    });
}
function markPacketDeliveredHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = req.params.id;
        const packetId = req.body.packetId;
        console.log('userId param:', userId);
        console.log('packetId body:', packetId);
        try {
            const updatedUser = yield userService.markPacketAsDelivered(userId, packetId);
            if (!updatedUser) {
                res.status(404).json({ message: "User not found or invalid user" });
                return;
            }
            res.status(200).json({ message: "Packet marked as delivered", user: updatedUser });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: error.message || "Internal server error" });
        }
    });
}
//# sourceMappingURL=user.controller.js.map