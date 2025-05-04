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
/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: The user was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Error creating user
 */
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
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       400:
 *         description: Error getting users
 */
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
/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *     responses:
 *       200:
 *         description: The user description by ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Error getting user
 */
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
/**
 * @swagger
 * /api/users/name/{name}:
 *   get:
 *     summary: Get a user by name
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: The user name
 *     responses:
 *       200:
 *         description: The user description by ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Error getting user
 */
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
/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: The updated user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Error updating user
 */
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
/**
 * @swagger
 * /api/users/{id}/deactivate:
 *   patch:
 *     summary: Change user availability (activate/deactivate)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *     responses:
 *       200:
 *         description: The updated user with changed availability
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Error changing user availability
 */
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
/**
 * @swagger
 * /api/users/{id}/packets:
 *   get:
 *     summary: Get all packets of a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *     responses:
 *       200:
 *         description: List of packets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Packet'
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
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
/**
 * @swagger
 * /api/users/{name}/packets:
 *   post:
 *     summary: Add a packet to a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: The user name
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               packetId:
 *                 type: string
 *                 description: The ID of the packet to add
 *     responses:
 *       200:
 *         description: Packet added to user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User or packet not found
 *       500:
 *         description: Internal server error
 */
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
