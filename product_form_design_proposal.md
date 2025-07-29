# Design Proposal: Unified Product Management Form (Home Appliances & Furniture)

**1. Introduction & Purpose**

This document outlines the design proposal for a new, unified product management form for the e-commerce platform, specifically tailored for managing complex Home Appliance and Furniture products.

*   **Form Purpose:** This form is designed for **both creating new products and editing existing ones**, providing a consistent interface for all product data management tasks.

**2. Target User Persona**

*   **Primary Persona:** Alex, the E-commerce Catalog Manager
*   **Role:** Responsible for accurately inputting, updating, and maintaining the product catalog, including detailed specifications, pricing, inventory, media, and relationships for hundreds or thousands of SKUs, primarily large appliances and furniture items.
*   **Technical Proficiency:** Moderate to Proficient. Comfortable with web applications and data entry but benefits from clear layouts, intuitive workflows, and helpful validation, especially when dealing with complex or numerous fields. May occasionally perform bulk operations but primarily works on individual products or small batches.
*   **Workflow Context:** Spends significant time ensuring technical accuracy of specifications (dimensions, energy ratings, materials), managing product variants (color, size, finish), uploading high-quality media, and linking related items (collections, accessories, warranties). Needs efficient ways to navigate and update large amounts of data per product.

**3. Current Pain Points Addressed**

*   **Complex Specification Management:** Difficulty inputting and validating numerous, often technical, specifications (e.g., precise dimensions L/W/H for product *and* packaging, energy consumption kWh/year, water usage, BTU, material composition, weight capacity) in a structured, error-minimizing way.
*   **Visual Clutter & Navigation:** Current tools may present too many fields at once without logical grouping, making it hard to find specific sections (like logistics or SEO) quickly. Lack of clear structure leads to scrolling fatigue and potential oversight.
*   **Inefficient Variant/Bundle Creation:** Clunky interfaces for defining variant options (color, finish, size) and managing the unique attributes (SKU, price, stock, images, dimensions) of each resulting combination. Difficulty visualizing and managing relationships within furniture collections or appliance suites.
*   **Media Handling:** Cumbersome process for uploading, ordering, and tagging various media types (images, diagrams, 360 views, PDFs) and linking them appropriately (e.g., to specific variants).
*   **Data Inconsistency:** Lack of standardized input for certain fields (e.g., tags, custom attributes) leads to variations that harm filtering and search accuracy.

**4. Key Business Objectives**

*   **Reduce Time-to-Market:** Decrease the average time required to accurately list a new complex appliance or furniture item.
*   **Minimize Data Entry Errors:** Improve data accuracy, especially for critical technical specifications, dimensions, and pricing, reducing costly downstream issues (shipping errors, customer complaints).
*   **Increase Catalog Management Speed:** Enable faster updates and navigation for users managing large, attribute-heavy products.
*   **Improve Data Consistency:** Ensure standardized data across related product lines, variants, and attributes through better UI controls and validation.
*   **Enhance User Satisfaction:** Provide a more intuitive, efficient, and less frustrating experience for the catalog management team.

**5. Desired Aesthetic**

*   **Style:** Clean, professional, modern, and data-rich.
*   **Principles:** Prioritize clarity, scannability, and ease of navigation, especially given the density of information. Use whitespace effectively. Adhere to existing brand guidelines (if provided) for consistency with the overall admin panel. Utilize clear visual hierarchy.

**6. Technical Constraints & Environment**

*   **Frontend:** React / Next.js (based on project structure).
*   **UI Library:** Assumed **Shadcn UI** (based on `components/ui` structure). Leverage existing components where possible for consistency and speed.
*   **Backend:** Assumed standard REST or GraphQL API interaction. Specific API limitations need to be considered if known (e.g., payload size limits, specific endpoints for variants/media).
*   **Integration:** Consider potential integration points with PIM systems, ERPs, or other backend services if applicable.

**7. Proposed Layout & Structure**

*   **Pattern:** A **two-column layout** is proposed for desktop views.
    *   **Left Column (Sticky Navigation):** A vertical navigation menu (using `Tabs` or a custom side nav component) listing the main sections. This allows quick jumping between sections without excessive scrolling, crucial for complex products.
    *   **Right Column (Content Area):** Displays the form fields for the currently selected section.
