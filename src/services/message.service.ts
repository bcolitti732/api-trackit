import mongoose from 'mongoose';
import { IMessage, MessageModel } from '../models/message';
import { UserModel } from '../models/user';

export class MessageService {
    async postMessage(message: Partial<IMessage>): Promise<IMessage> {
        // Verificar que senderId sea un usuario existente
        const senderExists = await UserModel.findById(message.senderId);
        if (!senderExists) {            
            throw new Error('Sender does not exist');
        }        
        // Verificar que receiverId sea un usuario existente        
        const receiverExists = await UserModel.findById(message.rxId);
        if (!receiverExists) {            
            throw new Error('Receiver does not exist');
        }
        // Crear y guardar el mensaje
        const newMessage = new MessageModel(message);        
        return await newMessage.save();
    }

    async getMessagesByUser(userId: string): Promise<IMessage[]> {
        const userExists = await UserModel.findById(userId);
        if (!userExists) {        
            console.log('Sender does not exist');    
            throw new Error('Sender does not exist');            
        } 
        console.log(userExists);
        const messages = await MessageModel.find({
            $or: [
                { senderId: new mongoose.Types.ObjectId(userId) },
                { rxId: new mongoose.Types.ObjectId(userId) }
            ]
        }).sort({ createdAt: -1 });

        console.log('Messages retrieved:', messages);
        return messages;
    }
    async getMessagesBetweenUsers(user1Id: string, user2Id: string): Promise<IMessage[]> {
        return await MessageModel.find({
            $or: [
                { senderId: new mongoose.Types.ObjectId(user1Id), rxId: new mongoose.Types.ObjectId(user2Id) },
                { receiverId: new mongoose.Types.ObjectId(user2Id), rxId: new mongoose.Types.ObjectId(user1Id) }
            ]
        }).sort({ createdAt: -1 }); // Ordenar por fecha de creación
    }
    async acknowledgeMessage(messageId: string): Promise<IMessage> {
        const message = await MessageModel.findByIdAndUpdate(
            messageId,
            { acknowledged: true },
            { new: true } // Retornar el documento actualizado
        );
        if (!message) {
            throw new Error('Message not found');
        }
        return message;
    }
}

export default new MessageService();