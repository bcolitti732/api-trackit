import { Request, Response } from 'express';
import { IPacket } from '../models/packet';
import { PacketService } from '../services/packet.service';

const packetService = new PacketService();

/**
 * @swagger
 * /api/packets:
 *   post:
 *     summary: Create a new packet
 *     tags: [Packets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Packet'
 *     responses:
 *       201:
 *         description: The packet was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Packet'
 *       400:
 *         description: Error creating packet
 */
export async function postPacket(req: Request, res: Response): Promise<void> {
    try {
        const packet = req.body as IPacket;
        const newPacket = await packetService.postPacket(packet);
        res.status(201).json(newPacket);
    } catch (error) {
        res.status(400).json({ message: "Error creating packet", error });
    }
}

/**
 * @swagger
 * /api/packets:
 *   get:
 *     summary: Get all packets
 *     tags: [Packets]
 *     responses:
 *       200:
 *         description: List of all packets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Packet'
 *       400:
 *         description: Error getting packets
 */
export async function getAllPackets(req: Request, res: Response): Promise<void> {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        
        const packetsPaginated = await packetService.getAllPackets(page, limit);
        res.status(200).json(packetsPaginated);
    } catch (error) {
        res.status(400).json({ message: "Error getting packets", error });
    }
}

/**
 * @swagger
 * /api/packets/{id}:
 *   get:
 *     summary: Get a packet by ID
 *     tags: [Packets]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The packet ID
 *     responses:
 *       200:
 *         description: The packet description by ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Packet'
 *       400:
 *         description: Error getting packet
 */
export async function getPacketById(req: Request, res: Response): Promise<void> {
    try {
        const id = req.params.id;
        const packet = await packetService.getPacketById(id);
        res.status(200).json(packet);
    } catch (error) {
        res.status(400).json({ message: "Error getting packet", error });
    }
}

/**
 * @swagger
 * /api/packets/{id}:
 *   put:
 *     summary: Update a packet by ID
 *     tags: [Packets]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The packet ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Packet'
 *     responses:
 *       200:
 *         description: The updated packet
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Packet'
 *       400:
 *         description: Error updating packet
 */
export async function updatePacketById(req: Request, res: Response): Promise<void> {
    try {
        const id = req.params.id;
        const packet = req.body as IPacket;
        const updatedPacket = await packetService.updatePacketById(id, packet);
        res.status(200).json(updatedPacket);
    } catch (error) {
        res.status(400).json({ message: "Error updating packet", error });
    }
}

/**
 * @swagger
 * /api/packets/{id}:
 *   delete:
 *     summary: Delete a packet by ID
 *     tags: [Packets]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The packet ID
 *     responses:
 *       200:
 *         description: The deleted packet
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Packet'
 *       400:
 *         description: Error deleting packet
 */
export async function deletePacketById(req: Request, res: Response): Promise<void> {
    try {
        const id = req.params.id;
        const deletedPacket = await packetService.deletePacketById(id);
        res.status(200).json(deletedPacket);
    } catch (error) {
        res.status(400).json({ message: "Error deleting packet", error });
    }
}

/**
 * @swagger
 * /api/packets/{id}/user:
 *   get:
 *     summary: Get the user who owns a packet by packet ID
 *     tags: [Packets]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The packet ID
 *     responses:
 *       200:
 *         description: The user who owns the packet
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found for this packet
 *       400:
 *         description: Error getting user by packet
 */
export async function getUserByPacketId(req: Request, res: Response): Promise<void> {
    try {
        const packetId = req.params.id;
        const user = await packetService.getUserByPacketId(packetId);
        if (!user) {
            res.status(404).json({ message: "User not found for this packet" });
            return;
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ message: "Error getting user by packet", error });
    }
}