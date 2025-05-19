"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const passport_1 = __importDefault(require("passport"));
const http = __importStar(require("node:http"));
const socket_io_1 = require("socket.io");
const message_1 = require("./models/message");
require("./utils/passport.google");
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
app.use(passport_1.default.initialize());
app.listen(app.get('port'), () => {
    var _a;
    console.log(`Server running on port ${app.get('port')}`);
    +console.log(`Swagger disponible a http://${((_a = process.env.BACKEND_URL) === null || _a === void 0 ? void 0 : _a.replace(/^https?:\/\//, '')) || 'localhost:' + app.get('port')}/api-docs`);
});
const CHAT_PORT = process.env.CHAT_PORT || 3001;
const chatServer = http.createServer();
const chatIO = new socket_io_1.Server(chatServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true
    }
});
const userSockets = new Map();
chatIO.on('connection', (socket) => {
    console.log(`Usuario conectado al chat: ${socket.id}`);
    socket.use(([event, ...args], next) => {
        const token = socket.handshake.auth.token;
        if (!token)
            return next(new Error('unauthorized'));
        try {
            const payload = (0, jwt_handle_1.verifyToken)(token, 'access');
            if (payload && payload.id) {
                socket.data.userId = payload.id;
                socket.data.userName = payload.name;
            }
            else {
                return next(new Error('unauthorized'));
            }
            userSockets.set(socket.data.userId, socket.id);
            return next();
        }
        catch (err) {
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
    socket.on('join_room', (roomId) => {
        socket.join(roomId);
        console.log(`Usuario con ID: ${socket.id} se unió a la sala: ${roomId}`);
    });
    socket.on('send_message', (data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const newMessage = new message_1.MessageModel({
                senderId: data.senderId,
                rxId: data.rxId,
                roomId: data.roomId,
                content: data.content,
                created: new Date(),
                acknowledged: false
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
    console.log(`Servidor de chat escuchando en http://localhost:${CHAT_PORT}`);
    +console.log(`Servidor de chat escuchando en http://${((_a = process.env.BACKEND_URL) === null || _a === void 0 ? void 0 : _a.replace(/^https?:\/\//, '').replace(/:\d+$/, '')) || 'localhost'}:${CHAT_PORT}`);
});
exports.default = app;
//# sourceMappingURL=app.js.map