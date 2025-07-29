import { Document, model, Schema, Error } from 'mongoose';
import mongoose from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  parent?: mongoose.Types.ObjectId | string;
  depth: number;
  path: (mongoose.Types.ObjectId | string)[];
  image: string;
  bannerImage?: string;
  isFeatured: boolean;
  description?: string;
  isParent?: boolean;
  effectiveBannerImage?: string;
  getEffectiveBannerImage(): Promise<string>;
  _id: mongoose.Types.ObjectId | string;
  attributeTemplates?: { name: string; type: string; options?: string[]; required?: boolean }[];
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema(
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
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
    depth: {
      type: Number,
      default: 0,
    },
    path: {
      type: [Schema.Types.ObjectId],
      default: [],
    },
    image: {
      type: String,
      required: true,
    },
    bannerImage: {
      type: String,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
    },
    isParent: {
      type: Boolean,
      default: false,
    },
    attributeTemplates: {
      type: [{
        name: String,
        type: String,
        options: [String],
        required: Boolean
      }],
      default: []
    }
  },
  {
    timestamps: true,
  }
);

// Check if model already exists before compiling
const Category = mongoose.models.Category || model('Category', categorySchema);

categorySchema.pre('save', async function (next) {
  try {
    if (!this.parent) {
      this.depth = 0;
      this.path = [];
      this.isParent = true;
    } else {
      this.isParent = false;
      const parent = await Category.findById(this.parent);
      if (!parent) {
        return next(new Error('Parent category not found'));
      }
      this.depth = parent.depth + 1;
      this.path = [...parent.path, parent._id];
    }

    // Circular reference check
    const visited = new Set<string>([this._id.toString()]);
    let currentParent = this.parent;
    while (currentParent) {
      if (visited.has(currentParent.toString())) {
        throw new Error('Circular reference detected');
      }
      visited.add(currentParent.toString());
      const parentDoc = await Category.findById(currentParent);
      currentParent = parentDoc?.parent;
    }

    return next();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return next(new Error(`Validation failed: ${message}`));
  }
});

// Add virtual for effective banner image
categorySchema.virtual('effectiveBannerImage').get(async function() {
  if (this.bannerImage) return this.bannerImage;
  
  if (this.parent) {
    const parent = await Category.findById(this.parent);
    return parent?.effectiveBannerImage || null;
  }
  return null;
});

// Add method to get effective banner image
categorySchema.methods.getEffectiveBannerImage = async function() {
  if (this.bannerImage) return this.bannerImage;
  
  // Walk up parent chain to find first banner
  let parentId = this.parent;
  while (parentId) {
    const parent = await Category.findById(parentId);
    if (!parent) break;
    if (parent.bannerImage) return parent.bannerImage;
    parentId = parent.parent;
  }
  return null;
};

// Add toJSON transform to include virtuals and handle ObjectId conversions
categorySchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = doc._id.toString();
    // Convert all ObjectId fields to strings
    if (ret.parent) ret.parent = ret.parent.toString();
    if (ret.path && Array.isArray(ret.path)) {
      ret.path = ret.path.map(id => id.toString());
    }
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export default Category;