import {ObjectId, Schema, model} from 'mongoose';

export interface IMessage {
  senderId: ObjectId;
  rxId: ObjectId;
  content?: string;
  created: Date;
  acknowledged: boolean;
  roomId: string;
}

const messageSchema = new Schema<IMessage>({
    senderId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: false
  },

  rxId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: false
  },
  content: {
    type: String, 
    required: false
  },

  created: {
    type: Date,
    required: true,
  },
  acknowledged: {
    type: Boolean,
    required: true,
    default: false
  },
  roomId: {
    type: String,
    required: true,
  }
});


export const MessageModel = model("Message", messageSchema);