*   **Sections:** Logically grouped fields:
    1.  **Basic Info:** Name, Slug, SKU, MPN, Brand, Status, Product Type.
    2.  **Categories & Tags:** Category assignment, Tag management.
    3.  **Description & Content:** Rich Text Description, Short Description/Highlights.
    4.  **Specifications:** Pre-defined technical specs (based on category), Custom Attributes.
    5.  **Dimensions & Weight:** Product L/W/H/Weight, Packaged L/W/H/Weight.
    6.  **Pricing & Inventory:** List Price, Sale Price, MAP, Currency, Stock Levels (potentially multi-location), Lead Time, Backorder status.
    7.  **Variants:** (Conditional) Variant option definition, Combination generation, Variant-specific overrides (SKU, Price, Stock, Images, Dimensions, Weight).
    8.  **Media:** Image/Video/PDF uploader and gallery manager.
    9.  **Logistics:** Shipping Class, Freight, Assembly Info.
    10. **SEO & Marketing:** Meta Title, Meta Description, Tags (potentially separate marketing tags).
    11. **Relations:** Related Products, Upsells, Cross-sells, Collections/Suites.
*   **Justification:** This structure breaks down the complexity. Sticky navigation provides constant context and quick access. Grouping related fields reduces cognitive load. Variants and Media get dedicated, focused interfaces.

*   **Mermaid Diagram (High-Level Structure):**
    ```mermaid
    graph TD
        A[Product Form] --> B(Left Nav);
        A --> C(Right Content Area);

        B --> B1{Basic Info};
        B --> B2{Categories & Tags};
        B --> B3{Description};
        B --> B4{Specifications};
        B --> B5{Dimensions & Weight};
        B --> B6{Pricing & Inventory};
        B --> B7{Variants};
        B --> B8{Media};
        B --> B9{Logistics};
        B --> B10{SEO & Marketing};
        B --> B11{Relations};

        subgraph C [Content Area - Displays Selected Section]
            direction TB
            C1[...]
        end

        B1 -- Selects --> C;
        B2 -- Selects --> C;
        B3 -- Selects --> C;
        B4 -- Selects --> C;
        B5 -- Selects --> C;
        B6 -- Selects --> C;
        B7 -- Selects --> C;
        B8 -- Selects --> C;
        B9 -- Selects --> C;
        B10 -- Selects --> C;
        B11 -- Selects --> C;

        style C fill:#f9f,stroke:#333,stroke-width:2px
    ```

**8. Category Management Interface**

*   **UI Component:** A **Modal Dialog** triggered by a "Select Category" button.
*   **Interaction:** Inside the modal, use a **Searchable & Filterable Tree View** (similar to file explorers).
    *   Display categories hierarchically (e.g., Appliances > Kitchen > Refrigeration).
    *   Include a search input at the top to filter the tree in real-time.
    *   Allow expanding/collapsing parent categories.
    *   Clicking a category selects it.
    *   Display the selected category path clearly (e.g., as breadcrumbs) both in the modal and back on the main form field.
*   **Benefits:** Handles deep, multi-level hierarchies common in home goods. Search provides efficiency. Visual tree structure is intuitive.

**9. Tag Management Interface**

*   **UI Component:** An **Input Field with Autocomplete/Multi-select** capabilities (potentially using Shadcn `Command` within a `Popover` or a dedicated tag input library).
*   **Interaction:**
    *   As the user types, suggest existing tags. Suggestions could be grouped (e.g., "Features", "Materials", "Style").
    *   Allow selecting multiple tags. Selected tags appear as dismissible pills/badges within or below the input.
    *   Provide an option to "Create new tag: [typed text]" if no existing tag matches, adding it to the system upon saving the product.
*   **Benefits:** Promotes tag consistency, speeds up selection, and allows controlled vocabulary expansion.

**10. Core Information Fields**

*   **Product Name:** Standard text input. Validation: Required, min/max length.
*   **SKU/Identifier:** Standard text input. Validation: Required, unique, specific format (if any). Read-only after creation? (Consider workflow).
*   **MPN:** Standard text input. Validation: Optional, specific format (if any).
*   **Description:** **Rich Text Editor** (e.g., Tiptap, Lexical, integrated with Shadcn UI).
    *   **Features:** Bold, italics, underline, bullet points, numbered lists, simple tables (for inline specs), link insertion, ability to embed uploaded PDFs (manuals, warranties) via a media browser.
