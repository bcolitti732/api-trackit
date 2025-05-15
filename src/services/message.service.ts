import mongoose from 'mongoose';
import { IMessage, MessageModel } from '../models/message';
import { UserModel, IUser } from '../models/user';

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
            throw new Error('Sender does not exist');            
        }         
        const messages = await MessageModel.find({
            $or: [
                { senderId: new mongoose.Types.ObjectId(userId) },
                { rxId: new mongoose.Types.ObjectId(userId) }
            ]
        }).sort({ createdAt: -1 });        
        return messages;
    }
    async getMessagesBetweenUsers(user1Id: string, user2Id: string): Promise<IMessage[]> {
        const messages = await MessageModel.find({
            $or: [
                { senderId: new mongoose.Types.ObjectId(user1Id), rxId: new mongoose.Types.ObjectId(user2Id) },
                { senderId: new mongoose.Types.ObjectId(user2Id), rxId: new mongoose.Types.ObjectId(user1Id) }
            ]
        }).sort({ createdAt: -1 }); // Ordenar por fecha de creación        
        return messages;
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
  async getUserContacts(userId: string): Promise<any[]> {
    const objectId = new mongoose.Types.ObjectId(userId);

    // Usar Aggregation Framework para obtener los IDs únicos de contactos
    const contacts = await MessageModel.aggregate([
        {
            $match: {
                $or: [
                    { senderId: objectId },
                    { rxId: objectId }
                ]
            }
        },
        {
            $project: {
                contactId: {
                    $cond: [
                        { $ne: ["$senderId", objectId] }, // Si senderId no es igual a userId
                        "$senderId",                     // Usar senderId como contacto
                        "$rxId"                    // De lo contrario, usar receiverId
                    ]
                }
            }
        },
        {
            $group: {
                _id: "$contactId" // Agrupar por contactId para obtener IDs únicos
            }
        }
    ]);

    // Extraer los IDs únicos de los contactos
    const contactIds = contacts.map(contact => contact._id);

    // Buscar los detalles de los usuarios en la colección de usuarios
    const userContacts = await UserModel.find({ _id: { $in: contactIds } }).select('name email');
    return userContacts;
}
async startConversation(user1Id: string, user2Id: string): Promise<IMessage> {
    // Verificar que ambos usuarios existan
    const user1Exists = await UserModel.findById(user1Id);
    if (!user1Exists) {
        throw new Error('User 1 does not exist');
    }
    console.log('user1Exists', user1Exists);

    const user2Exists = await UserModel.findById(user2Id);
    if (!user2Exists) {
        throw new Error('User 2 does not exist');
    }
    console.log('user2Exists', user2Exists);
    // Generar un roomId único basado en los IDs de los usuarios
    const roomId = [user1Id, user2Id].sort().join('_'); // Ordenar para que sea consistente
    console.log('roomId', roomId);
    // Crear un mensaje vacío con el roomId
    const newMessage = new MessageModel({
        senderId: user1Id,
        rxId: user2Id,        
        roomId, // Identificador único de la conversación
        created: new Date(),
        acknowledged: false
    });
    console.log('newMessage', newMessage);

    // Guardar el mensaje en la base de datos
    return await newMessage.save();
}

}

export default new MessageService();