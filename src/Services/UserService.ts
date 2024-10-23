import { HydratedDocument } from "mongoose";
import { IUser, User } from "../Models/User";
import { isEmail } from "../Utils/utils";
import { Icredentials } from "../Utils/interface";

class UserService {
  static async createUser(user: IUser) {
    const newUser: HydratedDocument<IUser> = await User.create(user);
    return newUser;
  }

  static async getUser(email: string, format?: 'doc') {
    if (isEmail(email)) {
      if (!format) {
        const user = await User.findOne({ email: email })
          .lean(true)
          .select(['_id', 'email', 'role']);

        return user;
      }
      const user = await User.findOne({ email: email }).select('+password');
      return user;
    }
  }

  static async getAllUsers() {
    const fieldList = ['fullname', 'email', 'createdAt'];
    const users = await User.find().select(fieldList);
    return users;
  }

  // @ts-ignore
  static async validateUser(credentials: Icredentials): Promise<HydratedDocument<IUser>> | null {
    const user = await this.getUser(credentials.email, 'doc');
    if (user) {
      // @ts-ignore
      const isMatch: boolean = await user.matchPassword(credentials.password);
      // @ts-ignore
      if (isMatch) return user;
    }
    return null;
  }

  static async updateUser(email: string, update: any) {
    const fields = Object.keys(update);

    fields.forEach((field: string) => {
      const controlList = ['email', 'createdAt', 'updatedAt'];
      if (controlList.includes(field)) delete update[field];
    });
    
    const updatedUser = await User.findOneAndUpdate({ email }, update, { new: true });
    return updatedUser;
  }

  static async deleteUser(email: string) {
    await User.deleteOne({ email });
  }

  // static async deleteUsers(filter: any) {
  //   await User.deleteMany()
  // }
}

export default UserService;