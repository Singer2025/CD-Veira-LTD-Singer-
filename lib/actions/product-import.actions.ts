'use server'

import { connectToDatabase as connectToDB } from '@/lib/db'
import mongoose, { Types } from 'mongoose'
import Product from '@/lib/db/models/product.model'
import Category from '@/lib/db/models/category.model'
import Brand from '@/lib/db/models/brand.model'
import { revalidatePath } from 'next/cache'
import { formatError } from '../utils'
import { IProductInput } from '@/types'

// Define interfaces for Mongoose documents (same as in product.actions.ts)
interface CategoryDoc extends mongoose.Document {
  _id: Types.ObjectId
  name: string
  slug: string
  parent?: Types.ObjectId
  bannerImage?: string
  path: Types.ObjectId[]
}

interface BrandDoc extends mongoose.Document {
  _id: Types.ObjectId
  name: string
  slug: string
  logo?: string
}

// Helper function to validate and convert category references (same as in product.actions.ts)
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

// Helper function to validate and convert brand references (same as in product.actions.ts)
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

// Define the response type for bulk import
type BulkImportResult = {
  success: boolean
  message: string
  totalProcessed: number
  successCount: number
  failedCount: number
  defaultsGeneratedCount?: number
  duplicatesCount?: number
  errors?: Array<{ row: number; error: string }>
}

// Define the expected structure of a product row in the import file
type ProductImportRow = {
  // All fields now optional except for at least one identifier
  name?: string
  slug?: string
  category?: string
  brand?: string
  description?: string
  listPrice?: number | string
  price?: number | string
  countInStock?: number | string
  images?: string | string[]
  tags?: string | string[]
  isPublished?: boolean | string
  sku?: string
  modelNumber?: string
  // Optional structured fields - allow string type for parsing flexibility
  dimensions?: string
  weight?: string
  material?: string
  finish?: string
  energyRating?: string
  energyConsumption?: string
  capacity?: string
  warrantyDetails?: string
  installationRequired?: boolean | string
  specifications?: string
  [key: string]: any // Allow additional fields for flexibility // Consider replacing 'any' with a more specific type if possible
}

/**
 * Checks if a product already exists in the database using multiple detection methods
 * @param row The product import row to check
 * @returns Object containing duplicate status and match information
 */
async function checkForDuplicates(row: ProductImportRow): Promise<{ 
  isDuplicate: boolean;
  matchType: string;
  existingProduct: any; // Consider replacing 'any' with a more specific type if possible
}> {
  // Default return value
  const notDuplicate = {
    isDuplicate: false,
    matchType: '',
    existingProduct: null
  };
  
  // If we don't have any identifiers, we can't check for duplicates
  if (!row.slug && !row.sku && !row.name && !row.modelNumber) {
    return notDuplicate;
  }
  
  // Connect to the database
  await connectToDB();
  
  // Check by slug (most specific)
  if (row.slug) {
    const existingBySlug = await Product.findOne({ slug: row.slug });
    if (existingBySlug) {
      return {
        isDuplicate: true,
        matchType: 'slug',
        existingProduct: existingBySlug
      };
    }
  }
  
  // Check by SKU (also very specific)
  if (row.sku) {
    const existingBySku = await Product.findOne({ sku: row.sku });
    if (existingBySku) {
      return {
        isDuplicate: true,
        matchType: 'SKU',
        existingProduct: existingBySku
      };
    }
  }
  
  // Check by model number
  if (row.modelNumber) {
    const existingByModel = await Product.findOne({ modelNumber: row.modelNumber });
    if (existingByModel) {
      return {
        isDuplicate: true,
        matchType: 'model number',
        existingProduct: existingByModel
      };
    }
  }
  
  // Check by name + brand combination
  if (row.name && row.brand) {
    // First get the brand ID if it's a string
    let brandId = row.brand;
    if (typeof row.brand === 'string' && !row.brand.match(/^[0-9a-fA-F]{24}$/)) {
      const brand = await Brand.findOne({ name: { $regex: new RegExp(`^${row.brand}$`, 'i') } });
      if (brand) {
        brandId = brand._id;
      }
    }
    
    const existingByNameBrand = await Product.findOne({
      name: row.name,
      brand: brandId
    });
    
    if (existingByNameBrand) {
      return {
        isDuplicate: true,
        matchType: 'name + brand',
        existingProduct: existingByNameBrand
      };
    }
  }
  
  return notDuplicate;
}

