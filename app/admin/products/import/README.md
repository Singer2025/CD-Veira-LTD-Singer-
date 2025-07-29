# Bulk Product Import

This feature allows administrators to import multiple products at once using a CSV file, saving time and effort compared to adding products individually.

## How to Use

1. Navigate to the Admin Products page
2. Click on the "Bulk Import" button
3. Upload a CSV file containing product data
4. Review the import results

## CSV Format Requirements

- The first row must contain column headers
- Required columns: `name`, `slug`, `category`, `brand`, `description`, `listPrice`, `countInStock`
- `images` are recommended but optional during import (you can add images later)
- For multiple images, separate URLs with semicolons (`;`)
- For specifications, use JSON format or key:value pairs separated by commas
- Category and brand can be specified by name, slug, or ID (names and slugs are automatically resolved)

## Sample CSV Structure

A sample CSV file is available for download on the import page. The file includes examples of different product types with various attributes.

## Field Descriptions

| Field | Description | Required | Format |
|-------|-------------|----------|--------|
| name | Product name | Yes | Text |
| slug | URL-friendly identifier | Yes | Text (lowercase, hyphens) |
| category | Product category | Yes | Category name, slug, or ID |
| brand | Product brand | Yes | Brand name, slug, or ID |
| description | Product description | Yes | Text |
| listPrice | Regular price | Yes | Number (e.g., 499.99) |
| price | Sale price | No | Number (e.g., 399.99) |
| countInStock | Inventory quantity | Yes | Integer |
| images | Product images | Yes | URLs separated by semicolons |
| tags | Product tags | No | Text values separated by semicolons |
| isPublished | Whether product is visible | No | true/false |
| sku | Stock keeping unit | No | Text |
| specifications | Product specifications | No | JSON array or key:value pairs |
| dimensions | Product dimensions | No | JSON object with height, width, depth, unit |
| weight | Product weight | No | JSON object with value and unit |
| material | Product material | No | Text |
| finish | Product finish | No | Text |
| energyRating | Energy efficiency rating | No | Text |
| energyConsumption | Energy consumption | No | Text |
| capacity | Product capacity | No | Text |
| warrantyDetails | Warranty information | No | Text |
| installationRequired | Installation needed | No | true/false |
| modelNumber | Product model number | No | Text |

## Error Handling

The import process validates each product and provides detailed error messages for any issues. The validation has been improved to handle common import scenarios:

- **Categories and Brands**: Can be specified by name, slug, or ID - the system will automatically find the correct reference
- **Images**: Now optional during import (you can add them later using the bulk image upload tool)
- **List Price**: Better handling of currency symbols and formatting
- **Specifications**: Values are now automatically set to "Not specified" if missing

Common errors you might still encounter:

- Missing required fields (name, slug, description)
- Invalid numeric formats (after currency symbol removal)
- Duplicate slugs (products must have unique slugs)
- Non-existent categories or brands (check spelling or create them first)

The results page will show a summary of successful and failed imports, with specific error messages for each failed row.

## Best Practices

1. Start with a small test import to verify your CSV format
2. Use the sample CSV as a template
3. Ensure all required fields are included
4. Use unique slugs for each product
5. Verify that categories and brands exist in the system before importing

## Troubleshooting

If you encounter issues with your import:

1. Check the error messages for specific problems
2. Verify your CSV format matches the requirements
3. Ensure all required fields have valid values
4. Check for special characters that might need proper formatting