import {ObjectId, Schema, model} from 'mongoose';
export interface IUser {
  //_id?: ObjectId;
  name: string;
  email: string;
  password: string;
  phone: string;
  available: boolean;
  packets: ObjectId[];
  role: "admin" | "user" | "delivery";
  birthdate: Date;
  isProfileComplete: boolean;
  deliveryProfile?: {
    assignedPacket: ObjectId[];
    deliveredPackets: ObjectId[];
    vehicle: string;
  };
  location?: string;
}


const userSchema = new Schema<IUser>({
  //_id: { type: Schema.Types.ObjectId, required: false },
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    validate: {
      validator: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message: (props: any) => `${props.value} is not a valid email!`,
    },
  },
  password: { type: String, required: false },
  phone: { type: String, required: false },
  available: { type: Boolean, required: true, default: true },
  birthdate: { type: Date, required: false },
  isProfileComplete: { type: Boolean, default: true },
  packets: [{ type: Schema.Types.ObjectId, ref: "Packet" }],
  role: {
    type: String,
    enum: ["admin", "user", "delivery"],
    default: "user",
  },
  deliveryProfile: {
    assignedPacket: [{ type: Schema.Types.ObjectId, ref: "Packet" }],
    deliveredPackets: [{ type: Schema.Types.ObjectId, ref: "Packet" }],
    vehicle: { type: String },
  },
  location: { type: String, defualt: "41.27721, 1.99017"},
});

userSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});


export const UserModel = model("User", userSchema);