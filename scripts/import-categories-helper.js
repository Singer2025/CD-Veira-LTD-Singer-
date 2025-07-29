/**
 * Category Import Helper
 * 
 * This utility script helps visualize and manage the hierarchical category structure.
 * It provides functions to:
 * 1. Display the current category hierarchy in a tree format
 * 2. Generate a template for adding new categories
 * 3. Validate the category structure before importing
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

// Function to display the current category hierarchy
async function displayCategoryHierarchy() {
  try {
    await connectToDatabase();
    
    // Get all categories
    const categories = await Category.find().sort({ name: 1 }).lean();
    
    if (categories.length === 0) {
      console.log('No categories found in the database.');
      return;
    }
    
    console.log('\nCurrent Category Hierarchy:');
    console.log('===========================');
    
    // Create a map of parent IDs to children
    const categoryMap = {};
    categories.forEach(category => {
      const parentId = category.parent ? category.parent.toString() : 'root';
      if (!categoryMap[parentId]) {
        categoryMap[parentId] = [];
      }
      categoryMap[parentId].push(category);
    });
    
    // Function to print the tree recursively
    function printTree(parentId, indent = '') {
      const children = categoryMap[parentId] || [];
      children.forEach((category, index) => {
        const isLast = index === children.length - 1;
        const line = isLast ? '└── ' : '├── ';
        console.log(`${indent}${line}${category.name} (${category.slug})`);
        
        const childIndent = indent + (isLast ? '    ' : '│   ');
        printTree(category._id.toString(), childIndent);
      });
    }
    
    // Print the tree starting from root categories
    printTree('root');
    
  } catch (error) {
    console.error('Error displaying category hierarchy:', error);
  } finally {
    await mongoose.connection.close();
  }
}

// Function to generate a template for adding new categories
function generateCategoryTemplate() {
  const template = {
    name: 'Main Category Name',
    slug: 'main-category-slug',
    isParent: true,
    image: '/images/default-category.png',
    description: 'Description of the category',
    isFeatured: false,
    children: [
      {
        name: 'Subcategory Name',
        slug: 'subcategory-slug',
        image: '/images/default-category.png',
        description: 'Description of the subcategory',
        children: [
          {
            name: 'Sub-subcategory Name',
            slug: 'sub-subcategory-slug',
            image: '/images/default-category.png',
            description: 'Description of the sub-subcategory'
          }
        ]
      }
    ]
  };
  
  const templateJson = JSON.stringify(template, null, 2);
  const outputPath = path.join(__dirname, 'category-template.json');
  
  fs.writeFileSync(outputPath, templateJson);
  console.log(`\nCategory template generated at: ${outputPath}`);
  console.log('You can modify this template and use it with the import-categories.js script.');
}

// Function to validate a category structure before importing
function validateCategoryStructure(categories) {
  const errors = [];
  const slugs = new Set();
  
  function validateCategory(category, path = '') {
    // Check required fields
    if (!category.name) {
      errors.push(`${path}: Missing required field 'name'`);
    }
    
    if (!category.slug) {
      errors.push(`${path}: Missing required field 'slug'`);
    } else {
      // Check for duplicate slugs
      if (slugs.has(category.slug)) {
        errors.push(`${path}: Duplicate slug '${category.slug}'`);
      } else {
        slugs.add(category.slug);
      }
      
      // Check slug format
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(category.slug)) {
        errors.push(`${path}: Invalid slug format '${category.slug}'. Use lowercase letters, numbers, and hyphens only.`);
      }
    }
    
    if (!category.image) {
      errors.push(`${path}: Missing required field 'image'`);
    }
    
    // Validate children recursively
    if (category.children && Array.isArray(category.children)) {
      category.children.forEach((child, index) => {
        validateCategory(child, `${path} > ${child.name || `Child ${index + 1}`}`);
      });
    }
  }
  
  // Validate each top-level category
  categories.forEach((category, index) => {
    validateCategory(category, category.name || `Category ${index + 1}`);
  });
  
  return errors;
}

// Function to export current categories to a file
async function exportCurrentCategories() {
  try {
    await connectToDatabase();
    
    // Get all categories
    const categories = await Category.find().lean();
    
    if (categories.length === 0) {
      console.log('No categories found in the database.');
      return;
    }
    
    // Create a map of parent IDs to children
    const categoryMap = {};
    categories.forEach(category => {
      const parentId = category.parent ? category.parent.toString() : null;
      if (!categoryMap[parentId]) {
        categoryMap[parentId] = [];
      }
      categoryMap[parentId].push(category);
    });
    
    // Function to build the hierarchical structure
    function buildHierarchy(parentId = null) {
      const children = categoryMap[parentId] || [];
      return children.map(category => {
        const { _id, parent, depth, path, __v, ...categoryData } = category;
        
        // Convert ObjectId to string
        categoryData._id = _id.toString();
        if (parent) categoryData.parent = parent.toString();
        
        // Add children if any
        const childCategories = buildHierarchy(_id.toString());
        if (childCategories.length > 0) {
          categoryData.children = childCategories;
        }
        
        return categoryData;
      });
    }
    
    // Build the hierarchical structure
    const hierarchicalCategories = buildHierarchy(null);
    
    // Write to file
    const outputPath = path.join(__dirname, 'current-categories.json');
    fs.writeFileSync(outputPath, JSON.stringify(hierarchicalCategories, null, 2));
    
    console.log(`\nCurrent categories exported to: ${outputPath}`);
    
  } catch (error) {
    console.error('Error exporting categories:', error);
  } finally {
    await mongoose.connection.close();
  }
}

// Command line interface
function printUsage() {
  console.log('\nCategory Import Helper');
  console.log('====================');
  console.log('Usage: node category-helper.js [command]');
  console.log('\nCommands:');
  console.log('  display    - Display the current category hierarchy');
  console.log('  template   - Generate a template for adding new categories');
  console.log('  export     - Export current categories to a JSON file');
  console.log('\nExample:');
  console.log('  node category-helper.js display');
}

// Main function
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'display':
      await displayCategoryHierarchy();
      break;
    case 'template':
      generateCategoryTemplate();
      break;
    case 'export':
      await exportCurrentCategories();
      break;
    default:
      printUsage();
      break;
  }
}

// Run the main function
main();