*   **Pricing:**
    *   **List Price:** Number input (currency formatted). Validation: Required, positive number, specific decimal places.
    *   **Sale Price:** Number input. Validation: Optional, positive, must be less than List Price if entered.
    *   **MAP (Minimum Advertised Price):** Number input. Optional.
    *   **Currency:** Dropdown (if multi-currency support needed).
    *   **Fees:** Optional number inputs for Installation Fee, Disposal Fee, etc.
*   **Inventory/Stock:**
    *   **Quantity:** Number input.
    *   **Stock Tracking:** Toggle (Enable/Disable).
    *   **Multi-location:** If needed, a table or repeatable field group for Warehouse/Location + Quantity.
    *   **Stock Status:** Auto-calculated (In Stock, Low Stock, Out of Stock) or manual override dropdown.
    *   **Backorder:** Allow/Disallow toggle or dropdown.
    *   **Lead Time:** Text/Number input (e.g., "5-7 days", "Ships in 2 weeks").
    *   **Assembly Flag:** Checkbox ("Available for Assembly Service").

**11. Variant Management System**

*   **Trigger:** Conditional section, enabled if a "Product has variants" toggle is checked.
*   **Step 1: Define Options:** Interface to add variant options (e.g., "Color", "Finish", "Size", "Capacity"). Use simple text inputs.
*   **Step 2: Define Option Values:** For each option, allow adding multiple values (e.g., for "Color": "Stainless Steel", "Black", "White"). Use a tag-like input for values.
*   **Step 3: Generate Combinations:** A button "Generate Variants" creates all possible combinations based on options/values.
*   **Step 4: Manage Variants:** Display generated variants in a **Table/Matrix View**.
    *   **Columns:** Variant Combination (e.g., "Black / Large"), Variant SKU (editable, auto-suggested), Price Override (optional), Stock Override (optional), Weight Override (optional), Dimensions Override (optional), Primary Image (selector), Status (Active/Inactive).
    *   **Features:** Bulk editing capabilities (e.g., set price for all 'Black' variants), filtering/sorting the table, easy deletion of specific combinations. Link to upload/select variant-specific images.
*   **Benefits:** Structured process, clear overview of combinations, efficient management of variant-specific data crucial for appliances/furniture.

**12. Media Management Interface**

*   **UI Component:** A dedicated media section/tab.
*   **Features:**
    *   **Uploader:** Drag-and-drop area and traditional file input supporting multiple image formats (JPG, PNG, WEBP), PDFs, and potentially video formats (MP4). Show upload progress.
    *   **Gallery:** Display uploaded media as thumbnails in a grid.
    *   **Ordering:** Allow drag-and-drop reordering of media items.
    *   **Primary Image:** Clear visual indicator and mechanism (e.g., star icon, radio button) to select the main product image.
    *   **Editing:** Clicking a thumbnail opens a modal or side panel to edit:
        *   **Alt Text:** Input field (required for accessibility).
        *   **Tags:** Input for tags (e.g., "Lifestyle", "Detail", "Dimensions", "Swatch", "Installation Diagram").
        *   **Variant Linking:** Ability to associate the image with one or more specific variants (if applicable).
    *   **Deletion:** Clear delete action per item.
*   **Benefits:** Centralized, intuitive interface for all media types, supports essential metadata and variant linking.

**13. Other Necessary Fields**

*   **Product Status:** Dropdown (Draft, Pending Review, Published, Discontinued, Archived).
*   **SEO:** Dedicated inputs for Meta Title, Meta Description. URL Slug/Handle (auto-generated from name, editable).
*   **Physical Attributes:** Grouped number inputs for Product Dimensions (L, W, H - with unit selector cm/in), Weight (with unit selector kg/lbs). Separate group for Packaged Dimensions/Weight. Input for Material Composition (text area or repeatable key-value pairs).
*   **Logistics:** Dropdown for Shipping Class. Checkbox for Freight Required. Checkbox for Assembly Required (Y/N). Input for Estimated Assembly Time (e.g., "2 hours").
*   **Relations:** Searchable multi-select inputs (using Popover + Command/List) to link:
    *   Related Products (e.g., other items in a collection).
    *   Upsells (e.g., warranties, services).
    *   Cross-sells (e.g., accessories, consumables).
*   **Custom Attributes:** A flexible key-value pair system.
    *   Define attribute templates based on category (e.g., Refrigerators get "Energy Rating", "Capacity (Liters)", "Defrost Type").
    *   Allow adding ad-hoc custom attributes (Attribute Name input, Attribute Value input).
    *   Input type could vary based on attribute (text, number, dropdown, boolean).