/**
 * Validates that the product row has at least one identifier field
 * @param row The product import row to validate
 * @returns Boolean indicating if minimal requirements are met
 */
function validateMinimalRequirements(row: ProductImportRow): boolean {
  // At least one identifier field must be present
  return !!(row.name || row.slug || row.sku || row.modelNumber);
}

/**
 * Generates intelligent defaults for missing fields in a product import row
 * @param row The original product import row
 * @returns Enhanced row with defaults for missing fields
 */
async function generateIntelligentDefaults(row: ProductImportRow): Promise<ProductImportRow> {
  // Create a copy of the row to avoid modifying the original
  const enhanced = { ...row };
  
  // Generate name if missing but we have other identifiers
  if (!enhanced.name) {
    if (enhanced.modelNumber) {
      enhanced.name = `Product ${enhanced.modelNumber}`;
    } else if (enhanced.sku) {
      enhanced.name = `Product ${enhanced.sku}`;
    } else {
      enhanced.name = `Imported Product ${Date.now()}`;
    }
  }
  
  // Generate slug if missing
  if (!enhanced.slug) {
    const baseSlug = (enhanced.name || '').toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    enhanced.slug = `${baseSlug || 'product'}-${Date.now()}`;
  }
  
  // Set default description
  if (!enhanced.description) {
    enhanced.description = `Imported product: ${enhanced.name || enhanced.slug || 'No name provided'}`;
  }
  
  // Set default category and brand
  if (!enhanced.category) {
    enhanced.category = 'uncategorized';
  }
  
  if (!enhanced.brand) {
    enhanced.brand = 'unknown';
  }
  
  // Set default prices
  if (!enhanced.listPrice) {
    enhanced.listPrice = 0;
  }
  
  if (enhanced.countInStock === undefined) {
    enhanced.countInStock = 0;
  }
  
  // Set default images if missing
  if (!enhanced.images) {
    enhanced.images = ['https://placehold.co/600x400?text=Product+Image'];
  }
  
  return enhanced;
}

/**
 * Process a single product from the import data
 * @param row The product import row to process
 * @returns Result of processing the row
 */
