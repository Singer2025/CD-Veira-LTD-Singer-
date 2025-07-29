import { IUserInput } from '@/types';
import mongoose, { Document, Model, Schema } from 'mongoose';
import dbConnect from '../mongoose';

export interface IUser extends Document, IUserInput {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  wishlist: mongoose.Types.ObjectId[];
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    role: { type: String, required: true, default: 'User' },
    password: { type: String },
    image: { type: String },
    emailVerified: { type: Boolean, default: false },
    wishlist: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        default: []
      }
    ]
  },
  {
    timestamps: true,
  }
);

async function getUserModel(): Promise<Model<IUser>> {
  await dbConnect();
  
  if (mongoose.models.User) {
    return mongoose.models.User as Model<IUser>;
  }
  
  return mongoose.model<IUser>('User', userSchema);
}

export default getUserModel;
