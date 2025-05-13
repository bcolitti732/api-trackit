import {ObjectId, Schema, model} from 'mongoose';

export interface IMessage {
  senderId: ObjectId;
  rxId: ObjectId;
  content: string;
  created: Date;
  acknowledged: boolean;
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
    required: true
  },

  created: {
    type: Date,
    required: true,
  },
  acknowledged: {
    type: Boolean,
    required: true,
    default: false
  }
});


export const MessageModel = model("Message", messageSchema);