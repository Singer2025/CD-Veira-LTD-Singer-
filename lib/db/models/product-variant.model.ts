import { Document, model, Schema } from 'mongoose';

export interface IProductVariant extends Document {
  sku: string;
  price: number;
  stock: number;
  attributes: {
    name: string;
    value: string;
  }[];
  images?: string[];
  product: Schema.Types.ObjectId;
}

const productVariantSchema = new Schema<IProductVariant>({
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
  },
  attributes: {
    type: [{
      name: { type: String, required: true },
      value: { type: String, required: true }
    }],
    required: true,
  },
  images: [String],
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
});

const ProductVariant = model<IProductVariant>('ProductVariant', productVariantSchema);
export default ProductVariant;