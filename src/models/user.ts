import {ObjectId, Schema, model} from 'mongoose';

export interface IUser {
  name: string;
  email: string;
  password: string;
  phone: string;
  available: boolean;
  packets: ObjectId[];
  //role: "admin" | "user" | "dealer";
  birthdate: Date;
  isProfileComplete: boolean;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String, 
    required: true
  },

  email: {
    type: String,
    required: true,
    validate: {
      validator: function (value: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      },
      message: (props: any) => `${props.value} is not a valid email!`
    }
  },

  password: {
    type: String,
    required: false
  },

  phone: {
    type: String,
    required: false
  },

  available: {
    type: Boolean,
    required: true,
    default: true
  },

  birthdate: {
    type: Date,
    required: true,
  },

  isProfileComplete: {
    type: Boolean,
    default: true,
  },
  
  packets: [{ type: Schema.Types.ObjectId, ref: "Packet" }],
  
});


export const UserModel = model("User", userSchema);