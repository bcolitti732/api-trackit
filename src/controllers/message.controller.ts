import { Request, Response } from 'express';
import messageService from '../services/message.service';
import { IMessage } from '../models/message';

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Send a new message
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Message'
 *     responses:
 *       201:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       400:
 *         description: Error sending message
 */
export async function postMessage(req: Request, res: Response): Promise<void> {
    try {
        const message = req.body as Partial<IMessage>;
        const newMessage = await messageService.postMessage(message);
        res.status(201).json(newMessage);
    } catch (error) {
        res.status(400).json({ message: "Error sending message", error });
    }
}

/**
 * @swagger
 * /api/messages/{userId}:
 *   get:
 *     summary: Get all messages for a user
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user's ID
 *     responses:
 *       200:
 *         description: List of messages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *       400:
 *         description: Error retrieving messages
 */
export async function getMessagesByUser(req: Request, res: Response): Promise<void> {
    try {
        const userId = req.params.userId;
        const messages = await messageService.getMessagesByUser(userId);
        res.status(200).json(messages);
    } catch (error) {
        res.status(400).json({ message: "Error retrieving messages", error });
    }
}

/**
 * @swagger
 * /api/messages/{user1Id}/{user2Id}:
 *   get:
 *     summary: Get messages between two users
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: user1Id
 *         required: true
 *         schema:
 *           type: string
 *         description: The first user ID
 *       - in: path
 *         name: user2Id
 *         required: true
 *         schema:
 *           type: string
 *         description: The second user ID
 *     responses:
 *       200:
 *         description: Messages between the users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *       400:
 *         description: Error retrieving messages
 */
export async function getMessagesBetweenUsers(req: Request, res: Response): Promise<void> {
    try {
        const { user1Id, user2Id } = req.params;
        const messages = await messageService.getMessagesBetweenUsers(user1Id, user2Id);
        res.status(200).json(messages);
    } catch (error) {
        res.status(400).json({ message: "Error retrieving messages", error });
    }
}

/**
 * @swagger
 * /api/messages/{messageId}/acknowledge:
 *   patch:
 *     summary: Mark a message as acknowledged
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: The message ID
 *     responses:
 *       200:
 *         description: Message acknowledged successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       400:
 *         description: Error acknowledging message
 */
export async function acknowledgeMessage(req: Request, res: Response): Promise<void> {
    try {
        const messageId = req.params.messageId;
        const updatedMessage = await messageService.acknowledgeMessage(messageId);
        res.status(200).json(updatedMessage);
    } catch (error) {
        res.status(400).json({ message: "Error acknowledging message", error });
    }
}
