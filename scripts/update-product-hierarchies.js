/**
 * Data Migration Script for Product Category Hierarchies
 * 
 * This script updates all existing products to ensure their categoryHierarchy
 * field is correctly populated based on their assigned category.
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Connect to the database
const connectToDatabase = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

// Define minimal schemas for the migration
const categorySchema = new mongoose.Schema({
  name: String,
  slug: String,
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  depth: Number,
  path: [mongoose.Schema.Types.ObjectId],
});

const productSchema = new mongoose.Schema({
  name: String,
  slug: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  mainCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  subCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  grandchildCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  categoryHierarchy: { type: [mongoose.Schema.Types.ObjectId], ref: 'Category', default: [] },
});

// Create models
const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// Main migration function
const migrateProductCategoryHierarchies = async () => {
  console.log('Starting product category hierarchy migration...');
  
  try {
    // Get all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products to process`);
    
    let updatedCount = 0;
    let errorCount = 0;
    
    // Process each product
    for (const product of products) {
      try {
        if (!product.category) {
          console.warn(`Product ${product._id} (${product.name}) has no category assigned, skipping`);
          continue;
        }
        
        // Fetch the category for this product
        const category = await Category.findById(product.category);
        
        if (!category) {
          console.warn(`Category ${product.category} not found for product ${product._id} (${product.name}), skipping`);
          continue;
        }
        
        // Calculate the correct categoryHierarchy
        const categoryHierarchy = [...category.path, category._id];
        
        // Optional: Update main/sub/grandchild fields based on depth
        // This is optional as per the plan, but implementing for completeness
        const updateFields = {
          categoryHierarchy,
        };
        
        // Set mainCategory if available in path
        if (category.path.length > 0) {
          updateFields.mainCategory = category.path[0];
        }
        
        // Set subCategory if available in path
        if (category.path.length > 1) {
          updateFields.subCategory = category.path[1];
        }
        
        // Set grandchildCategory if available in path
        if (category.path.length > 2) {
          updateFields.grandchildCategory = category.path[2];
        }
        
        // Update the product
        await Product.updateOne({ _id: product._id }, { $set: updateFields });
        updatedCount++;
        
        // Log progress every 10 products
        if (updatedCount % 10 === 0) {
          console.log(`Processed ${updatedCount} products so far`);
        }
      } catch (error) {
        console.error(`Error processing product ${product._id} (${product.name}):`, error);
        errorCount++;
      }
    }
    
    console.log('Migration completed:');
    console.log(`- Total products processed: ${products.length}`);
    console.log(`- Successfully updated: ${updatedCount}`);
    console.log(`- Errors encountered: ${errorCount}`);
  } catch (error) {
    console.error('Migration failed:', error);
  }
};

// Run the migration
const runMigration = async () => {
  try {
    await connectToDatabase();
    await migrateProductCategoryHierarchies();
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

runMigration();