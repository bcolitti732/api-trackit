import { Request, Response } from 'express';
import { chatIO, userSockets } from '../app'; // We'll export these from app.ts


/**
 * @swagger
 * /api/notifications/send/{userId}:
 *   get:
 *     summary: Envía una notificación push a un usuario específico (por Socket.IO)
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del usuario al que enviar la notificación
 *       - in: query
 *         name: message
 *         schema:
 *           type: string
 *         required: false
 *         description: Mensaje personalizado para la notificación
 *     responses:
 *       200:
 *         description: Notificación enviada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Usuario no conectado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
export async function sendNotificationToUser(req: Request, res: Response) {
    const { userId } = req.params;
    const { message } = req.query;

    const socketId = userSockets.get(userId);
    if (socketId && chatIO) {
        chatIO.to(socketId).emit('push_notification', {
            title: 'TrackIt Notification',
            body: message || 'Your package is near the destination!',
        });
        res.json({ success: true, message: 'Notification sent.' });
    } else {
        res.status(404).json({ success: false, message: 'User not connected.' });
    }
}