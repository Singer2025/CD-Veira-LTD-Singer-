import mongoose, { Document, Schema } from 'mongoose';

export interface IBrand extends Document {
  _id: mongoose.Types.ObjectId | string;
  name: string;
  slug: string;
  logo: string;
  bannerImage?: string;
  isFeatured: boolean;
  description?: string;
}

const brandSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  logo: {
    type: String,
    required: true
  },
  bannerImage: {
    type: String
  },

  description: {
    type: String,
    trim: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Check if model already exists before compiling
const Brand = mongoose.models.Brand || mongoose.model<IBrand>('Brand', brandSchema);
export default Brand;