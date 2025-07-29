# Project Technical Overview

This document provides a professional-level technical overview of the Next.js e-commerce application, detailing its architecture, technology stack, and data flow.

## 1. Technology Stack

The project is built on a modern, full-stack JavaScript foundation. The key technologies are identified from the `package.json` file:

-   **Framework**: **Next.js** (`^15.3.0`) is the core React framework, enabling server-side rendering (SSR), static site generation (SSG), and API routes.
-   **Language**: **TypeScript** (`^5`) is used for static typing, enhancing code quality and maintainability.
-   **Database**: **MongoDB** (`^6.12.0`) serves as the primary database, with **Mongoose** (`^8.13.1`) as the Object Data Modeling (ODM) library for interacting with it.
-   **Authentication**: **NextAuth.js** (`^5.0.0-beta.25`) handles user authentication, including session management and social logins.
-   **Styling**: **Tailwind CSS** (`^3.4.1`) is used for utility-first CSS styling.
-   **UI Components**: The project uses **Shadcn/UI**, which is evident from the numerous `@radix-ui/*` dependencies. This provides a set of accessible and reusable components.
-   **State Management**: **Zustand** (`^5.0.2`) is used for lightweight, client-side state management.
-   **Payment Processing**: Integrates both **PayPal** and **Stripe** for payment processing.
-   **File Uploads**: **UploadThing** (`^7.4.1`) manages file uploads, such as product images.
-   **Emailing**: **React Email** (`^4.0.16`) and **Resend** (`^4.6.0`) are used for sending transactional emails.
-   **Internationalization**: **next-intl** (`^3.26.3`) enables the website to be multilingual.

## 2. Application Architecture

This is a monolithic application where the frontend and backend logic reside in the same Next.js project.

-   **Frontend**: A rich client-side experience built with React, Next.js, and TypeScript. UI is constructed from reusable components.
-   **Backend**: Backend logic is handled by Next.js API Routes and Server Actions, which are located within the `app/api/` and `lib/actions/` directories respectively.
-   **Data Flow**: Frontend components (primarily Server Components) call Server Actions to fetch data. These actions connect to the MongoDB database, execute queries, and return the data to the components for rendering.

## 3. Routing and Page Layout

The application uses the Next.js App Router, with the main user-facing routes defined in the `app/[locale]/(root)/` directory.

The primary layout is defined in `app/[locale]/(root)/layout.tsx`:

```typescript
import React from 'react'
import Header from '@/components/shared/header'
import Footer from '@/components/shared/footer'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className='flex flex-col min-h-screen'>
      <Header />
      <main className='flex-1 flex flex-col p-4'>{children}</main>
      <Footer />
    </div>
  )
}
```

This file establishes the global page structure, ensuring that the `Header` and `Footer` components are present on all main pages, with the page-specific content rendered as `{children}`.

## 4. Data Flow Deep Dive: The Product Page

To illustrate the end-to-end data flow, we can trace the request for a single product page.

1.  **Request**: A user navigates to `/product/some-product-slug`.
2.  **Routing**: Next.js maps this URL to `app/[locale]/(root)/product/[slug]/page.tsx`.
3.  **Server Component Execution**: The `ProductDetails` component in `page.tsx` executes on the server. It is a React Server Component, allowing it to perform async operations and data fetching directly.
4.  **Data Fetching (Server Action)**: The component calls the `getProductBySlug` function, which is a Server Action defined in `lib/actions/product.actions.ts`.
5.  **Database Interaction**: The `getProductBySlug` function performs the following:
    -   Connects to the MongoDB database.
    -   Uses the `Product` Mongoose model to execute a `findOne({ slug: ... })` query.
    -   Uses `.populate()` to fetch related `category`, `brand`, and `reviews` data in a single efficient query.
    -   Returns the complete, populated product object.

    ```typescript
    // lib/actions/product.actions.ts
    export async function getProductBySlug(slug: string) {
      await connectToDatabase()
      const product = await Product.findOne({ slug })
        .populate('category', 'name slug')
        .populate('brand', 'name slug logo')
        .populate({ path: 'reviews', populate: { path: 'user', select: 'name' } })
      return JSON.parse(JSON.stringify(product))
    }
    ```
6.  **Server-Side Rendering**: The `ProductDetails` component receives the product data and renders the full page HTML on the server.
7.  **Response & Hydration**: The complete HTML is sent to the browser for an immediate render. The necessary JavaScript is then loaded to "hydrate" the page and make it interactive.

This architecture results in a fast, SEO-friendly, and highly maintainable e-commerce platform.