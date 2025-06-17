import dotenv from 'dotenv';
dotenv.config(); // Cargar variables de entorno desde el archivo .env

import express, { RequestHandler } from 'express';
import { startConnection } from './database';
import { setupSwagger } from './swagger'; 
import corsOptions from './middlewares/cors';
import userRoutes from './routes/user.routes'; 
import packetRoutes from './routes/packet.routes';
import authRoutes from './routes/auth.routes';
import messageRoutes from './routes/message.routes';
import passport from 'passport';

import { createServer } from 'node:http';
import * as http from 'node:http';
import { Server, Socket } from 'socket.io';
import { IMessage, MessageModel } from './models/message';
import messageService from './services/message.service';


import './utils/passport.google'; // Ensure the Google strategy is registered
import { verifyToken } from './utils/jwt.handle';
import IJwtPayload from './models/JWTPayload';
import { IUser, UserModel } from './models/user';

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

/**
 * Almacena los usuarios conectados actualmente
 * key: socket.id, value: IUser
 */
const usersConnected: { [key: string]: Partial<IUser> } = {};



// Manejar conexiones de Socket.IO para el chat
chatIO.on('connection', async (socket) => {    
    console.log(`Nuevo cliente conectado: ${socket.id}`);
    const user: Partial<IUser> = {email: `Guest_${socket.id}`};
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

    
    /**
     * Maneja el registro del nombre de usuario
     * @param name Nombre elegido por el usuario
     */
    socket.on('email', async (email, role) => {
        if (email) {
            user.email = email;
            usersConnected[socket.id] = user;
            console.log(`Usuario conectado: ${user.email}`);
            
            // Correctly call the method using the messageService instance
            const unseenMessages: IMessage[] = await messageService.getUnacknowledgedMessagesByUser(email);
            console.log(`Unseen messages for ${user.email}:`, unseenMessages);
            
            console.log(role);
            if (role === 'user') {
                const filteredMessages = unseenMessages.filter(
                    msg => typeof msg.content === 'string' &&
                            msg.content.startsWith('***********') &&
                            msg.content.endsWith('***********')
                );
                console.log(`Filtered messages for ${user.email}:`, filteredMessages);
                if (filteredMessages.length > 0) {   
                    console.log("enviando packet_assigned a ", user.email);             
                    chatIO.emit('packet_assigned');
                }
            }
            if (unseenMessages.length > 0) {
                socket.emit('unseen_messages', unseenMessages);
            }
        }
    });

    // Manejar evento para unirse a una sala
    socket.on('join_room', (roomId: string) => {
        socket.join(roomId);
        console.log(`Usuario con ID: ${socket.id} se unió a la sala: ${roomId}`);        
        // socket.to(roomId).emit('status', { status: 'joined', user: socket.data.user });
    });
    socket.on('messages_seen', async () => {
        if(user.email){
            const unseenMessages: IMessage[] = await messageService.getUnacknowledgedMessagesByUser(user.email);                        
            if(unseenMessages.length > 0) {
                socket.emit('unseen_messages', unseenMessages);
            }
         }
    });

    socket.on('leave_room', (roomId: string) => {
        socket.leave(roomId);
        console.log(`Socket ${socket.id} salió de la sala ${roomId}`);
    });

    // Manejar evento para enviar un mensaje
    socket.on('send_message', async (data: IMessage) => {
        try {
            const rxUser = await UserModel.findById(data.rxId);
            if (!rxUser) {
                socket.emit('error', { message: 'Usuario receptor no encontrado' });
                return;
            }
                        // Crear un nuevo mensaje basado en los datos recibidos
            const newMessage = new MessageModel({
                senderId: data.senderId,
                rxId: data.rxId,
                roomId: data.roomId,
                content: data.content,
                created: new Date(), // Asegúrate de incluir el campo `created`
                acknowledged: false
            });
            await newMessage.save();
            
            // Buscar si el email del receptor está en usersConnected
            const isReceiverConnected = Object.values(usersConnected).some(
                (user: any) => user.email === rxUser.email
            );
            // Guardar el mensaje en la base de datos
            console.log(`isReceiverConnected: ${isReceiverConnected}`);
            if (!isReceiverConnected) {
                newMessage.acknowledged = false; // Marcar como leído si el receptor no está conectado
                await newMessage.save(); // Guardar el mensaje aunque el receptor no esté conectado            
            }
            else{
                if(rxUser.email){
                    // Buscar el socketId del receptor conectado
                    const socketsInRoom = await chatIO.in(data.roomId).fetchSockets();
                    const receiverSocketId = Object.keys(usersConnected).find(
                        key => usersConnected[key]?.email === rxUser.email
                    );   

                    if (receiverSocketId) {
                        socket.to(data.roomId).emit('receive_message', newMessage);
                        //chatIO.to(receiverSocketId).emit('receive_message', newMessage);
                          console.log(`Mensaje enviado en sala ${data.roomId} por ${data.senderId}: ${data.content}`);
                    }                
                    // socketsInRoom es un array de sockets, cada uno tiene una propiedad id
                    const isReceiverInRoom = socketsInRoom.some(socket => socket.id === receiverSocketId);
                    if (!isReceiverInRoom) {
                        console.log('ENVIANDOOOOOO ', receiverSocketId);
                        const unseenMessages: IMessage[] = await messageService.getUnacknowledgedMessagesByUser(rxUser.email);            
                        console.log(`Unseen messages for ${rxUser.email}:`, unseenMessages);
                        if(unseenMessages.length > 0 && receiverSocketId) {
                            chatIO.to(receiverSocketId).emit('unseen_messages', unseenMessages);
                        }                      
                    }       
            
                }
            }        
            
      
          
        } catch (error) {
            console.error('Error al guardar el mensaje:', error);
            socket.emit('error', { message: 'Error al guardar el mensaje' });
        }
    });
    socket.on('packetAssigned', async (packet, client) => {        
        const delivery = await UserModel.findOne({ email: user.email });
        if (!delivery) {
            console.error('No se encontró el usuario de entrega');
            return;
        }
        if (!delivery._id || !client.id) {
            console.error('Missing required IDs to generate roomId');
            return;
        }
        const roomId = [delivery._id, client.id].sort().join('_'); // Generate a consistent roomId
        const newMessage = new MessageModel({
            senderId: delivery._id,
            rxId: client.id,
            roomId: roomId, // Ensure `roomId` is included
            content: `*********** Paquete ${packet.name} en reparto ***********`,
            created: new Date(),
            acknowledged: false
        });
        await newMessage.save();
        const receiverSocketId = Object.keys(usersConnected).find(
            key => usersConnected[key]?.email === client.email
        );  
        if (receiverSocketId) {            
            chatIO.to(receiverSocketId).emit('packet_assigned');
        }
    });

    socket.on('packetDelivered', async (packet, client) => {        
        const delivery = await UserModel.findOne({ email: user.email });
        if (!delivery) {
            console.error('No se encontró el usuario de entrega');
            return;
        }
        if (!delivery._id || !client.id) {
            throw new Error('Missing required IDs to generate roomId');
        }
        const roomId = [delivery._id, client.id].sort().join('_'); // Ordenar para que sea consistente    
        const newMessage = new MessageModel({
            senderId: delivery._id,
            rxId: client.id,
            roomId: roomId,
            content: `*********** Paquete ${packet.name} entregado ***********`,
            created: new Date(), // Asegúrate de incluir el campo `created`
            acknowledged: false
        });
        await newMessage.save();
        // Aquí puedes actualizar la UI, mostrar una notificación, etc.
        const receiverSocketId = Object.keys(usersConnected).find(
                key => usersConnected[key]?.email === client.email
        );  
        if (receiverSocketId) {            
            chatIO.to(receiverSocketId).emit('packet_delivered');
        }
    });
        /**
     * Se ejecuta justo despues de la desconexión de un usuario
     * @param reason Motivo de la desconexión
     */
    socket.on('disconnect', (reason) => {
        console.log(`Client ${socket.id} disconnected: ${reason}`);
        // Elimina al usuario de la lista de conectados
        delete usersConnected[socket.id];
    });
    
});

// Iniciar el servidor de chat
chatServer.listen(CHAT_PORT, () => {
    console.log(`Servidor de chat escuchando en http://localhost:${CHAT_PORT}`);
+    console.log(`Servidor de chat escuchando en http://${process.env.BACKEND_URL?.replace(/^https?:\/\//, '').replace(/:\d+$/, '') || 'localhost'}:${CHAT_PORT}`);
});

// -------------------- RUTAS API Y SERVIDOR EXPRESS --------------------

export default app;