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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSockets = exports.chatIO = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const database_1 = require("./database");
const swagger_1 = require("./swagger");
const cors_1 = __importDefault(require("./middlewares/cors"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const packet_routes_1 = __importDefault(require("./routes/packet.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const message_routes_1 = __importDefault(require("./routes/message.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const node_http_1 = __importDefault(require("node:http"));
const socket_io_1 = require("socket.io");
const message_1 = require("./models/message");
const jwt_handle_1 = require("./utils/jwt.handle");
const app = (0, express_1.default)();
app.set('port', process.env.PORT || 5000);
app.use(cors_1.default);
app.use(express_1.default.json());
(0, database_1.startConnection)();
(0, swagger_1.setupSwagger)(app);
app.use('/api/users', user_routes_1.default);
app.use('/api/packets', packet_routes_1.default);
app.use('/api/auth', auth_routes_1.default);
app.use('/api/messages', message_routes_1.default);
app.use('/api/notifications', notification_routes_1.default);
app.listen(app.get('port'), () => {
    var _a;
    console.log(`Server running on port ${app.get('port')}`);
    console.log(`Swagger disponible a http://${((_a = process.env.BACKEND_URL) === null || _a === void 0 ? void 0 : _a.replace(/^https?:\/\//, '')) || 'localhost:' + app.get('port')}/api-docs`);
});
const CHAT_PORT = Number(process.env.CHAT_PORT) || 3001;
const chatServer = node_http_1.default.createServer();
exports.chatIO = new socket_io_1.Server(chatServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true,
    },
});
exports.userSockets = new Map();
exports.chatIO.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('unauthorized'));
    }
    const payload = (0, jwt_handle_1.verifyToken)(token, 'access');
    if (payload && payload.id) {
        socket.data.userId = payload.id;
        socket.data.userName = payload.name;
        return next();
    }
    else {
        return next(new Error('unauthorized'));
    }
});
exports.chatIO.on('connection', (socket) => {
    console.log(`Usuario conectado al chat: ${socket.id}`);
    exports.userSockets.set(socket.data.userId, socket.id);
    socket.on('disconnect', () => {
        console.log(`Socket desconectado: ${socket.id}`);
        exports.userSockets.forEach((sid, uid) => {
            if (sid === socket.id) {
                exports.userSockets.delete(uid);
                console.log(`Usuario desconectado: ${uid}`);
            }
        });
    });
    socket.on('join_room', (roomId) => {
        socket.join(roomId);
        console.log(`Usuario con ID ${socket.data.userId} se unió a la sala: ${roomId}`);
    });
    socket.on('send_message', (data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const newMessage = new message_1.MessageModel({
                senderId: data.senderId,
                rxId: data.rxId,
                roomId: data.roomId,
                content: data.content,
                created: new Date(),
                acknowledged: false,
            });
            yield newMessage.save();
            socket.to(data.roomId).emit('receive_message', newMessage);
            console.log(`Mensaje enviado en sala ${data.roomId} por ${data.senderId}: ${data.content}`);
        }
        catch (error) {
            console.error('Error al guardar el mensaje:', error);
            socket.emit('error', { message: 'Error al guardar el mensaje' });
        }
    }));
});
chatServer.listen(CHAT_PORT, () => {
    var _a;
    console.log(`Servidor de chat escuchando en http://${((_a = process.env.BACKEND_URL) === null || _a === void 0 ? void 0 : _a.replace(/^https?:\/\//, '').replace(/:\d+$/, '')) || 'localhost'}:${CHAT_PORT}`);
});
exports.default = app;
//# sourceMappingURL=app.js.map