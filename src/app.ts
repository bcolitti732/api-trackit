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


dotenv.config(); // Cargar variables de entorno desde el archivo .env

import './utils/passport.google'; // Ensure the Google strategy is registered
import { verifyToken } from './utils/jwt.handle';

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
    console.log(`Swagger disponible a http://localhost:${app.get('port')}/api-docs`);
});

// -------------------- SERVIDOR DE CHAT SOCKET.IO --------------------
// Interfaz para tipado de mensajes del chat
interface ChatMessage {
    room: string;
    author: string;
    message: string;
    time: string;
}

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

// Manejar conexiones de Socket.IO para el chat
chatIO.on('connection', (socket) => {
    console.log(`Usuario conectado al chat: ${socket.id}`);

    // Verificación JWT para el socket principal
    socket.use(([event, ...args], next) => {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error('unauthorized'));

        try {
            const payload = verifyToken(token, 'access');
            // socket.data.user = payload.name;
            // console.log('Payload decodificado:', payload);
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
        console.log(`Usuario: ${socket.data.user}`);
        // socket.to(roomId).emit('status', { status: 'joined', user: socket.data.user });
    });

    // Manejar evento para enviar un mensaje
    socket.on('send_message', (data: ChatMessage) => {
        // Enviar el mensaje solo a los clientes en la misma sala
        socket.to(data.room).emit('receive_message', data);
        console.log(`Mensaje enviado en sala ${data.room} por ${data.author}: ${data.message}`);
    });

    // Manejar desconexión
    socket.on('disconnect', () => {
        console.log(`Usuario desconectado del chat: ${socket.id}`);
    });
});

// Iniciar el servidor de chat
chatServer.listen(CHAT_PORT, () => {
    console.log(`Servidor de chat escuchando en http://localhost:${CHAT_PORT}`);
});

// -------------------- RUTAS API Y SERVIDOR EXPRESS --------------------

export default app;