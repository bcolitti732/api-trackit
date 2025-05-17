import express, { RequestHandler } from 'express';
import { startConnection } from './database';
import { setupSwagger } from './swagger'; 
import corsOptions from './middlewares/cors';
import userRoutes from './routes/user.routes'; 
import packetRoutes from './routes/packet.routes';
import authRoutes from './routes/auth.routes';
import messageRoutes from './routes/message.routes';
import passport from 'passport';
import dotenv from 'dotenv';
import { createServer } from 'node:http';
import * as http from 'node:http';
import { Server, Socket } from 'socket.io';
import { IMessage, MessageModel } from './models/message';

dotenv.config(); // Cargar variables de entorno desde el archivo .env

import './utils/passport.google'; // Ensure the Google strategy is registered
import { verifyToken } from './utils/jwt.handle';
import IJwtPayload from './models/JWTPayload';

const app: express.Application = express();

app.set('port', process.env.PORT || 4000);

app.use(corsOptions);
app.use(express.json() as RequestHandler);

startConnection();

setupSwagger(app);

app.use('/api/users', userRoutes);
app.use('/api/packets', packetRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

app.use(passport.initialize());

app.listen(app.get('port'), () => {
    console.log(`Server running on port ${app.get('port')}`);
+    console.log(`Swagger disponible a http://${process.env.BACKEND_URL?.replace(/^https?:\/\//, '') || 'localhost:' + app.get('port')}/api-docs`);
});

// -------------------- SERVIDOR DE CHAT SOCKET.IO --------------------

// Puerto específico para el servidor de chat
const CHAT_PORT = process.env.CHAT_PORT || 3001;

// Crear servidor HTTP para el chat
const chatServer = http.createServer();

// Configurar Socket.IO para el chat con CORS
const chatIO = new Server(chatServer, {
    cors: {
        origin: '*', // Permitir cualquier origen (ajustar en producción)
        methods: ['GET', 'POST'],
        credentials: true
    }
});
// Mapa para asociar usuarios con sus sockets
const userSockets = new Map();

// Manejar conexiones de Socket.IO para el chat
chatIO.on('connection', (socket) => {
    console.log(`Usuario conectado al chat: ${socket.id}`);
    
    // Verificación JWT para el socket principal
    socket.use(([event, ...args], next) => {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error('unauthorized'));

        try {
            const payload = verifyToken(token, 'access');
            if (payload && payload.id) {
                socket.data.userId = payload.id;
                socket.data.userName = payload.name;
            } else {
                return next(new Error('unauthorized'));
            }
            // console.log('Payload decodificado:', payload);
            // Asociamos el ID de usuario con su socket actual
             userSockets.set(socket.data.userId, socket.id);
            return next();
        } catch (err) {
            return next(new Error('unauthorized'));
        }
    });
    
    socket.on('error', (err) => {
        if (err && err.message == 'unauthorized') {
            console.debug('unauthorized user');
            socket.emit('status', { status: 'unauthorized' });
            socket.disconnect();
        }
    });



    // Manejar evento para unirse a una sala
    socket.on('join_room', (roomId: string) => {
        socket.join(roomId);
        console.log(`Usuario con ID: ${socket.id} se unió a la sala: ${roomId}`);        
        // socket.to(roomId).emit('status', { status: 'joined', user: socket.data.user });
    });

    // Manejar evento para enviar un mensaje
    socket.on('send_message', async (data: IMessage) => {
        try {
            // Crear un nuevo mensaje basado en los datos recibidos
            const newMessage = new MessageModel({
                senderId: data.senderId,
                rxId: data.rxId,
                roomId: data.roomId,
                content: data.content,
                created: new Date(), // Asegúrate de incluir el campo `created`
                acknowledged: false
            });

            // Guardar el mensaje en la base de datos
            await newMessage.save();

            // Enviar el mensaje a los clientes en la misma sala
            socket.to(data.roomId).emit('receive_message', newMessage);

            console.log(`Mensaje enviado en sala ${data.roomId} por ${data.senderId}: ${data.content}`);
        } catch (error) {
            console.error('Error al guardar el mensaje:', error);
            socket.emit('error', { message: 'Error al guardar el mensaje' });
        }
    });
});

// Iniciar el servidor de chat
chatServer.listen(CHAT_PORT, () => {
    console.log(`Servidor de chat escuchando en http://localhost:${CHAT_PORT}`);
+    console.log(`Servidor de chat escuchando en http://${process.env.BACKEND_URL?.replace(/^https?:\/\//, '').replace(/:\d+$/, '') || 'localhost'}:${CHAT_PORT}`);
});

// -------------------- RUTAS API Y SERVIDOR EXPRESS --------------------

export default app;