**14. Functional & Non-Functional Requirements**

*   **Validation:** Clear visual indication (e.g., red border, icon) for required fields missed. Inline error messages near the field upon failed validation (e.g., "SKU must be unique", "Sale price cannot be higher than list price"). Use `react-hook-form` with Zod/Yup for schema validation.
*   **Loading States:** Use skeleton loaders or spinners for sections loading data (e.g., fetching categories, generating variants) and button loading states for save/upload actions.
*   **Save Actions:**
    *   Prominent "Save" or "Update" button (sticky footer/header?).
    *   Options like "Save & Publish", "Save as Draft".
    *   Clear indication of unsaved changes (e.g., asterisk on nav items, browser prompt on exit). Consider auto-save for description fields.
*   **Accessibility (WCAG 2.1 AA):** Ensure all custom components (category tree, tag input, variant table, media gallery) are keyboard navigable, have proper focus states, and use appropriate ARIA attributes for screen readers. Use semantic HTML. Ensure sufficient color contrast.
*   **Responsiveness:** Design primarily for desktop/laptop. Ensure key information is viewable and basic edits are possible on tablet screens. Mobile view might be read-only or highly simplified.
*   **Workflow Integration:** The form should be accessible from the main product list page (Edit action) and via a "Create Product" button. Consider deep links to specific sections (e.g., link from an order issue directly to the inventory section of that product).

**15. Data Model Recommendations**

*   **Categories:** Ensure the `Category` model efficiently stores the full path or uses a nested set/materialized path pattern for fast hierarchy queries needed by the tree view.
*   **Tags:** Consider a separate `Tag` collection to manage tags centrally, allowing for grouping and easier querying, linked via an array of ObjectIds in the `Product` model.
*   **Variants:**
    *   Option 1 (Embedded): Store variant combinations as an array of sub-documents within the `Product` document. Suitable if the number of variants per product is typically limited and variants don't need independent querying.
    *   Option 2 (Separate Collection): Create a `ProductVariant` collection. Each document represents a unique variant combination and stores its specific overrides (SKU, price, stock, image refs, dimensions, weight). The `Product` document holds an array of ObjectIds referencing its variants. **Recommended for scalability and complex overrides**, especially unique dimensions/weight per variant.
*   **Specifications/Custom Attributes:** Instead of a simple key-value array, consider a more structured approach:
    *   Link to a `SpecificationAttribute` collection defining attribute names, types (number, string, boolean, enum), units, and potentially category applicability.
    *   Store product-specific values as an array like `[{ attributeId: ObjectId, value: '...', unit: '...' }]` on the `Product` or `ProductVariant` model. This improves consistency and allows for typed inputs/validation.
*   **Media:** Store media metadata (URL, alt text, tags, variant links) potentially in its own `Media` collection or as an array of objects within the `Product`/`ProductVariant` model. Ensure efficient querying for variant-specific images.
*   **Relations:** Use arrays of ObjectIds to store references for related products, upsells, cross-sells.

**16. Key Success Metrics**

*   **Quantitative:**
    *   Reduction in average time (minutes) to create/edit a complex product (e.g., 15% decrease).
    *   Decrease in data entry error rate identified post-publish (e.g., 20% reduction in errors related to dimensions/specs).
    *   Increase in the percentage of products with complete optional data (e.g., related products, detailed specs) (e.g., 25% increase).
    *   Reduction in support tickets related to product data errors or form usability.
*   **Qualitative:**
    *   Increase in user satisfaction scores (via surveys/interviews with catalog managers).
    *   Positive feedback regarding ease of use, clarity, and efficiency.

**17. Deliverables**

*   **High-Fidelity Mockups:** (Assuming **Figma**) covering key screens and states:
    *   Default form view (e.g., Basic Info section).
    *   Category selection modal (showing tree view).
    *   Tag input interaction.
    *   Variant management table/interface.
    *   Media gallery and uploader view.
    *   Example of a section with validation errors.
    *   Loading state examples.
*   **Annotations:** Detailed notes on mockups explaining rationale, interactions (hover, focus), validation rules, and accessibility considerations (ARIA roles, keyboard flow).
*   **Optional:** Interactive Prototype (Figma) demonstrating core workflows (e.g., creating a product with variants, assigning categories/tags, managing media).