import { IProduct } from '@/lib/db/models/product.model';

// Frontend Product type used in components
export type Product = {
  id: string;
  _id?: string; // For compatibility with MongoDB documents
  name: string;
  slug: string;
  imageUrl: string; // Main product image for display
  images?: string[]; // All product images
  shortDescription?: string;
  description?: string;
  price: number;
  listPrice?: number;
  category?: string | any; // Can be string ID or object
  brand?: string | any; // Can be string ID or object
  avgRating?: number;
  numReviews?: number;
  countInStock?: number;
  isPublished?: boolean;
};

// Convert IProduct (database model) to Product (frontend type)
export function convertToFrontendProduct(product: IProduct): Product {
  return {
    id: product._id,
    _id: product._id,
    name: product.name,
    slug: product.slug,
    imageUrl: product.images && product.images.length > 0 
      ? product.images[0] 
      : '/images/default-product.png',
    images: product.images,
    shortDescription: product.description?.substring(0, 100),
    description: product.description,
    price: product.price || product.listPrice,
    listPrice: product.listPrice,
    category: product.category,
    brand: typeof product.brand === 'object' && product.brand ? product.brand.name : product.brand,
    avgRating: product.avgRating,
    numReviews: product.numReviews,
    countInStock: product.countInStock,
    isPublished: product.isPublished
  };
}