import dotenv from 'dotenv';
dotenv.config();

import express, { RequestHandler } from 'express';
import { startConnection } from './database';
import { setupSwagger } from './swagger';
import corsOptions from './middlewares/cors';
import userRoutes from './routes/user.routes';
import packetRoutes from './routes/packet.routes';
import authRoutes from './routes/auth.routes';
import messageRoutes from './routes/message.routes';
import notificationRoutes from './routes/notification.routes';

import http from 'node:http';
import { Server } from 'socket.io';
import { IMessage, MessageModel } from './models/message';

import { verifyToken } from './utils/jwt.handle';

const app: express.Application = express();

app.set('port', process.env.PORT || 5000);

app.use(corsOptions);
app.use(express.json() as RequestHandler);

startConnection();
setupSwagger(app);

app.use('/api/users', userRoutes);
app.use('/api/packets', packetRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);

app.listen(app.get('port'), () => {
    console.log(`Server running on port ${app.get('port')}`);
    console.log(`Swagger disponible a http://${process.env.BACKEND_URL?.replace(/^https?:\/\//, '') || 'localhost:' + app.get('port')}/api-docs`);
});

// --- SOCKET.IO CHAT SERVER ---

const CHAT_PORT = Number(process.env.CHAT_PORT) || 3001;
const chatServer = http.createServer();

export const chatIO = new Server(chatServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

// Mapa usuarioId -> socketId
export const userSockets = new Map<string, string>();

chatIO.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('unauthorized'));
    }

    const payload = verifyToken(token, 'access');
    if (payload && payload.id) {
        socket.data.userId = payload.id;
        socket.data.userName = payload.name;
        return next();
    } else {
        return next(new Error('unauthorized'));
    }
});

chatIO.on('connection', (socket) => {
    console.log(`Usuario conectado al chat: ${socket.id}`);

    // Guardar usuario conectado
    userSockets.set(socket.data.userId, socket.id);

    socket.on('disconnect', () => {
        console.log(`Socket desconectado: ${socket.id}`);
        userSockets.forEach((sid, uid) => {
            if (sid === socket.id) {
                userSockets.delete(uid);
                console.log(`Usuario desconectado: ${uid}`);
            }
        });
    });

    socket.on('join_room', (roomId: string) => {
        socket.join(roomId);
        console.log(`Usuario con ID ${socket.data.userId} se unió a la sala: ${roomId}`);
    });

    socket.on('send_message', async (data: IMessage) => {
        try {
            const newMessage = new MessageModel({
                senderId: data.senderId,
                rxId: data.rxId,
                roomId: data.roomId,
                content: data.content,
                created: new Date(),
                acknowledged: false,
            });
            await newMessage.save();
            socket.to(data.roomId).emit('receive_message', newMessage);
            console.log(`Mensaje enviado en sala ${data.roomId} por ${data.senderId}: ${data.content}`);
        } catch (error) {
            console.error('Error al guardar el mensaje:', error);
            socket.emit('error', { message: 'Error al guardar el mensaje' });
        }
    });
});

chatServer.listen(CHAT_PORT, () => {
    console.log(`Servidor de chat escuchando en http://${process.env.BACKEND_URL?.replace(/^https?:\/\//, '').replace(/:\d+$/, '') || 'localhost'}:${CHAT_PORT}`);
});

export default app;
