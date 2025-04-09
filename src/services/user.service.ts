import { IUser, UserModel } from '../models/user';

export class UserService {
    async postUser(user: Partial<IUser>): Promise<IUser> {
        const newUser = new UserModel(user);
        return await newUser.save();
    }

    async getAllUsers(page: number, limit: number): Promise<{ 
        totalUsers: number; 
        totalPages: number; 
        currentPage: number; 
        data: IUser[]; 
    }> {
        const skip = (page - 1) * limit;
    
        const totalUsers = await UserModel.countDocuments({ available: true });
    
        const users = await UserModel.find().skip(skip).limit(limit);
    
        return {
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page,
            data: users,
        };
    }

    async getUserById(id: string): Promise<IUser | null> {
        return await UserModel.findOne({ _id: id, available: true });
    }

    async getUserByName(name: string): Promise<IUser | null> {
        return await UserModel.findOne({ name, available: true });
    }

    async updateUserById(id: string, user: Partial<IUser>): Promise<IUser | null> {
        return await UserModel.findOneAndUpdate({ _id: id, available: true }, user, { new: true });
    }

    async deleteUserById(id: string): Promise<IUser | null> {
        return await UserModel.findByIdAndDelete(id);
    }

    async deactivateUserById(id: string): Promise<IUser | null> {
        const user = await UserModel.findById(id);
        if (!user) {
            throw new Error("User not found");
        }
    
        user.available = !user.available; // para clickar y desclickar al usuario y que se active o desactive en funcion de su estado
        return await user.save();
    }

    async getUserPacketsById(userId: string): Promise<IUser["packets"] | null> {
        const user = await UserModel.findById(userId).populate("packets");
        return user ? user.packets : null;
    }

    async addPacketToUser(userName: string, packetId: string): Promise<IUser | null> {
        const user = await UserModel.findOne({ name: userName, available: true });
        if (!user) {
            throw new Error("User not found");
        }

        if (!user.packets.includes(packetId as any)) {
            return await UserModel.findByIdAndUpdate(
                user._id,
                { $push: { packets: packetId } },
                { new: true, runValidators: false }
            );
        }

        return user;
    }


}

export default new UserService();