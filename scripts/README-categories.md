# Category Hierarchy Management

This directory contains scripts to help you manage the hierarchical category structure for your e-commerce store. The scripts allow you to import a predefined category hierarchy, visualize the current structure, and generate templates for adding new categories.

## Understanding the Category Hierarchy

The category model in this application supports a multi-level hierarchy with the following key fields:

- `parent`: Reference to the parent category
- `depth`: The depth level in the hierarchy (0 for top-level categories)
- `path`: Array of ancestor category IDs, useful for efficient querying
- `isParent`: Boolean flag indicating if this is a parent/top-level category

## Available Scripts

### 1. Import Categories

The `import-categories.js` script allows you to import a predefined hierarchical category structure into your database. The script maintains parent-child relationships and properly sets up the path and depth fields.

```bash
node scripts/import-categories.js
```

This script contains a predefined category structure that matches the hierarchy you specified:

```
Kitchen Appliances & Cookware
  Refrigeration & Cooling
    Refrigerators
      French Door Refrigerators
      Top Freezer Refrigerators
      Bottom Freezer Refrigerators
    Freezers
      Chest Freezers
      Upright Freezers
    Bottle Coolers
  Cooking Appliances
    Gas Cookers
    Electric Cookers
    Toaster Ovens
    Microwaves
    Pressure Cookers
    Rice Cookers
  Small Kitchen Appliances
    Toasters
      Two-Slice Toasters
      Four-Slice Toasters
    Kettles
    Toaster and Kettle Sets
    Blenders
    Mixers
    Food Processors
    Coffee Makers
    Food Steamers
    Indoor Grills
    Electric/Deep Fryers
    Electric Knives
    Air Fryers
    Bread Makers
    Juicers
    Pot Sets
    Can Openers
    Hot Plates
    Food Bag Sealers
Laundry Appliances
  Washers
  Dryers
Home Comfort Appliances
  Water Heaters
  Fans
Electronics & Entertainment
  Televisions
  DVD Players
  VCR Players
  Stereo Systems
  Wall Mounts (for TVs and audio)
Sewing & Textile Machines
  Standard Sewing Machines
  Portable Sewing Machines
  Sewing Machine Stands
  Industrial Sewing Machines
Furniture & Home Decor
  Furniture
    Living/Dining Room Furniture
    Bedroom Furniture
  Home Decor
    Lanterns
Personal Care & Beauty
  Hair and Beauty
Appliance Parts & Accessories
  Gas Appliance Parts
```

### 2. Category Helper

The `import-categories-helper.js` script provides utilities to help you manage your category hierarchy:

```bash
# Display the current category hierarchy
node scripts/import-categories-helper.js display

# Generate a template for adding new categories
node scripts/import-categories-helper.js template

# Export current categories to a JSON file
node scripts/import-categories-helper.js export
```

## Modifying the Category Structure

If you want to modify the predefined category structure:

1. Open `import-categories.js` in a text editor
2. Locate the `categoryData` array
3. Modify the structure as needed, following the existing pattern
4. Save the file and run the script

## Adding Categories via the Admin UI

You can also add categories through the admin UI:

1. Navigate to `/admin/categories` in your browser
2. Click "Add Category"
3. Fill out the form:
   - For top-level categories, toggle "Category Type" to "Parent category"
   - For subcategories, select a parent from the dropdown
4. Upload an image (required for parent categories)
5. Click "Save"

## Best Practices

- **Start with top-level categories**: Create all your main categories first
- **Add subcategories**: Then add second-level categories, selecting the appropriate parent
- **Continue down the hierarchy**: Add deeper levels as needed
- **Use consistent naming**: Keep your category names consistent and descriptive
- **Use meaningful slugs**: Slugs should be URL-friendly versions of your category names

## Troubleshooting

If you encounter issues:

- Make sure your MongoDB connection is properly configured in `.env.local`
- Check that you have the required dependencies installed
- Verify that your category structure follows the expected format
- Look for error messages in the console output