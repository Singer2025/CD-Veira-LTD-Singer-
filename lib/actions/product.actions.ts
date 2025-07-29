'use server'

import { connectToDatabase } from '@/lib/db'
import mongoose, { Types, FilterQuery, Document } from 'mongoose'
import Product, { IProduct } from '@/lib/db/models/product.model'
import Category from '@/lib/db/models/category.model'
import Brand from '@/lib/db/models/brand.model'
import { revalidatePath } from 'next/cache'
import { formatError } from '../utils'
import { ProductInputSchema, ProductUpdateSchema } from '../validator'
import { z } from 'zod'

// Define schemas for new structured fields
const DimensionsSchema = z.object({
  height: z.number(),
  width: z.number(),
  depth: z.number(),
  unit: z.string()
}).optional()

const WeightSchema = z.object({
  value: z.number(),
  unit: z.string()
}).optional()
import { IProductInput } from '@/types' // Needed for createProduct base type
import { getSetting } from './setting.actions'

// Define interfaces for Mongoose documents used within this module
interface CategoryDoc extends Document {
  _id: Types.ObjectId
  name: string
  slug: string
  parent?: Types.ObjectId
  bannerImage?: string
  path: Types.ObjectId[]
}

interface BrandDoc extends Document {
  _id: Types.ObjectId
  name: string
  slug: string
  logo?: string
}

// Helper function to validate and convert category references
async function validateAndConvertCategoryReference(categoryRef: string): Promise<Types.ObjectId> {
  if (mongoose.isValidObjectId(categoryRef)) {
    const exists = await Category.exists({ _id: categoryRef })
    if (!exists) throw new Error(`Category with ID ${categoryRef} not found`)
    return new Types.ObjectId(categoryRef)
  } else {
    const categoryDoc = await Category.findOne<CategoryDoc>({ $or: [{ name: categoryRef }, { slug: categoryRef }] }).select('_id').lean()
    if (!categoryDoc?._id) throw new Error(`Category "${categoryRef}" not found`)
    return new Types.ObjectId(categoryDoc._id as Types.ObjectId)
  }
}

// Helper function to validate and convert brand references
async function validateAndConvertBrandReference(brandRef: string): Promise<Types.ObjectId> {
  if (mongoose.isValidObjectId(brandRef)) {
    const exists = await Brand.exists({ _id: brandRef })
    if (!exists) throw new Error(`Brand with ID ${brandRef} not found`)
    return new Types.ObjectId(brandRef)
  } else {
    const brandDoc = await Brand.findOne<BrandDoc>({ $or: [{ name: brandRef }, { slug: brandRef }] }).select('_id').lean()
    if (!brandDoc?._id) throw new Error(`Brand "${brandRef}" not found`)
    return new Types.ObjectId(brandDoc._id as Types.ObjectId)
  }
}