async function processProductRow(row: ProductImportRow): Promise<{ success: boolean; message?: string; product?: any; defaultsGenerated?: string[]; duplicateInfo?: { matchType: string; existingId: string } }> {
  try {
    // Track which fields were auto-generated
    const defaultsGenerated: string[] = [];
    
    // Check for duplicates before processing
    const duplicateCheck = await checkForDuplicates(row);
    if (duplicateCheck.isDuplicate) {
      return { 
        success: false, 
        message: `Duplicate product found (matched by ${duplicateCheck.matchType})`,
        duplicateInfo: {
          matchType: duplicateCheck.matchType,
          existingId: duplicateCheck.existingProduct._id.toString()
        }
      };
    }
    
    // Validate minimal requirements
    if (!validateMinimalRequirements(row)) {
      return {
        success: false,
        message: 'At least one identifier required (name, slug, sku, or modelNumber)'
      };
    }
    
    // Generate intelligent defaults for missing fields
    const enhancedRow = await generateIntelligentDefaults(row); // Await the async function
    
    // Track which fields were auto-generated
    if (!row.name && enhancedRow.name) defaultsGenerated.push('name');
    if (!row.slug && enhancedRow.slug) defaultsGenerated.push('slug');
    if (!row.description && enhancedRow.description) defaultsGenerated.push('description');
    if (!row.category && enhancedRow.category) defaultsGenerated.push('category');
    if (!row.brand && enhancedRow.brand) defaultsGenerated.push('brand');
    if (!row.listPrice && enhancedRow.listPrice) defaultsGenerated.push('listPrice');
    if (row.countInStock === undefined && enhancedRow.countInStock !== undefined) defaultsGenerated.push('countInStock');


    // Process images (convert string to array if needed)
    const images = typeof enhancedRow.images === 'string' 
      ? enhancedRow.images.split(',').map((img: string) => img.trim()) // Explicitly type img
      : enhancedRow.images || []

    // Process tags (convert string to array if needed)
    const tags = typeof enhancedRow.tags === 'string'
      ? enhancedRow.tags.split(',').map((tag: string) => tag.trim()) // Explicitly type tag
      : enhancedRow.tags || []

    // Process specifications (parse JSON string or comma-separated key:value pairs)
    let specifications: Array<{ title: string; value: string }> = [];
    if (typeof enhancedRow.specifications === 'string' && enhancedRow.specifications.length > 0) {
      try {
        // Try parsing as JSON first
        const parsedSpecs = JSON.parse(enhancedRow.specifications);
        if (Array.isArray(parsedSpecs)) {
           specifications = parsedSpecs.map(spec => ({ // spec is implicitly any here, could add type check if needed
             title: spec.title || 'Specification',
             value: spec.value || 'Not specified'
           }));
        } else {
           // If not an array after JSON parse, treat as single spec or handle as error
           console.warn('Specifications JSON did not result in an array:', parsedSpecs);
           specifications = [{ title: 'Specifications', value: enhancedRow.specifications }];
        }
      } catch {
        // If not valid JSON, try to parse as comma-separated key:value pairs
        specifications = enhancedRow.specifications.split(',').map((spec: string) => { // Explicitly type spec
          const parts = spec.split(':').map((s: string) => s.trim()) // Explicitly type s
          const title = parts[0] || ''
          const value = parts.length > 1 ? parts[1] : 'Not specified'
          return { title, value }
        })
      }
    }
    

    // Convert string boolean values
    const isPublished = typeof enhancedRow.isPublished === 'string'
      ? enhancedRow.isPublished.toLowerCase() === 'true'
      : !!enhancedRow.isPublished; // Ensure boolean type

    const installationRequired = typeof enhancedRow.installationRequired === 'string'
      ? enhancedRow.installationRequired.toLowerCase() === 'true'
      : !!enhancedRow.installationRequired; // Ensure boolean type


    // Convert numeric values with better error handling
    let listPrice = 0; // Default to 0
    if (typeof enhancedRow.listPrice === 'string') {
      const cleanedPrice = enhancedRow.listPrice.replace(/[$£€,]/g, '').trim();
      const parsedPrice = parseFloat(cleanedPrice);
      if (!isNaN(parsedPrice)) {
        listPrice = parsedPrice;
      } else if (!defaultsGenerated.includes('listPrice')) {
         // Only add to defaultsGenerated if it wasn't already defaulted
         defaultsGenerated.push('listPrice');
      }
    } else if (typeof enhancedRow.listPrice === 'number') {
      listPrice = enhancedRow.listPrice;
    }


    // Handle price (optional)
    let price: number | undefined = undefined; // Explicitly type as number or undefined
    if (enhancedRow.price) {
      if (typeof enhancedRow.price === 'string') {
        const cleanedPrice = enhancedRow.price.replace(/[$£€,]/g, '').trim();
        const parsedPrice = parseFloat(cleanedPrice);
        if (!isNaN(parsedPrice)) {
          price = parsedPrice;
        }
      } else if (typeof enhancedRow.price === 'number') {
        price = enhancedRow.price;
      }
    }


    // Handle countInStock
    let countInStock = 0; // Default to 0
    if (typeof enhancedRow.countInStock === 'string') {
      const parsedCount = parseInt(enhancedRow.countInStock.trim(), 10);
      if (!isNaN(parsedCount)) {
        countInStock = parsedCount;
      } else if (!defaultsGenerated.includes('countInStock')) {
         // Only add to defaultsGenerated if it wasn't already defaulted
         defaultsGenerated.push('countInStock');
      }
    } else if (typeof enhancedRow.countInStock === 'number') {
      countInStock = enhancedRow.countInStock;
    }


    // Process dimensions if provided
    let dimensions: IProductInput['dimensions'] = undefined;
    if (typeof enhancedRow.dimensions === 'string' && enhancedRow.dimensions.length > 0) {
        try {
            // Try parsing as JSON object first
            const parsedDimensions = JSON.parse(enhancedRow.dimensions);
            if (typeof parsedDimensions === 'object' && parsedDimensions !== null &&
                typeof parsedDimensions.height !== 'undefined' && 
                typeof parsedDimensions.width !== 'undefined' && 
                typeof parsedDimensions.depth !== 'undefined' && typeof parsedDimensions.unit === 'string') {
                dimensions = {
                    height: parseFloat(parsedDimensions.height),
                    width: parseFloat(parsedDimensions.width),
                    depth: parseFloat(parsedDimensions.depth),
                    unit: parsedDimensions.unit
                };
            } else {
                 // If not a valid JSON object, try parsing the string format
                 console.warn('Dimensions string provided, attempting to parse:', enhancedRow.dimensions);
                 // Improved parsing for format like "28.8 inch W x 18.9 inch H x 7.1 inch D (with base)"
                 const dimensionStr = enhancedRow.dimensions.toLowerCase();
                 
                 // Extract width, height, and depth using regex
                 // Look for patterns like "28.8 inch W" or "W 28.8 inch" or "28.8 W"
                 const widthMatch = dimensionStr.match(/([\d.]+)\s*(?:inch|in|cm|mm)?\s*w|w\s*([\d.]+)\s*(?:inch|in|cm|mm)?/i);
                 const heightMatch = dimensionStr.match(/([\d.]+)\s*(?:inch|in|cm|mm)?\s*h|h\s*([\d.]+)\s*(?:inch|in|cm|mm)?/i);
                 const depthMatch = dimensionStr.match(/([\d.]+)\s*(?:inch|in|cm|mm)?\s*d|d\s*([\d.]+)\s*(?:inch|in|cm|mm)?/i);
                 
                 // Extract unit
                 const unitMatch = dimensionStr.match(/inch|in|cm|mm/i);
                 const unit = unitMatch ? unitMatch[0] : 'inch'; // Default to inch if not specified
                 
                 if (widthMatch && heightMatch && depthMatch) {
                     // Get the first non-undefined capture group
                     const width = parseFloat(widthMatch[1] || widthMatch[2]);
                     const height = parseFloat(heightMatch[1] || heightMatch[2]);
                     const depth = parseFloat(depthMatch[1] || depthMatch[2]);
                     
                     if (!isNaN(width) && !isNaN(height) && !isNaN(depth)) {
                         dimensions = { width, height, depth, unit };
                         console.log('Successfully parsed dimensions:', dimensions);
                     } else {
                         console.warn('Failed to parse dimensions values:', enhancedRow.dimensions);
                     }
                 } else {
                     // Fallback to the original x-separated format parsing
                     const parts = enhancedRow.dimensions.split('x').map(p => p.trim());
                     if (parts.length >= 3) {
                         const width = parseFloat(parts[0]);
                         const height = parseFloat(parts[1]);
                         const depth = parseFloat(parts[2]);
                         const unit = parts.length > 3 ? parts[3].split(' ')[0].trim() : 'unit'; // Basic unit extraction
                         if (!isNaN(width) && !isNaN(height) && !isNaN(depth)) {
                             dimensions = { width, height, depth, unit };
                         } else {
                             console.warn('Failed to parse dimensions string:', enhancedRow.dimensions);
                         }
                     } else {
                         console.warn('Dimensions string format not recognized:', enhancedRow.dimensions);
                     }
                 }
            }
        } catch (e) {
            // If JSON parsing fails, try parsing the string format
            console.warn('Dimensions JSON parsing failed, attempting to parse string:', enhancedRow.dimensions, e);
            // Improved parsing for format like "28.8 inch W x 18.9 inch H x 7.1 inch D (with base)"
            const dimensionStr = enhancedRow.dimensions.toLowerCase();
            
            // Extract width, height, and depth using regex
            const widthMatch = dimensionStr.match(/([\d.]+)\s*(?:inch|in|cm|mm)?\s*w|w\s*([\d.]+)\s*(?:inch|in|cm|mm)?/i);
            const heightMatch = dimensionStr.match(/([\d.]+)\s*(?:inch|in|cm|mm)?\s*h|h\s*([\d.]+)\s*(?:inch|in|cm|mm)?/i);
            const depthMatch = dimensionStr.match(/([\d.]+)\s*(?:inch|in|cm|mm)?\s*d|d\s*([\d.]+)\s*(?:inch|in|cm|mm)?/i);
            
            // Extract unit
            const unitMatch = dimensionStr.match(/inch|in|cm|mm/i);
            const unit = unitMatch ? unitMatch[0] : 'inch'; // Default to inch if not specified
            
            if (widthMatch && heightMatch && depthMatch) {
                // Get the first non-undefined capture group
                const width = parseFloat(widthMatch[1] || widthMatch[2]);
                const height = parseFloat(heightMatch[1] || heightMatch[2]);
                const depth = parseFloat(depthMatch[1] || depthMatch[2]);
                
                if (!isNaN(width) && !isNaN(height) && !isNaN(depth)) {
                    dimensions = { width, height, depth, unit };
                } else {
                    console.warn('Failed to parse dimensions values:', enhancedRow.dimensions);
                }
            } else {
                // Fallback to the original x-separated format parsing
                const parts = enhancedRow.dimensions.split('x').map(p => p.trim());
                if (parts.length >= 3) {
                    const width = parseFloat(parts[0]);
                    const height = parseFloat(parts[1]);
                    const depth = parseFloat(parts[2]);
                    const unit = parts.length > 3 ? parts[3].split(' ')[0].trim() : 'unit'; // Basic unit extraction
                    if (!isNaN(width) && !isNaN(height) && !isNaN(depth)) {
                        dimensions = { width, height, depth, unit };
                    } else {
                        console.warn('Failed to parse dimensions string:', enhancedRow.dimensions);
                    }
                } else {
                    console.warn('Dimensions string format not recognized:', enhancedRow.dimensions);
                }
            }
        }


    // Process weight if provided (assuming string format like "value unit" or JSON object)
    let weight: IProductInput['weight'] = undefined;
    if (typeof enhancedRow.weight === 'string' && enhancedRow.weight.length > 0) {
        try {
            // Try parsing as JSON object first
            const parsedWeight = JSON.parse(enhancedRow.weight);
            if (typeof parsedWeight === 'object' && parsedWeight !== null &&
                typeof parsedWeight.value !== 'undefined' && typeof parsedWeight.unit === 'string') {
                weight = {
                    value: parseFloat(parsedWeight.value),
                    unit: parsedWeight.unit
                };
            } else {
                // If not a valid JSON object, try parsing the string format
                console.warn('Weight string provided, attempting to parse:', enhancedRow.weight);
                // Improved parsing for formats like "15 lbs" or "15.5 kg"
                const weightStr = enhancedRow.weight.toLowerCase().trim();
                
                // Extract value and unit using regex
                const weightMatch = weightStr.match(/([\d.]+)\s*([a-z]+)/i);
                
                if (weightMatch) {
                    const value = parseFloat(weightMatch[1]);
                    let unit = weightMatch[2];
                    
                    // Normalize unit names
                    if (unit === 'lbs' || unit === 'lb' || unit === 'pound' || unit === 'pounds') {
                        unit = 'lb';
                    } else if (unit === 'kgs' || unit === 'kilograms' || unit === 'kilogram') {
                        unit = 'kg';
                    } else if (unit === 'g' || unit === 'gram' || unit === 'grams') {
                        unit = 'g';
                    }
                    
                    if (!isNaN(value)) {
                        weight = { value, unit };
                    } else {
                        console.warn('Failed to parse weight value:', enhancedRow.weight);
                    }
                } else {
                    // Fallback to the original space-separated format parsing
                    const parts = enhancedRow.weight.split(' ').map(p => p.trim());
                    const value = parseFloat(parts[0]);
                    if (!isNaN(value) && parts.length > 1) {
                        weight = { value: value, unit: parts[1] };
                    } else {
                        console.warn('Failed to parse weight string:', enhancedRow.weight);
                    }
                }
            }
        } catch (e) {
            // If JSON parsing fails, try parsing the string format
            console.warn('Weight JSON parsing failed, attempting to parse string:', enhancedRow.weight, e);
            // Improved parsing for formats like "15 lbs" or "15.5 kg"
            const weightStr = enhancedRow.weight.toLowerCase().trim();
            
            // Extract value and unit using regex
            const weightMatch = weightStr.match(/([\d.]+)\s*([a-z]+)/i);
            
            if (weightMatch) {
                const value = parseFloat(weightMatch[1]);
                let unit = weightMatch[2];
                
                // Normalize unit names
                if (unit === 'lbs' || unit === 'lb' || unit === 'pound' || unit === 'pounds') {
                    unit = 'lb';
                } else if (unit === 'kgs' || unit === 'kilograms' || unit === 'kilogram') {
                    unit = 'kg';
                } else if (unit === 'g' || unit === 'gram' || unit === 'grams') {
                    unit = 'g';
                }
                
                if (!isNaN(value)) {
                    weight = { value, unit };
                } else {
                    console.warn('Failed to parse weight value:', enhancedRow.weight);
                }
            } else {
                // Fallback to the original space-separated format parsing
                const parts = enhancedRow.weight.split(' ').map(p => p.trim());
                const value = parseFloat(parts[0]);
                if (!isNaN(value) && parts.length > 1) {
                    weight = { value: value, unit: parts[1] };
                } else {
                    console.warn('Failed to parse weight string:', enhancedRow.weight);
                }
            }
        }
    }


    // Prepare product data for MongoDB insertion
    const productToCreate: any = { // Use any for now to avoid complex type issues during construction
      name: enhancedRow.name || 'Unnamed Product', // Provide default string
      slug: enhancedRow.slug || `product-${Date.now()}`, // Provide default string
      description: enhancedRow.description || 'No description provided', // Provide default string
      listPrice: listPrice,
      price: price,
      countInStock: countInStock,
      images: images,
      tags: tags,
      isPublished: isPublished,
      sku: enhancedRow.sku,
      dimensions: dimensions, // Use processed dimensions (object or undefined)
      weight: weight, // Use processed weight (object or undefined)
      material: enhancedRow.material,
      finish: enhancedRow.finish,
      energyRating: enhancedRow.energyRating,
      energyConsumption: enhancedRow.energyConsumption,
      capacity: enhancedRow.capacity,
      warrantyDetails: enhancedRow.warrantyDetails,
      installationRequired: installationRequired,
      modelNumber: enhancedRow.modelNumber,
      specifications: specifications, // Use processed specifications (array)
      // Initialize customer-related fields with default values
      avgRating: 0,
      numReviews: 0,
      numSales: 0,
      reviews: [],
      ratingDistribution: [{ rating: 1, count: 0 }, { rating: 2, count: 0 }, { rating: 3, count: 0 }, { rating: 4, count: 0 }, { rating: 5, count: 0 }],
      variants: [],
    };

    // Convert category reference (string) to ObjectId
    if (enhancedRow.category) {
       productToCreate.category = await validateAndConvertCategoryReference(enhancedRow.category);
    } else {
       // Handle case where category is missing after defaults - maybe assign a default category ID?
       // For now, let validation handle "undefined" if validateAndConvertCategoryReference can.
       // Based on its code, it expects a string, so passing undefined will cause an error.
       // Let's throw an error if category is missing after defaults.
       throw new Error('Category is required and could not be determined.');
    }


    // Convert brand reference (string) to ObjectId
    if (enhancedRow.brand) {
      productToCreate.brand = await validateAndConvertBrandReference(enhancedRow.brand);
    } else {
       // Handle case where brand is missing after defaults - maybe assign a default brand ID?
       // Let's throw an error if brand is missing after defaults.
       throw new Error('Brand is required and could not be determined.');
    }


    // Get category path for hierarchy if needed
    if (productToCreate.category) {
      const categoryDoc = await Category.findById<CategoryDoc>(productToCreate.category).select('path _id');
      if (!categoryDoc) {
        // This case should ideally not happen if validateAndConvertCategoryReference succeeds,
        // but adding a check for robustness.
        throw new Error(`Category with ID ${productToCreate.category} not found after validation.`);
      }
      // Set the categoryHierarchy field to include the full path plus the current category
      // Ensure categoryHierarchy exists on the product model or is handled appropriately
      // Assuming productToCreate can have categoryHierarchy based on context
      (productToCreate as any).categoryHierarchy = [...(categoryDoc.path || []), categoryDoc._id]; // Added cast for now
    }

    // Check for existing slug (case-sensitive)
    const existingProductWithSlug = await Product.findOne({ slug: productToCreate.slug });
    if (existingProductWithSlug) {
      return {
        success: false,
        message: `Product with slug "${productToCreate.slug}" already exists`
      };
    }

    return { success: true, product: productToCreate };
}
  } catch (error) {
    return {
      success: false,
      message: formatError(error)
    };
  }
}

