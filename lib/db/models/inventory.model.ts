import mongoose, { Schema, model, Document } from 'mongoose';

    export interface IInventory extends Document {
      productVariant: mongoose.Types.ObjectId;
      stockQuantity: number;
      warehouseLocation?: string;
      lastChecked: Date;
    }

    const inventorySchema = new Schema<IInventory>({
      productVariant: {
        type: Schema.Types.ObjectId,
        ref: 'ProductVariant',
        required: true,
        unique: true
      },
      stockQuantity: {
        type: Number,
        required: true,
        min: 0
      },
      warehouseLocation: {
        type: String
      },
      lastChecked: {
        type: Date,
        default: Date.now
      }
    });

    const Inventory = model<IInventory>('Inventory', inventorySchema);
    export default Inventory;