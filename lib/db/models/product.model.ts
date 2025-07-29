import { Document, Model, model, models, Schema } from 'mongoose';
import mongoose from 'mongoose';
import { IProductInput } from '@/types';
import './review.model'; // Ensure Review model is registered before use

export interface IProduct extends Omit<Document, '_id'>, Omit<IProductInput, 'category' | 'brand'> {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  category: mongoose.Types.ObjectId | string;
  brand: mongoose.Types.ObjectId | string;
  categoryHierarchy?: (mongoose.Types.ObjectId | string)[];
  productType?: string;
  variants: mongoose.Types.ObjectId[];
  sku?: string;
  
  // New fields for product page redesign
  videoUrls?: string[];
  customerImageUrls?: string[];
  specialOffers?: string[];
  returnPolicyText?: string;
  
  // Structured attributes for appliances/furniture
  dimensions?: {
    height: number;
    width: number;
    depth: number;
    unit: string;
  };
  weight?: {
    value: number;
    unit: string;
  };
  material?: string;
  finish?: string;
  energyRating?: string;
  energyConsumption?: string;
  capacity?: string;
  warrantyDetails?: string;
  installationRequired?: boolean;
  modelNumber?: string;
  
  // Fulfillment options
  isShippable?: boolean; // Flag to indicate if this product can be shipped (legacy field)
  isPickupAvailable?: boolean; // Flag to indicate if this product is available for in-store pickup (legacy field)
  
  // New delivery methods structure
  deliveryMethods?: {
    id: string;
    name: string;
    description?: string;
    icon: string; // 'truck' | 'package' | other icon names
    price?: number;
    estimatedDays?: string;
    isDefault?: boolean;
  }[];

  // Generic specifications (optional)
  specifications: { title: string; value: string }[];
}

    const productSchema = new Schema<IProduct>(
      {
        name: {
          type: String,
          required: true,
        },
        slug: {
          type: String,
          required: true,
          unique: true,
        },
        sku: {
          type: String,
          trim: true,
        },
        category: {
          type: Schema.Types.ObjectId,
          ref: 'Category',
          required: true,
        },
        categoryHierarchy: {
          type: [Schema.Types.ObjectId],
          ref: 'Category',
          default: [],
        },
        productType: {
          type: String,
          trim: true,
        },
        images: [String],
        videoUrls: {
          type: [String],
          default: [],
        },
        customerImageUrls: {
          type: [String],
          default: [],
        },
        specialOffers: {
          type: [String],
          default: [],
        },
        returnPolicyText: String,
        brand: {
          type: Schema.Types.ObjectId,
          ref: 'Brand',
          required: true,
        },
        description: {
          type: String,
          trim: true,
        },
        // Structured attributes
        dimensions: {
          type: {
            height: Number,
            width: Number,
            depth: Number,
            unit: String,
          },
        },
        weight: {
          type: {
            value: Number,
            unit: String,
          },
        },
        material: String,
        finish: String,
        energyRating: String,
        energyConsumption: String,
        capacity: String,
        warrantyDetails: String,
        installationRequired: Boolean,
        modelNumber: String,
        
        // Fulfillment options (legacy)
        isShippable: {type: Boolean, default: true},
        isPickupAvailable: {type: Boolean, default: false},
        
        // New delivery methods structure
        deliveryMethods: {
          type: [
            {
              id: String,
              name: String,
              description: String,
              icon: String,
              price: Number,
              estimatedDays: String,
              isDefault: Boolean
            }
          ],
          default: []
        },

        // Generic specifications
        specifications: {
          type: [
            {
              title: String,
              value: String,
            },
          ],
          default: [],
        },
        price: {
          type: Number,
          // Not required - can be undefined when not on sale
          required: false,
        },
        listPrice: {
          type: Number,
          required: true,
        },
        countInStock: {
          type: Number,
          required: true,
        },
        tags: { type: [String], default: ['new arrival'] },
        avgRating: {
          type: Number,
          required: false,
          default: 0,
        },
        numReviews: {
          type: Number,
          required: false,
          default: 0,
        },
        ratingDistribution: {
          type: [
            {
              rating: {
                type: Number,
                required: true,
              },
              count: {
                type: Number,
                required: true,
              },
            },
          ],
          default: [],
        },
        numSales: {
          type: Number,
          required: false,
          default: 0,
        },
        isPublished: {
          type: Boolean,
          required: true,
          default: false,
        },
        reviews: [
          {
            type: Schema.Types.ObjectId,
            ref: 'Review',
            default: [],
          },
        ],
        variants: {
          type: [{ type: Schema.Types.ObjectId, ref: 'ProductVariant' }],
          default: [],
        },
      },
      {
        timestamps: true,
      }
    );

    const Product =
      (models.Product as Model<IProduct>) ||
      model<IProduct>('Product', productSchema);

    export default Product;