/**
 * Import products in bulk from parsed data
 * @param products Array of product data objects
 * @returns Result of the bulk import operation
 */
export async function bulkImportProducts(products: ProductImportRow[]): Promise<BulkImportResult> {
  try {
    await connectToDB()

    // Validate input
    if (!Array.isArray(products) || products.length === 0) {
      return {
        success: false,
        message: 'No valid products data provided',
        totalProcessed: 0,
        successCount: 0,
        failedCount: 0
      }
    }

    const results = {
      totalProcessed: products.length,
      successCount: 0,
      failedCount: 0,
      defaultsGeneratedCount: 0,
      duplicatesCount: 0,
      errors: [] as Array<{ row: number; error: string }>
    }

    // Process products in batches to avoid overwhelming the database
    const BATCH_SIZE = 50
    const batches = []

    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      batches.push(products.slice(i, i + BATCH_SIZE))
    }

    // Process each batch
    for (const [batchIndex, batch] of batches.entries()) {
      const batchOffset = batchIndex * BATCH_SIZE
      const batchResults = await Promise.all(
        batch.map((product, index) => processProductRow(product)) // Removed rowIndex
      )

      // Collect valid products for insertion
      const validProducts = []
      for (let i = 0; i < batchResults.length; i++) {
        const result = batchResults[i]
        const rowIndex = batchOffset + i

        if (result.success && result.product) {
          validProducts.push(result.product)
          results.successCount++
          
          // Track products with auto-generated default values
          if (result.defaultsGenerated && result.defaultsGenerated.length > 0) {
            results.defaultsGeneratedCount++
          }
        } else {
          results.failedCount++
          
          // Track duplicate products
          if (result.duplicateInfo) {
            results.duplicatesCount++
          }
          
          // Format error message to be more user-friendly
          let errorMessage = result.message || 'Unknown error'
          
          // Improve specific error messages
          if (errorMessage.includes('Invalid MongoDB ID')) {
            errorMessage = errorMessage.replace('Invalid MongoDB ID', 'Category or brand not found')
          }
          if (errorMessage.includes('Product must have at least one image')) {
            errorMessage = 'No images provided (images are optional but recommended)'
          }
          if (errorMessage.includes('listPrice')) {
            errorMessage = 'List price must be a valid number'
          }
          if (errorMessage.includes('specifications') && errorMessage.includes('value: Required')) {
            errorMessage = 'Specification values are required'
          }
          
          results.errors.push({
            row: rowIndex + 1, // +1 for human-readable row number (1-indexed)
            error: errorMessage
          })
        }
      }

      // Insert valid products in this batch
      if (validProducts.length > 0) {
        await Product.insertMany(validProducts, { ordered: false }).catch(error => {
          // Handle bulk insertion errors
          if (error.writeErrors) {
            for (const writeError of error.writeErrors) {
              const errorIndex = writeError.index
              const rowIndex = batchOffset + errorIndex
              results.failedCount++
              results.successCount--
              results.errors.push({
                row: rowIndex + 1,
                error: writeError.errmsg || 'Database insertion error'
              })
            }
          } else {
            // Re-throw other errors
            throw error
          }
        })
      }
    }

    // Revalidate products page
    revalidatePath('/admin/products')

    // Prepare enhanced stats for the result
    const stats = {
      totalProcessed: results.totalProcessed,
      successCount: results.successCount,
      failedCount: results.failedCount,
      defaultsGeneratedCount: results.defaultsGeneratedCount,
      duplicatesCount: results.duplicatesCount,
      errors: results.errors
    }
    
    return {
      success: results.successCount > 0,
      message: `Processed ${results.totalProcessed} products: ${results.successCount} imported successfully, ${results.failedCount} failed, ${results.defaultsGeneratedCount} with auto-generated values, ${results.duplicatesCount} duplicates detected`,
      ...stats
    }
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
      totalProcessed: 0,
      successCount: 0,
      failedCount: 0
    }
  }
}

