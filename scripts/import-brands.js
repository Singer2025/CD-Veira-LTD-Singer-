/**
 * Brand Import Script
 * 
 * This script helps import a list of brands into the database.
 * It creates brand entries with proper slugs and default values.
 * 
 * Usage: 
 * 1. Make sure your MongoDB connection is configured in .env.local
 * 2. Run this script with: node scripts/import-brands.js
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Connect to MongoDB
async function connectToDatabase() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env.local');
    }
    
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

// Define Brand Schema (simplified version of the one in your app)
const brandSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
  logo: { type: String, required: true },
  bannerImage: { type: String },
  description: { type: String, trim: true },
  isFeatured: { type: Boolean, default: false }
}, { timestamps: true });

const Brand = mongoose.models.Brand || mongoose.model('Brand', brandSchema);

// Function to convert brand name to slug
function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// List of brands to import
const brandNames = [
  'Daiichi', 'Tron', 'Magnum', 'Lexman', 'Concord', 'Mueller', 'General Electric', 
  'Samsung', 'Hisense', 'TCL', 'Sensui', 'Diamond', 'LG', 'Westinghouse', 
  'Hayare', 'Kobe', 'RCA', 'Supersonic', 'Barken', 'Argon', 'Nippon America', 
  'Burosonic', 'Embar Distributions LLC', 'Speed Queen', 'Daewoo', 'Singer', 
  'Furniture Mart', 'Vision Exporters', 'Woodhouse', 'MP', 'Woodville', 'UMR', 
  'AC', 'Oscar', 'MP5', 'China', 'ProGarden', 'Bell Furniture', 'Local', 
  'Caroline', 'Advance', 'Foam', 'Linsell', 'Ceretta', 'Restonic', 'Russell Hobbs', 
  'Ariete', 'Severin', 'DeLonghi', 'Asta', 'KitchenAid', 'Hot Point', 'Hayden', 
  'Dalingui', 'King Gavan', 'Tower', 'Remington', 'Andrew Collings', 'Studio Z', 
  'JWIN', 'Panasonic', 'Todd', 'Imbrocco', 'International Provisions', 'Tecumseh'
];

// Function to create brand objects from the list
function createBrandObjects() {
  return brandNames.map(name => ({
    name,
    slug: createSlug(name),
    logo: '/images/default-brand-logo.svg', // Default logo path
    isFeatured: false,
    description: `${name} brand products`
  }));
}

// Main function to import brands
async function importBrands() {
  try {
    await connectToDatabase();
    
    const brandObjects = createBrandObjects();
    console.log(`Preparing to import ${brandObjects.length} brands...`);
    
    // Check for existing brands to avoid duplicates
    const existingSlugs = new Set();
    const existingBrands = await Brand.find({}, 'slug');
    existingBrands.forEach(brand => existingSlugs.add(brand.slug));
    
    // Filter out brands that already exist
    const newBrands = brandObjects.filter(brand => !existingSlugs.has(brand.slug));
    
    if (newBrands.length === 0) {
      console.log('All brands already exist in the database. No new brands to import.');
      return;
    }
    
    // Insert the new brands
    const result = await Brand.insertMany(newBrands);
    console.log(`Successfully imported ${result.length} brands.`);
    
    // Log the imported brands
    console.log('\nImported Brands:');
    console.log('===============');
    result.forEach(brand => {
      console.log(`- ${brand.name} (${brand.slug})`);
    });
    
  } catch (error) {
    console.error('Error importing brands:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
}

// Run the import function
importBrands();