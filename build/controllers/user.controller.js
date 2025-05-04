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
exports.deleteUserById = deleteUserById;
exports.deactivateUserById = deactivateUserById;
exports.getUserPackets = getUserPackets;
exports.addPacketToUser = addPacketToUser;
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
            res.status(400).json({ message: "Error creating user", error });
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
            const user = req.body;
            const updatedUser = yield userService.updateUserById(id, user);
            res.status(200).json(updatedUser);
        }
        catch (error) {
            res.status(400).json({ message: "Error updating user", error });
        }
    });
}
function deleteUserById(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const id = req.params.id;
            const deletedUser = yield userService.deleteUserById(id);
            res.status(200).json(deletedUser);
        }
        catch (error) {
            res.status(400).json({ message: "Error deleting user", error });
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
//# sourceMappingURL=user.controller.js.map