/**
 * Parses CSV content into an array of product data objects
 * @param csvContent The content of the CSV file as a string
 * @returns Array of product data objects
 */
export async function parseCSVToProducts(csvContent: string): Promise<ProductImportRow[]> {
  // Normalize line endings
  const normalizedContent = csvContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  
  // Pre-process to handle line breaks within quoted fields
  let processedContent = ''
  let inQuotes = false
  
  for (let i = 0; i < normalizedContent.length; i++) {
    const char = normalizedContent[i]
    
    if (char === '"') {
      // Toggle quote state (ignoring escaped quotes for this preprocessing)
      inQuotes = !inQuotes
      processedContent += char
    } else if ((char === '\n') && inQuotes) {
      // Replace line breaks within quotes with a space or other placeholder
      processedContent += ' '
    } else {
      processedContent += char
    }
  }
  
  // Split by lines and filter out empty lines
  const lines = processedContent.split('\n').filter(line => line.trim().length > 0)
  
  if (lines.length < 2) {
    throw new Error('CSV file must contain headers and at least one product')
  }

  // Extract headers (first line) using the same parsing logic as data rows
  const headers = await parseCSVLine(lines[0])
  
  // Parse each line into a product object
  const products: ProductImportRow[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    const values = await parseCSVLine(line)
    
    // Handle case where data row has more or fewer columns than headers
    if (values.length !== headers.length) {
      // If we have more values than headers, we can trim the extra values and continue
      if (values.length > headers.length) {
        console.warn(`Line ${i+1} has ${values.length} values, but headers has ${headers.length} columns. Trimming extra values.`);
        console.warn(`Extra values: ${values.slice(headers.length).map(v => `"${v}"`).join(', ')}`);
        
        // Trim the values array to match headers length
        values.splice(headers.length);
      } else {
        // If we have fewer values than headers, provide detailed error message
        let errorMsg = `Line ${i+1} has ${values.length} values, but headers has ${headers.length} columns`
        
        // Add information about the actual values to help debugging
        if (values.length > 0) {
          errorMsg += `\nFirst few values: ${values.slice(0, Math.min(3, values.length)).map(v => `"${v}"`).join(', ')}`
        }
        
        // Add headers information for comparison
        errorMsg += `\nHeaders: ${headers.join(', ')}`
        
        throw new Error(errorMsg)
      }
    }
    
    const product: ProductImportRow = {}
    
    // Map each value to its corresponding header
    headers.forEach((header, index) => {
      const value = values[index] // Changed let to const
      
      // Handle special fields - assign raw string value
      if (header === 'images' || header === 'tags' || header === 'specifications' || header === 'dimensions' || header === 'weight') {
         product[header] = value;
      } else {
        // For other fields, store as is
        product[header] = value
      }
    })
    
    products.push(product)
  }
  
  return products
}