// CREATE
export async function createProduct(data: IProductInput) {
  try {
    // Validate input data against the Zod schema
    // Validate base product data with explicitly added default values for required fields
    const baseProductData = ProductInputSchema.parse({
      ...data,
      // Explicitly add these fields to ensure they pass validation
      avgRating: 0,
      numReviews: 0,
      numSales: 0,
      ratingDistribution: [
        { rating: 1, count: 0 }, 
        { rating: 2, count: 0 }, 
        { rating: 3, count: 0 }, 
        { rating: 4, count: 0 }, 
        { rating: 5, count: 0 }
      ]
    });
    await connectToDatabase();

    // Validate and parse structured fields
    const dimensions = data.dimensions ? DimensionsSchema.parse(data.dimensions) : undefined;
    const weight = data.weight ? WeightSchema.parse(data.weight) : undefined;

    // Prepare the object for MongoDB
    const productToCreate = {
        ...baseProductData,
        sku: data.sku, // Explicitly include SKU field
        dimensions,
        weight,
        material: data.material,
        finish: data.finish,
        energyRating: data.energyRating,
        energyConsumption: data.energyConsumption,
        capacity: data.capacity,
        warrantyDetails: data.warrantyDetails,
        installationRequired: data.installationRequired,
        modelNumber: data.modelNumber,
        // Convert string IDs from input to ObjectIds
        category: new Types.ObjectId(baseProductData.category),
        brand: new Types.ObjectId(baseProductData.brand),
        // Initialize customer-related fields with default values
        // These fields are only updated when customers leave reviews or make purchases
        avgRating: 0,
        numReviews: 0,
        numSales: 0,
        isPublished: baseProductData.isPublished ?? false,
        reviews: [],
        ratingDistribution: [{ rating: 1, count: 0 }, { rating: 2, count: 0 }, { rating: 3, count: 0 }, { rating: 4, count: 0 }, { rating: 5, count: 0 }],
        variants: [],
        specifications: baseProductData.specifications?.map(spec => ({
            title: spec.title,
            value: spec.value
        })) ?? [],
        // Ensure images are properly saved
        images: baseProductData.images || [],
    };
    
    // No need to validate these fields as they are explicitly set with default values
    // and will be updated only when customers interact with the product


    // Get category path for hierarchy if needed
    if (productToCreate.category) {
      try {
        const categoryDoc = await Category.findById<CategoryDoc>(productToCreate.category).select('path _id');
        if (!categoryDoc) {
          throw new Error(`Category with ID ${productToCreate.category} not found`);
        }
        // Set the categoryHierarchy field to include the full path plus the current category
        productToCreate.categoryHierarchy = [...(categoryDoc.path || []), categoryDoc._id];
      } catch (error) {
        throw new Error(`Error fetching category: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    // Check for existing slug (case-sensitive)
    const existingProductWithSlug = await Product.findOne({ slug: productToCreate.slug });
    if (existingProductWithSlug) {
      // If a product with the exact same slug exists, return an error
      return { success: false, message: `Error: Product with slug "${productToCreate.slug}" already exists. Please use a unique slug.` };
    }
 
    await Product.create(productToCreate);
    revalidatePath('/admin/products');
    return { success: true, message: 'Product created successfully' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}


// UPDATE
export async function updateProduct(data: z.infer<typeof ProductUpdateSchema>) {
  try {
    const productInput = ProductUpdateSchema.parse(data)

    // Define a payload type based on the schema, allowing optional fields
    type ProductUpdatePayload = Partial<Omit<z.infer<typeof ProductUpdateSchema>, '_id' | 'specifications' | 'category' | 'brand' | 'price' | 'listPrice' | 'countInStock'>> & {
        specifications?: Array<{ title: string; value: string }>;
        dimensions?: {
            height: number;
            width: number;
            depth: number;
            unit: string;
        } | null;
        weight?: {
            value: number;
            unit: string;
        } | null;
        material?: string | null;
        finish?: string | null;
        energyRating?: string | null;
        energyConsumption?: string | null;
        capacity?: string | null;
        warrantyDetails?: string | null;
        installationRequired?: boolean | null;
        modelNumber?: string | null;
        category?: Types.ObjectId | null;
        brand?: Types.ObjectId;
        price?: number;
        listPrice?: number;
        countInStock?: number;
    };

    const updatePayload: ProductUpdatePayload = {};

    // Map validated input to payload, converting types
    Object.keys(productInput).forEach(key => {
        const typedKey = key as keyof typeof productInput;
        if (typedKey === '_id' || typedKey === 'category') return; // Skip _id and category (handled separately)

        if (typedKey === 'brand' && productInput.brand) {
            updatePayload.brand = new Types.ObjectId(productInput.brand);
        } else if (typedKey === 'listPrice' && productInput.listPrice !== undefined) {
            updatePayload.listPrice = Number(parseFloat(Number(productInput.listPrice).toFixed(2)));
        } else if (typedKey === 'countInStock' && productInput.countInStock !== undefined) {
            updatePayload.countInStock = Number(productInput.countInStock);
        } else if (typedKey === 'price' ) {
             if (productInput.price !== undefined && productInput.price !== null) {
                const priceNum = typeof productInput.price === 'string' ? parseFloat(productInput.price) : Number(productInput.price);
                if (!isNaN(priceNum)) updatePayload.price = Number(parseFloat(priceNum.toFixed(2)));
                else console.log('Invalid price value detected');
            } else if (productInput.price === null) updatePayload.price = undefined;
        } else if (typedKey === 'specifications' && productInput.specifications !== undefined) {
            updatePayload.specifications = productInput.specifications.map(spec => ({ title: spec.title, value: spec.value ?? '' }));
        } else if (typedKey === 'dimensions' && productInput.dimensions !== undefined) {
            updatePayload.dimensions = productInput.dimensions ? DimensionsSchema.parse(productInput.dimensions) : null;
        } else if (typedKey === 'weight' && productInput.weight !== undefined) {
            updatePayload.weight = productInput.weight ? WeightSchema.parse(productInput.weight) : null;
        } else if ([
            'material',
            'finish',
            'energyRating',
            'energyConsumption',
            'capacity',
            'warrantyDetails',
            'modelNumber'
        ].includes(typedKey) && productInput[typedKey] !== undefined) {
            updatePayload[typedKey] = productInput[typedKey] ?? null;
        } else if (typedKey === 'installationRequired' && productInput.installationRequired !== undefined) {
            updatePayload.installationRequired = productInput.installationRequired ?? null;
        } else if (productInput[typedKey] !== undefined) {
            // Assign other valid fields directly (use type assertion carefully)
            (updatePayload as Record<string, unknown>)[typedKey] = productInput[typedKey];
        }
    });

     // Handle category separately
    if (productInput.category !== undefined) {
        updatePayload.category = productInput.category ? new Types.ObjectId(productInput.category) : null;
    }

    await connectToDatabase();
    const productToUpdate = await Product.findById(productInput._id);
    if (!productToUpdate) throw new Error('Product not found');

    // Apply basic updates using Mongoose set
    Object.keys(updatePayload).forEach((key) => {
        const typedKey = key as keyof ProductUpdatePayload;
        if (typedKey === 'category') return; // Skip category
        if (updatePayload[typedKey] !== undefined) {
            productToUpdate.set(typedKey, updatePayload[typedKey]);
        } else if (typedKey === 'price' && productInput.price === null) {
             productToUpdate.set('price', undefined); // Explicitly unset price
        }
    });

    // Handle category update and derive hierarchy fields
    if (updatePayload.category !== undefined) {
        if (updatePayload.category === null) {
            productToUpdate.set({ category: undefined, categoryHierarchy: [] });
        } else {
            try {
                const categoryDoc = await Category.findById<CategoryDoc>(updatePayload.category).select('_id path');
                if (!categoryDoc) {
                    throw new Error(`Category with ID ${updatePayload.category} not found`);
                }
                // Set the category and update the categoryHierarchy with the full path
                const categoryHierarchy = [...(categoryDoc.path || []), categoryDoc._id];
                productToUpdate.set({ 
                    category: updatePayload.category,
                    categoryHierarchy: categoryHierarchy
                });
            } catch (error) {
                throw new Error(`Error fetching category: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
    }

    await productToUpdate.save();
    revalidatePath('/admin/products', 'page');
    revalidatePath(`/admin/products/${productInput._id}`, 'page');
    return { success: true, message: 'Product updated successfully' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// DELETE
export async function deleteProduct(id: string | string[]) {
  try {
    await connectToDatabase()
    
    // Handle bulk deletion if an array of IDs is provided
    if (Array.isArray(id)) {
      if (id.length === 0) {
        return { success: false, message: 'No products selected for deletion' }
      }
      
      const result = await Product.deleteMany({ _id: { $in: id } })
      if (result.deletedCount === 0) {
        throw new Error('No products found to delete')
      }
      
      revalidatePath('/admin/products')
      return { 
        success: true, 
        message: `${result.deletedCount} product${result.deletedCount > 1 ? 's' : ''} deleted successfully` 
      }
    }
    
    // Handle single product deletion
    const res = await Product.findByIdAndDelete(id)
    if (!res) throw new Error('Product not found')
    revalidatePath('/admin/products')
    return { success: true, message: 'Product deleted successfully' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}
// GET ONE PRODUCT BY ID
export async function getProductById(productId: string) {
  await connectToDatabase()
  const product = await Product.findById(productId)
    .populate('category', 'name slug')
    .populate('brand', 'name slug logo')
    .populate({ path: 'reviews', populate: { path: 'user', select: 'name' } })
  return JSON.parse(JSON.stringify(product)) as IProduct // Assuming IProduct matches populated structure
}

// Define return type for Admin products function
type AdminProductsResult = {
  products: IProduct[];
  totalPages: number;
  totalProducts: number;
  from: number;
  to: number;
};

// GET ALL PRODUCTS FOR ADMIN
export async function getAllProductsForAdmin(
    params: { // Use a single params object
        query?: string
        page?: number
        sort?: string
        limit?: number
        mainCategory?: string
        category?: string
        stockStatus?: string
        brand?: string
        priceRange?: string
    } = {} // Default empty object
): Promise<AdminProductsResult> {
  // Destructure with defaults inside the function
  const {
      query = 'all',
      page = 1,
      sort = 'latest',
      limit,
      mainCategory = 'all',
      category = 'all',
      stockStatus = 'all',
      brand = 'all',
      priceRange = 'all'
  } = params;

  await connectToDatabase()

  const { common: { pageSize } } = await getSetting()
  const effectiveLimit = limit || pageSize

  const queryFilter: FilterQuery<IProduct> = query && query !== 'all' ? { name: { $regex: query, $options: 'i' } } : {}

  let categoryFilter: FilterQuery<IProduct> = {}
  let mainCategoryFilter: FilterQuery<IProduct> = {}

  if (mainCategory && mainCategory !== 'all') {
    try {
      const mainCategoryId = await validateAndConvertCategoryReference(mainCategory)
      if (!category || category === 'all') {
        mainCategoryFilter = { categoryHierarchy: { $elemMatch: { $eq: mainCategoryId } } }
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        console.warn(`Admin: Main category "${mainCategory}" not found`)
        return { products: [], totalProducts: 0, totalPages: 0, from: 0, to: 0 }
      }
      console.error('Admin: Main category validation error:', error)
      throw new Error(`Invalid main category reference: ${mainCategory}. ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  if (category && category !== 'all') {
    try {
      const categoryId = await validateAndConvertCategoryReference(category)
      categoryFilter = { categoryHierarchy: { $elemMatch: { $eq: categoryId } } }
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        console.warn(`Admin: Category "${category}" not found`)
        return { products: [], totalProducts: 0, totalPages: 0, from: 0, to: 0 }
      }
      console.error('Admin: Category validation error:', error)
      throw new Error(`Invalid category reference: ${category}. ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  let brandFilter: FilterQuery<IProduct> = {}
  if (brand && brand !== 'all') {
    try {
      brandFilter = { brand: await validateAndConvertBrandReference(brand) }
    } catch (error) {
      console.error('Admin: Brand validation error:', error)
      throw new Error(`Invalid brand reference: ${brand}. ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  let stockFilter: FilterQuery<IProduct> = {}
  if (stockStatus && stockStatus !== 'all') {
    if (stockStatus === 'instock') stockFilter = { countInStock: { $gt: 0 } }
    else if (stockStatus === 'lowstock') stockFilter = { countInStock: { $gt: 0, $lte: 5 } }
    else if (stockStatus === 'outofstock') stockFilter = { countInStock: { $lte: 0 } }
  }

  let priceFilter: FilterQuery<IProduct> = {}
  if (priceRange && priceRange !== 'all') {
    if (priceRange === 'under500') priceFilter = { price: { $lt: 500 } }
    else if (priceRange === '500to1000') priceFilter = { price: { $gte: 500, $lte: 1000 } }
    else if (priceRange === '1000to2000') priceFilter = { price: { $gte: 1000, $lte: 2000 } }
    else if (priceRange === 'over2000') priceFilter = { price: { $gt: 2000 } }
  }

  const order: Record<string, 1 | -1> =
    sort === 'best-selling' ? { numSales: -1, _id: -1 } :
    sort === 'price-low-to-high' ? { price: 1, _id: -1 } :
    sort === 'price-high-to-low' ? { price: -1, _id: -1 } :
    sort === 'avg-customer-review' ? { avgRating: -1, _id: -1 } :
    { _id: -1 }

  const combinedFilters: FilterQuery<IProduct> = {
    ...queryFilter,
    ...(Object.keys(categoryFilter).length > 0 ? categoryFilter : mainCategoryFilter),
    ...brandFilter,
    ...stockFilter,
    ...priceFilter
  }

  const countProducts = await Product.countDocuments(combinedFilters)
  const productsFromDB = await Product.find(combinedFilters)
    .select('_id name slug images category brand price listPrice countInStock avgRating isPublished updatedAt')
    .sort(order)
    .skip(effectiveLimit * (Number(page) - 1))
    .limit(effectiveLimit)
    .populate('category', 'name slug')
    .populate('brand', 'name slug logo')
    .lean()

  // Transform products to include imageUrl
  const productsWithImageUrl = productsFromDB.map(product => {
    // @ts-expect-error Product is a lean object here, properties like 'images', 'name', 'sku' might not be strictly typed before full IProduct conversion.
    const derivedImageUrl = product.images && product.images.length > 0 ? product.images[0] : '/images/default-product.png';
    // @ts-expect-error Product is a lean object here.
    if (product.name === "Honeycomb Two-Slice Toaster" || product.sku === "HNYCMB-TSTR-2SL") {
      // @ts-expect-error Product is a lean object here.
      console.log(`[getAllProducts] Debug Product: ${product.name} (SKU: ${product.sku}) - Original images:`, JSON.stringify(product.images));
      console.log(`[getAllProducts] Debug Product: ${product.name} (SKU: ${product.sku}) - Derived imageUrl:`, derivedImageUrl);
    }
    return {
      // @ts-expect-error Spreading lean object.
      ...product,
      imageUrl: derivedImageUrl
    };
  });

  return {
    products: JSON.parse(JSON.stringify(productsWithImageUrl)) as IProduct[],
    totalPages: Math.ceil(countProducts / effectiveLimit),
    totalProducts: countProducts,
    from: effectiveLimit * (Number(page) - 1) + 1,
    to: effectiveLimit * (Number(page) - 1) + productsWithImageUrl.length,
  };
}

// Type helper for category structure needed in getEffectiveBanner
type BannerInfo = {
  _id: Types.ObjectId | string;
  bannerImage?: string;
  parent?: Types.ObjectId | string;
};

// Define a type for the lean category object used in the map
type LeanCategoryForMap = {
    _id: Types.ObjectId | string;
    parent?: Types.ObjectId | string;
    bannerImage?: string;
    name?: string;
    slug?: string;
    depth?: number;
    path?: Types.ObjectId[];
    isParent?: boolean;
    image?: string;
    description?: string;
};


export async function getAllCategories() {
  await connectToDatabase();
  const categories = await Category.find({}, {
    _id: 1, name: 1, slug: 1, parent: 1, depth: 1, path: 1, isParent: 1, image: 1, bannerImage: 1, description: 1
  }).sort({ depth: 1, name: 1 }).lean<LeanCategoryForMap[]>();

  const categoryMap = new Map<string, BannerInfo>(
    categories.map((cat) => [ cat._id.toString(), cat as BannerInfo ])
  );

  // Recursive helper function with proper typing
  const getEffectiveBanner = (currentCategory: BannerInfo): string | null => {
    if (currentCategory.bannerImage) return currentCategory.bannerImage;
    if (currentCategory.parent) {
      const parentId = currentCategory.parent.toString();
      const parent = categoryMap.get(parentId);
      return parent ? getEffectiveBanner(parent) : null;
    }
    return null;
  };

  const categoriesWithEffectiveBanner = categories.map(category => {
    return {
      ...category,
      effectiveBannerImage: getEffectiveBanner(category as BannerInfo)
    };
  });

  return JSON.parse(JSON.stringify(categoriesWithEffectiveBanner));
}


export async function getAllBrands() {
  await connectToDatabase()
  const brands = await Brand.find({}, { _id: 1, name: 1, slug: 1 }).sort({ name: 1 }).lean()
  return JSON.parse(JSON.stringify(brands))
}
export async function getProductsForCard({
  tag,
  limit = 4,
}: {
  tag: string
  limit?: number
}) {
  await connectToDatabase()
  const productsFromDB = await Product.find({ tags: tag, isPublished: true })
    .select('_id name slug images category brand price listPrice avgRating')
    .sort({ _id: -1 })
    .limit(limit)
    .populate('category', 'name slug')
    .populate('brand', 'name slug logo')
    .lean()
    
  // Transform products to include imageUrl
  const productsWithImageUrl = productsFromDB.map(product => ({
    ...product,
    imageUrl: product.images && product.images.length > 0 ? product.images[0] : '/images/default-product.png'
  }));
  
  return JSON.parse(JSON.stringify(productsWithImageUrl)) as IProduct[]
}

export async function getProductsByTag({
  tag,
  limit = 4,
}: {
  tag: string
  limit?: number
}) {
  await connectToDatabase()
  const productsFromDB = await Product.find({ tags: tag, isPublished: true })
    .select('_id name slug images category brand price listPrice avgRating')
    .sort({ _id: -1 })
    .limit(limit)
    .populate('category', 'name slug')
    .populate('brand', 'name slug logo')
    .lean()
    
  // Transform products to include imageUrl
  const productsWithImageUrl = productsFromDB.map(product => ({
    ...product,
    imageUrl: product.images && product.images.length > 0 ? product.images[0] : '/images/default-product.png'
  }));
  
  return JSON.parse(JSON.stringify(productsWithImageUrl)) as IProduct[]
}

export async function getProductBySlug(slug: string) {
  await connectToDatabase()
  const product = await Product.findOne({ slug })
    .populate('category', 'name slug')
    .populate('brand', 'name slug logo')
    .populate({ path: 'reviews', populate: { path: 'user', select: 'name' } })
  
  // Return null if product not found instead of trying to stringify null
  if (!product) return null;
  
  return JSON.parse(JSON.stringify(product)) as IProduct
}

export async function getRelatedProductsByCategory({
  category,
  productId,
  limit = 4,
}: {
  category: string | object
  productId: string
  limit?: number
}) {
  await connectToDatabase();
  let products: IProduct[] = [];
  let currentCategoryId: Types.ObjectId | undefined;

  try {
    // 1. Attempt to resolve the initial category reference
    // Handle case when category is an object or string
    const categoryRef = typeof category === 'object' && category !== null ? 
      (category as any)._id?.toString() || '' : 
      category as string;
      
    if (!categoryRef) {
      console.warn('Related products: No valid category reference provided');
      return [];
    }
    
    currentCategoryId = await validateAndConvertCategoryReference(categoryRef);
  } catch (error) {
    console.warn(`Related products: Initial category reference not found or invalid. Error: ${error instanceof Error ? error.message : String(error)}`);
    return []; // Return empty if initial category ref is bad
  }

  // 2. Fetch products from the resolved (direct) category
  if (currentCategoryId) {    
    let productsFromDB = await Product.find({
      category: currentCategoryId,
      _id: { $ne: new Types.ObjectId(productId) },
      isPublished: true,
    })
      .select('_id name slug images category brand price listPrice avgRating countInStock')
      .sort({ _id: -1 })
      .limit(limit)
      .populate('category', 'name slug')
      .populate('brand', 'name slug logo')
      .lean();

    // Transform products to include imageUrl
    let productsWithImageUrl = productsFromDB.map(product => ({
      ...product,
      imageUrl: product.images && product.images.length > 0 ? product.images[0] : '/images/default-product.png'
    }));

    // Convert ObjectIds to strings for serialization
    products = JSON.parse(JSON.stringify(productsWithImageUrl));

    // 3. If no products found in direct category AND the direct category was valid, try parent
    if (products.length === 0) {
      console.log(`No related products found in direct category ${currentCategoryId}. Attempting parent category.`);
      try {
        const directCategoryDoc = await Category.findById(currentCategoryId).select('parent').lean();

        if (directCategoryDoc?.parent) {
          const parentCategoryId = directCategoryDoc.parent as Types.ObjectId;
          console.log(`Found parent category: ${parentCategoryId}. Fetching products.`);

          let parentProductsFromDB = await Product.find({
            category: parentCategoryId,
            _id: { $ne: new Types.ObjectId(productId) },
            isPublished: true,
          })
            .select('_id name slug images category brand price listPrice avgRating')
            .sort({ _id: -1 })
            .limit(limit)
            .populate('category', 'name slug')
            .populate('brand', 'name slug logo')
            .lean();
            
          // Transform products to include imageUrl
          let parentProductsWithImageUrl = parentProductsFromDB.map(product => ({
            ...product,
            imageUrl: product.images && product.images.length > 0 ? product.images[0] : '/images/default-product.png'
          }));
          
          products = parentProductsWithImageUrl;
          
          if (products.length > 0) {
            console.log(`Found ${products.length} products in parent category ${parentCategoryId}.`);
          } else {
            console.log(`No products found in parent category ${parentCategoryId} either.`);
          }
        } else {
          console.log(`Direct category ${currentCategoryId} has no parent.`);
        }
      } catch (error) {
        console.error(`Error fetching or processing parent category for ${currentCategoryId}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  // If still no products found, try to find any published products as a fallback
  if (products.length === 0) {
    console.log('No related products found in category hierarchy. Fetching recent products as fallback.');
    let fallbackProductsFromDB = await Product.find({
      _id: { $ne: new Types.ObjectId(productId) },
      isPublished: true,
    })
      .select('_id name slug images category brand price listPrice avgRating')
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('category', 'name slug')
      .populate('brand', 'name slug logo')
      .lean();
      
    // Transform products to include imageUrl
    let fallbackProductsWithImageUrl = fallbackProductsFromDB.map(product => ({
      ...product,
      imageUrl: product.images && product.images.length > 0 ? product.images[0] : '/images/default-product.png'
    }));
    
    products = fallbackProductsWithImageUrl;
  }

  return JSON.parse(JSON.stringify(products)) as IProduct[];
}

export async function getNewestProducts({
  limit = 8,
}: {
  limit?: number
}) {
  await connectToDatabase()
  const productsFromDB = await Product.find({ isPublished: true })
    .select('_id name slug images category brand price listPrice avgRating countInStock')
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('category', 'name slug')
    .populate('brand', 'name slug logo')
    .lean()
    
  // Transform products to include imageUrl
  const productsWithImageUrl = productsFromDB.map(product => ({
    ...product,
    imageUrl: product.images && product.images.length > 0 ? product.images[0] : '/images/default-product.png'
  }));
  
  return JSON.parse(JSON.stringify(productsWithImageUrl)) as IProduct[]
}

// Define return type for Storefront products function
type StorefrontProductsResult = {
  products: IProduct[];
  totalPages: number;
  totalProducts: number;
  from: number;
  to: number;
};

// GET ALL PRODUCTS FOR STOREFRONT (Search Page, etc.)
export async function getAllProducts(
    params: { // Use single params object
        query?: string;
        limit?: number;
        page?: number;
        category?: string;
        tag?: string;
        brand?: string;
        price?: string;
        rating?: string;
        sort?: string;
    } = {} // Default empty object
): Promise<StorefrontProductsResult> {
  // Destructure with defaults
   const {
        query = 'all',
        limit,
        page = 1,
        category = 'all',
        tag = 'all',
        brand = 'all',
        price = 'all',
        rating = 'all',
        sort = 'best-selling',
    } = params;

  await connectToDatabase();

  const { common: { pageSize } } = await getSetting();
  const effectiveLimit = limit || pageSize;

  const queryFilter: FilterQuery<IProduct> = query && query !== 'all' ? { name: { $regex: query, $options: 'i' } } : {};
  const tagFilter: FilterQuery<IProduct> = tag && tag !== 'all' ? { tags: tag } : {};
  const ratingFilter: FilterQuery<IProduct> = rating && rating !== 'all' ? { avgRating: { $gte: Number(rating) } } : {};
  const priceFilter: FilterQuery<IProduct> = price && price !== 'all' ? { price: { $gte: Number(price.split('-')[0]), $lte: Number(price.split('-')[1]) } } : {};

  let brandFilter: FilterQuery<IProduct> = {};
  if (brand && brand !== 'all') {
    try {
      brandFilter = { brand: await validateAndConvertBrandReference(brand) };
    } catch (error) {
      console.error('Storefront: Brand validation error:', error);
      if (error instanceof Error && error.message.includes('not found')) {
        console.warn(`Storefront: Brand "${brand}" not found`);
        return { products: [], totalPages: 0, totalProducts: 0, from: 0, to: 0 };
      }
      throw new Error(`Invalid brand reference: ${brand}. ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  let finalCategoryFilter: FilterQuery<IProduct> = {};
  if (category && category !== 'all') {
    try {
      const categoryId = await validateAndConvertCategoryReference(category);
      finalCategoryFilter = { categoryHierarchy: { $elemMatch: { $eq: categoryId } } };
    } catch (error) {
      console.error('Storefront: Category validation error:', error);
      if (error instanceof Error && error.message.includes('not found')) {
        console.warn(`Storefront: Category "${category}" not found`);
        return { products: [], totalPages: 0, totalProducts: 0, from: 0, to: 0 };
      }
      throw new Error(`Invalid category reference: ${category}. ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  const order: Record<string, 1 | -1> =
    sort === 'best-selling' ? { numSales: -1, _id: -1 } :
    sort === 'price-low-to-high' ? { price: 1, _id: -1 } :
    sort === 'price-high-to-low' ? { price: -1, _id: -1 } :
    sort === 'avg-customer-review' ? { avgRating: -1, _id: -1 } :
    sort === 'newest-arrivals' ? { createdAt: -1, _id: -1 } :
    { _id: -1 };

  const isPublished = { isPublished: true };

  const combinedFilters: FilterQuery<IProduct> = {
    ...isPublished,
    ...queryFilter,
    ...tagFilter,
    ...finalCategoryFilter,
    ...brandFilter,
    ...priceFilter,
    ...ratingFilter,
  };

  const countProducts = await Product.countDocuments(combinedFilters);
  const productsFromDB = await Product.find(combinedFilters)
    .sort(order)
    .skip(effectiveLimit * (Number(page) - 1))
    .limit(effectiveLimit)
    .select('_id name slug images category brand price listPrice avgRating countInStock numReviews')
    .populate('category', 'name slug')
    .populate('brand', 'name slug logo')
    .lean();

  // Transform products to include imageUrl
  const productsWithImageUrl = productsFromDB.map(product => ({
    ...product,
    imageUrl: product.images && product.images.length > 0 ? product.images[0] : '/images/default-product.png'
  }));

  return {
    products: JSON.parse(JSON.stringify(productsWithImageUrl)) as IProduct[],
    totalPages: Math.ceil(countProducts / effectiveLimit),
    totalProducts: countProducts,
    from: effectiveLimit * (Number(page) - 1) + 1,
    to: effectiveLimit * (Number(page) - 1) + productsWithImageUrl.length,
  };
}


export async function getAllTags() {
  await connectToDatabase();
  const tags = await Product.aggregate([
    { $match: { isPublished: true } },
    { $unwind: '$tags' },
    { $group: { _id: null, uniqueTags: { $addToSet: '$tags' } } },
    { $project: { _id: 0, uniqueTags: 1 } },
  ]);
  const uniqueTags = tags[0]?.uniqueTags || [];
  return (
    uniqueTags
      .sort((a: string, b: string) => a.localeCompare(b))
      .map((x: string) =>
        x
          .split('-')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      ) as string[]
  );
}
