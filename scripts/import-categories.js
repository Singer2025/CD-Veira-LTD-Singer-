/**
 * Category Import Script
 * 
 * This script helps import a hierarchical category structure into the database.
 * It maintains parent-child relationships and properly sets up the path and depth fields.
 * 
 * Usage: 
 * 1. Make sure your MongoDB connection is configured in .env.local
 * 2. Run this script with: node scripts/import-categories.js
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

// Define Category Schema (simplified version of the one in your app)
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  depth: { type: Number, default: 0 },
  path: { type: [mongoose.Schema.Types.ObjectId], default: [] },
  image: { type: String, required: true },
  bannerImage: { type: String },
  isFeatured: { type: Boolean, default: false },
  description: { type: String },
  isParent: { type: Boolean, default: false }
});

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

// Hierarchical category data
const categoryData = [
  {
    name: 'Kitchen Appliances & Cookware',
    slug: 'kitchen-appliances-cookware',
    isParent: true,
    image: '/images/default-category.png',
    children: [
      {
        name: 'Refrigeration & Cooling',
        slug: 'refrigeration-cooling',
        image: '/images/default-category.png',
        children: [
          {
            name: 'Refrigerators',
            slug: 'refrigerators',
            image: '/images/default-category.png',
            children: [
              {
                name: 'French Door Refrigerators',
                slug: 'french-door-refrigerators',
                image: '/images/default-category.png'
              },
              {
                name: 'Top Freezer Refrigerators',
                slug: 'top-freezer-refrigerators',
                image: '/images/default-category.png'
              },
              {
                name: 'Bottom Freezer Refrigerators',
                slug: 'bottom-freezer-refrigerators',
                image: '/images/default-category.png'
              }
            ]
          },
          {
            name: 'Freezers',
            slug: 'freezers',
            image: '/images/default-category.png',
            children: [
              {
                name: 'Chest Freezers',
                slug: 'chest-freezers',
                image: '/images/default-category.png'
              },
              {
                name: 'Upright Freezers',
                slug: 'upright-freezers',
                image: '/images/default-category.png'
              }
            ]
          },
          {
            name: 'Bottle Coolers',
            slug: 'bottle-coolers',
            image: '/images/default-category.png'
          }
        ]
      },
      {
        name: 'Cooking Appliances',
        slug: 'cooking-appliances',
        image: '/images/default-category.png',
        children: [
          {
            name: 'Gas Cookers',
            slug: 'gas-cookers',
            image: '/images/default-category.png'
          },
          {
            name: 'Electric Cookers',
            slug: 'electric-cookers',
            image: '/images/default-category.png'
          },
          {
            name: 'Toaster Ovens',
            slug: 'toaster-ovens',
            image: '/images/default-category.png'
          },
          {
            name: 'Microwaves',
            slug: 'microwaves',
            image: '/images/default-category.png'
          },
          {
            name: 'Pressure Cookers',
            slug: 'pressure-cookers',
            image: '/images/default-category.png'
          },
          {
            name: 'Rice Cookers',
            slug: 'rice-cookers',
            image: '/images/default-category.png'
          }
        ]
      },
      {
        name: 'Small Kitchen Appliances',
        slug: 'small-kitchen-appliances',
        image: '/images/default-category.png',
        children: [
          {
            name: 'Toasters',
            slug: 'toasters',
            image: '/images/default-category.png',
            children: [
              {
                name: 'Two-Slice Toasters',
                slug: 'two-slice-toasters',
                image: '/images/default-category.png'
              },
              {
                name: 'Four-Slice Toasters',
                slug: 'four-slice-toasters',
                image: '/images/default-category.png'
              }
            ]
          },
          {
            name: 'Kettles',
            slug: 'kettles',
            image: '/images/default-category.png'
          },
          {
            name: 'Toaster and Kettle Sets',
            slug: 'toaster-kettle-sets',
            image: '/images/default-category.png'
          },
          {
            name: 'Blenders',
            slug: 'blenders',
            image: '/images/default-category.png'
          },
          {
            name: 'Mixers',
            slug: 'mixers',
            image: '/images/default-category.png'
          },
          {
            name: 'Food Processors',
            slug: 'food-processors',
            image: '/images/default-category.png'
          },
          {
            name: 'Coffee Makers',
            slug: 'coffee-makers',
            image: '/images/default-category.png'
          },
          {
            name: 'Food Steamers',
            slug: 'food-steamers',
            image: '/images/default-category.png'
          },
          {
            name: 'Indoor Grills',
            slug: 'indoor-grills',
            image: '/images/default-category.png'
          },
          {
            name: 'Electric/Deep Fryers',
            slug: 'electric-deep-fryers',
            image: '/images/default-category.png'
          },
          {
            name: 'Electric Knives',
            slug: 'electric-knives',
            image: '/images/default-category.png'
          },
          {
            name: 'Air Fryers',
            slug: 'air-fryers',
            image: '/images/default-category.png'
          },
          {
            name: 'Bread Makers',
            slug: 'bread-makers',
            image: '/images/default-category.png'
          },
          {
            name: 'Juicers',
            slug: 'juicers',
            image: '/images/default-category.png'
          },
          {
            name: 'Pot Sets',
            slug: 'pot-sets',
            image: '/images/default-category.png'
          },
          {
            name: 'Can Openers',
            slug: 'can-openers',
            image: '/images/default-category.png'
          },
          {
            name: 'Hot Plates',
            slug: 'hot-plates',
            image: '/images/default-category.png'
          },
          {
            name: 'Food Bag Sealers',
            slug: 'food-bag-sealers',
            image: '/images/default-category.png'
          }
        ]
      }
    ]
  },
  {
    name: 'Laundry Appliances',
    slug: 'laundry-appliances',
    isParent: true,
    image: '/images/default-category.png',
    children: [
      {
        name: 'Washers',
        slug: 'washers',
        image: '/images/default-category.png'
      },
      {
        name: 'Dryers',
        slug: 'dryers',
        image: '/images/default-category.png'
      }
    ]
  },
  {
    name: 'Home Comfort Appliances',
    slug: 'home-comfort-appliances',
    isParent: true,
    image: '/images/default-category.png',
    children: [
      {
        name: 'Water Heaters',
        slug: 'water-heaters',
        image: '/images/default-category.png'
      },
      {
        name: 'Fans',
        slug: 'fans',
        image: '/images/default-category.png'
      }
    ]
  },
  {
    name: 'Electronics & Entertainment',
    slug: 'electronics-entertainment',
    isParent: true,
    image: '/images/default-category.png',
    children: [
      {
        name: 'Televisions',
        slug: 'televisions',
        image: '/images/default-category.png'
      },
      {
        name: 'DVD Players',
        slug: 'dvd-players',
        image: '/images/default-category.png'
      },
      {
        name: 'VCR Players',
        slug: 'vcr-players',
        image: '/images/default-category.png'
      },
      {
        name: 'Stereo Systems',
        slug: 'stereo-systems',
        image: '/images/default-category.png'
      },
      {
        name: 'Wall Mounts',
        slug: 'wall-mounts',
        image: '/images/default-category.png',
        description: 'Wall mounts for TVs and audio equipment'
      }
    ]
  },
  {
    name: 'Sewing & Textile Machines',
    slug: 'sewing-textile-machines',
    isParent: true,
    image: '/images/default-category.png',
    children: [
      {
        name: 'Standard Sewing Machines',
        slug: 'standard-sewing-machines',
        image: '/images/default-category.png'
      },
      {
        name: 'Portable Sewing Machines',
        slug: 'portable-sewing-machines',
        image: '/images/default-category.png'
      },
      {
        name: 'Sewing Machine Stands',
        slug: 'sewing-machine-stands',
        image: '/images/default-category.png'
      },
      {
        name: 'Industrial Sewing Machines',
        slug: 'industrial-sewing-machines',
        image: '/images/default-category.png'
      }
    ]
  },
  {
    name: 'Furniture & Home Decor',
    slug: 'furniture-home-decor',
    isParent: true,
    image: '/images/default-category.png',
    children: [
      {
        name: 'Furniture',
        slug: 'furniture',
        image: '/images/default-category.png',
        children: [
          {
            name: 'Living/Dining Room Furniture',
            slug: 'living-dining-room-furniture',
            image: '/images/default-category.png'
          },
          {
            name: 'Bedroom Furniture',
            slug: 'bedroom-furniture',
            image: '/images/default-category.png'
          }
        ]
      },
      {
        name: 'Home Decor',
        slug: 'home-decor',
        image: '/images/default-category.png',
        children: [
          {
            name: 'Lanterns',
            slug: 'lanterns',
            image: '/images/default-category.png'
          }
        ]
      }
    ]
  },
  {
    name: 'Personal Care & Beauty',
    slug: 'personal-care-beauty',
    isParent: true,
    image: '/images/default-category.png',
    children: [
      {
        name: 'Hair and Beauty',
        slug: 'hair-beauty',
        image: '/images/default-category.png',
        description: 'Small appliances and devices for hair and beauty care'
      }
    ]
  },
  {
    name: 'Appliance Parts & Accessories',
    slug: 'appliance-parts-accessories',
    isParent: true,
    image: '/images/default-category.png',
    children: [
      {
        name: 'Gas Appliance Parts',
        slug: 'gas-appliance-parts',
        image: '/images/default-category.png'
      }
    ]
  }
];

// Function to recursively create categories
async function createCategoriesRecursively(categories, parentId = null, parentPath = [], depth = 0) {
  const createdCategories = [];
  
  for (const categoryData of categories) {
    const { children, ...categoryInfo } = categoryData;
    
    // Set parent, path and depth
    if (parentId) {
      categoryInfo.parent = parentId;
      categoryInfo.path = [...parentPath];
      categoryInfo.depth = depth;
    }
    
    try {
      // Check if category already exists
      let category = await Category.findOne({ slug: categoryInfo.slug });
      
      if (!category) {
        // Create new category
        category = await Category.create(categoryInfo);
        console.log(`Created category: ${category.name}`);
      } else {
        // Update existing category
        Object.assign(category, categoryInfo);
        await category.save();
        console.log(`Updated category: ${category.name}`);
      }
      
      createdCategories.push(category);
      
      // Process children if any
      if (children && children.length > 0) {
        const newParentPath = [...parentPath, category._id];
        await createCategoriesRecursively(children, category._id, newParentPath, depth + 1);
      }
    } catch (error) {
      console.error(`Error creating/updating category ${categoryInfo.name}:`, error);
    }
  }
  
  return createdCategories;
}

// Main function
async function importCategories() {
  try {
    await connectToDatabase();
    
    console.log('Starting category import...');
    await createCategoriesRecursively(categoryData);
    console.log('Category import completed successfully!');
  } catch (error) {
    console.error('Error importing categories:', error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the import
importCategories();