/**
 * Parses a single line of CSV content, handling quoted fields and escaped quotes.
 * @param line The CSV line to parse.
 * @returns An array of string values from the line.
 */
async function parseCSVLine(line: string): Promise<string[]> {
  const values: string[] = []
  let currentValue = ''
  let inQuotes = false
  let escapeNext = false
  let quoteCount = 0
  
  // First, check for unbalanced quotes which could cause parsing issues
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') {
      // Don't count escaped quotes ("")
      if (i + 1 < line.length && line[i + 1] === '"') {
        i++; // Skip the next quote
      } else {
        quoteCount++;
      }
    }
  }
  
  // If we have an odd number of quotes, there's an unbalanced quote
  if (quoteCount % 2 !== 0) {
    // Try to fix by adding a closing quote at the end
    line += '"';
    console.warn('Fixed unbalanced quotes in CSV line: ' + line.substring(0, 50) + '...');
  }
  
  // Now parse the line
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    // Handle escaped quotes
    if (escapeNext) {
      currentValue += char
      escapeNext = false
      continue
    }
    
    if (char === '"') {
      // Check if this is an escaped quote ("")
      if (i + 1 < line.length && line[i + 1] === '"') {
        escapeNext = true
      } else {
        // Toggle quote state
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      // End of value
      values.push(currentValue.trim())
      currentValue = ''
    } else {
      // Add character to current value
      currentValue += char
    }
  }
  
  // Add the last value
  values.push(currentValue.trim())
  
  // Remove surrounding quotes from values
  return values.map(value => {
    if (value.startsWith('"') && value.endsWith('"')) {
      return value.substring(1, value.length - 1).replace(/""/g, '"')
    }
    return value
  })
}

/**
 * Process a file upload for bulk product import
 * @param formData FormData containing the file
 * @returns Result of the import operation
 */
export async function processProductImportFile(formData: FormData): Promise<BulkImportResult> {
  try {
    const file = formData.get('file') as File
    
    if (!file) {
      return {
        success: false,
        message: 'No file provided',
        totalProcessed: 0,
        successCount: 0,
        failedCount: 0
      }
    }
    
    // Check file type
    const fileType = file.name.split('.').pop()?.toLowerCase()
    
    if (fileType !== 'csv') {
      return {
        success: false,
        message: 'Only CSV files are supported at this time',
        totalProcessed: 0,
        successCount: 0,
        failedCount: 0
      }
    }
    
    // Read file content
    const fileContent = await file.text()
    
    // Parse CSV to products
    const products = await parseCSVToProducts(fileContent)
    console.log('processProductImportFile passing products to bulkImportProducts:', products); // Added log
    
    // Import products
    return await bulkImportProducts(products) // Pass the original products array
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
      totalProcessed: 0,
      successCount: 0,
      failedCount: 0
    }
  }
}