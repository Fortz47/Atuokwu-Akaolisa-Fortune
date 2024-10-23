import { Schema, model, Model } from "mongoose";
const bcrypt = require('bcrypt');


export interface IUser {
  fullname: string,
  email: string,
  password: string,
  role?: string,
  createdAt?: Date,
  updatedAt?: Date,
}

interface IUserMethods {
  matchPassword(enteredPassword: string): Promise<Boolean>,
}

type UserModel = Model<IUser, {}, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    fullname: { type: String, required: true },
    email: { type: String, required: true },
    password: {
      type: String,
      required: true,
      minlength: 8,
      maxlength: 30,
      select: false
    },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
);

// encrypt password before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password') === false) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate();

  // @ts-ignore
  if (update.password) {
    const salt = await bcrypt.genSalt(10);
    // @ts-ignore
    const hash = await bcrypt.hash(update.password, salt);
    this.setUpdate({ $set: { password: hash } });
  }

  next();

});

// Match user entered password to hashed password in database
userSchema.method('matchPassword', async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
});

export const User = model<IUser, UserModel>('User', userSchema);