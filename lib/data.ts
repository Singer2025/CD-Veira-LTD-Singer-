import { toSlug } from './utils'
import bcrypt from 'bcryptjs'
import { i18n } from '@/i18n-config'

const data = {
  users: [
  {
    name: 'Admin User',
    email: 'admin@cdveiraltd.com',
    password: bcrypt.hashSync('Secure_P@ssw0rd_2023!', 10),
    role: 'Admin',
    address: {
      fullName: 'CD Veira Admin',
      street: '111 Main St',
      city: 'New York',
      province: 'NY',
      postalCode: '10001',
      country: 'USA',
      phone: '123-456-7890',
    },
    paymentMethod: 'Stripe',
    emailVerified: true,
  },
  {
    name: 'John',
    email: 'admin@example.com',
    password: bcrypt.hashSync('123456', 5),
    role: 'Admin',
    address: {
      fullName: 'John Doe',
      street: '111 Main St',
      city: 'New York',
      province: 'NY',
      postalCode: '10001',
      country: 'USA',
      phone: '123-456-7890',
    },
    paymentMethod: 'Stripe',
    emailVerified: false,
  },
  {
    name: 'Jane',
    email: 'jane@example.com',
    password: bcrypt.hashSync('123456', 5),
    role: 'User',
    address: {
      fullName: 'Jane Harris',
      street: '222 Main St',
      city: 'New York',
      province: 'NY',
      postalCode: '1002',
      country: 'USA',
      phone: '123-456-7890',
    },
    paymentMethod: 'Cash On Delivery',
    emailVerified: false,
  },
  {
    name: 'Jack',
    email: 'jack@example.com',
    password: bcrypt.hashSync('123456', 5),
    role: 'User',
    address: {
      fullName: 'Jack Ryan',
      street: '333 Main St',
      city: 'New York',
      province: 'NY',
      postalCode: '1003',
      country: 'USA',
      phone: '123-456-7890',
    },
    paymentMethod: 'PayPal',
    emailVerified: false,
  },
  {
    name: 'Sarah',
    email: 'sarah@example.com',
    password: bcrypt.hashSync('123456', 5),
    role: 'User',
    address: {
      fullName: 'Sarah Smith',
      street: '444 Main St',
      city: 'New York',
      province: 'NY',
      postalCode: '1005',
      country: 'USA',
      phone: '123-456-7890',
    },
    paymentMethod: 'Cash On Delivery',
    emailVerified: false,
  },
  {
    name: 'Michael',
    email: 'michael@example.com',
    password: bcrypt.hashSync('123456', 5),
    role: 'User',
    address: {
      fullName: 'John Alexander',
      street: '555 Main St',
      city: 'New York',
      province: 'NY',
      postalCode: '1006',
      country: 'USA',
      phone: '123-456-7890',
    },
    paymentMethod: 'PayPal',
    emailVerified: false,
  },
  {
    name: 'Emily',
    email: 'emily@example.com',
    password: bcrypt.hashSync('123456', 5),
    role: 'User',
    address: {
      fullName: 'Emily Johnson',
      street: '666 Main St',
      city: 'New York',
      province: 'NY',
      postalCode: '10001',
      country: 'USA',
      phone: '123-456-7890',
    },
    paymentMethod: 'Stripe',
    emailVerified: false,
  },
  {
    name: 'Alice',
    email: 'alice@example.com',
    password: bcrypt.hashSync('123456', 5),
    role: 'User',
    address: {
      fullName: 'Alice Cooper',
      street: '777 Main St',
      city: 'New York',
      province: 'NY',
      postalCode: '10007',
      country: 'USA',
      phone: '123-456-7890',
    },
    paymentMethod: 'Cash On Delivery',
    emailVerified: false,
  },
  {
    name: 'Tom',
    email: 'tom@example.com',
    password: bcrypt.hashSync('123456', 5),
    role: 'User',
    address: {
      fullName: 'Tom Hanks',
      street: '888 Main St',
      city: 'New York',
      province: 'NY',
      postalCode: '10008',
      country: 'USA',
      phone: '123-456-7890',
    },
    paymentMethod: 'Stripe',
    emailVerified: false,
  },
  {
    name: 'Linda',
    email: 'linda@example.com',
    password: bcrypt.hashSync('123456', 5),
    role: 'User',
    address: {
      fullName: 'Linda Holmes',
      street: '999 Main St',
      city: 'New York',
      province: 'NY',
      postalCode: '10009',
      country: 'USA',
      phone: '123-456-7890',
    },
    paymentMethod: 'PayPal',
    emailVerified: false,
  },
  {
    name: 'George',
    email: 'george@example.com',
    password: bcrypt.hashSync('123456', 5),
    role: 'User',
    address: {
      fullName: 'George Smith',
      street: '101 First Ave',
      city: 'New York',
      province: 'NY',
      postalCode: '10010',
      country: 'USA',
      phone: '123-456-7890',
    },
    paymentMethod: 'Stripe',
    emailVerified: false,
  },
  {
    name: 'Jessica',
    email: 'jessica@example.com',
    password: bcrypt.hashSync('123456', 5),
    role: 'User',
    address: {
      fullName: 'Jessica Brown',
      street: '102 First Ave',
      city: 'New York',
      province: 'NY',
      postalCode: '10011',
      country: 'USA',
      phone: '123-456-7890',
    },
    paymentMethod: 'Cash On Delivery',
    emailVerified: false,
  },
  {
    name: 'Chris',
    email: 'chris@example.com',
    password: bcrypt.hashSync('123456', 5),
    role: 'User',
    address: {
      fullName: 'Chris Evans',
      street: '103 First Ave',
      city: 'New York',
      province: 'NY',
      postalCode: '10012',
      country: 'USA',
      phone: '123-456-7890',
    },
    paymentMethod: 'PayPal',
    emailVerified: false,
  },
  {
    name: 'Samantha',
    email: 'samantha@example.com',
    password: bcrypt.hashSync('123456', 5),
    role: 'User',
    address: {
      fullName: 'Samantha Wilson',
      street: '104 First Ave',
      city: 'New York',
      province: 'NY',
      postalCode: '10013',
      country: 'USA',
      phone: '123-456-7890',
    },
    paymentMethod: 'Stripe',
    emailVerified: false,
  },
  {
    name: 'David',
    email: 'david@example.com',
    password: bcrypt.hashSync('123456', 5),
    role: 'User',
    address: {
      fullName: 'David Lee',
      street: '105 First Ave',
      city: 'New York',
      province: 'NY',
      postalCode: '10014',
      country: 'USA',
      phone: '123-456-7890',
    },
    paymentMethod: 'Cash On Delivery',
    emailVerified: false,
  },
  {
    name: 'Anna',
    email: 'anna@example.com',
    password: bcrypt.hashSync('123456', 5),
    role: 'User',
    address: {
      fullName: 'Anna Smith',
      street: '106 First Ave',
      city: 'New York',
      province: 'NY',
      postalCode: '10015',
      country: 'USA',
      phone: '123-456-7890',
    },
    paymentMethod: 'PayPal',
    emailVerified: false,
  },
],

products: [
  {
    name: 'Samsung 4-Door French Door Refrigerator',
    slug: toSlug('Samsung 4-Door French Door Refrigerator'),
    category: 'Refrigerators',
    images: ['/images/p11-1.jpg', '/images/p11-2.jpg'],
    tags: ['new-arrival'],
    isPublished: true,
    price: 1899.99,
    listPrice: 2199.99,
    brand: 'Samsung',
    avgRating: 4.71,
    numReviews: 7,
    ratingDistribution: [
      { rating: 1, count: 0 },
      { rating: 2, count: 0 },
      { rating: 3, count: 0 },
      { rating: 4, count: 2 },
      { rating: 5, count: 5 }
    ],
    numSales: 9,
    countInStock: 11,
    description: 'Energy-efficient refrigerator with FlexZone drawer and advanced cooling technology',
    sizes: [],
    colors: ['Stainless Steel', 'Black Stainless', 'White'],
    reviews: []
  },
  {
    name: 'KitchenAid Stand Mixer Professional 600',
    slug: toSlug('KitchenAid Stand Mixer Professional 600'),
    category: 'Mixers',
    images: ['/images/p12-1.jpg', '/images/p12-2.jpg', '/images/p12-3.jpg', '/images/p12-4.jpg'],
    tags: ['featured'],
    isPublished: true,
    price: 429.99,
    listPrice: 499.99,
    brand: 'KitchenAid',
    avgRating: 4.2,
    numReviews: 10,
    ratingDistribution: [
      { rating: 1, count: 1 },
      { rating: 2, count: 0 },
      { rating: 3, count: 0 },
      { rating: 4, count: 4 },
      { rating: 5, count: 5 }
    ],
    numSales: 29,
    countInStock: 12,
    description: 'Professional-grade stand mixer with 6-quart stainless steel bowl, 10 speeds, and multiple attachments for versatile food preparation',
    sizes: [],
    colors: ['Empire Red', 'Contour Silver', 'Matte Black'],
    reviews: []
  },
  {
    name: "LG Front Load Washer and Dryer Set",
    slug: toSlug('LG Front Load Washer and Dryer Set'),
    category: 'Washers',
    brand: 'LG',
    images: ['/images/p13-1.jpg', '/images/p13-2.jpg'],
    tags: ['best-seller'],
    isPublished: true,
    price: 1599.99,
    listPrice: 1899.99,
    avgRating: 4,
    numReviews: 12,
    ratingDistribution: [
      { rating: 1, count: 1 },
      { rating: 2, count: 0 },
      { rating: 3, count: 2 },
      { rating: 4, count: 4 },
      { rating: 5, count: 5 }
    ],
    numSales: 55,
    countInStock: 13,
    description: 'High-efficiency front load washer and dryer set with TurboWash technology, steam cleaning, and smart connectivity features for remote monitoring and control.',
    sizes: [],
    colors: ['Green', 'White'],
    reviews: []
  },
  {
    name: "Muscle Cmdr Men's Slim Fit Henley Shirt Long&Short Business Sleeve Casual 3 Metal Buton Placket Casual Stylish T-Shirt",
    slug: toSlug("Muscle Cmdr Men's Slim Fit Henley Shirt Long&Short Business Sleeve Casual 3 Metal Buton Placket Casual Stylish T-Shirt"),
    category: 'Dryers',
    brand: ' Muscle Cmdr',
    images: ['/images/p15-1.jpg', '/images/p15-2.jpg'],
    tags: ['new-arrival', 'featured'],
    isPublished: true,
    price: 29.99,
    listPrice: 35.99,
    avgRating: 3.66,
    numReviews: 15,
    ratingDistribution: [
      { rating: 1, count: 1 },
      { rating: 2, count: 2 },
      { rating: 3, count: 3 },
      { rating: 4, count: 4 },
      { rating: 5, count: 5 }
    ],
    numSales: 54,
    countInStock: 15,
    description: "Slim Fit Design:Men's Muscle Slim Fit Button Henley Shirts are designed to fit snugly against your body, accentuating your muscles and creating a sleek silhouette that's perfect for any occasion. ",
    sizes: ['XL', 'XXL'],
    colors: ['Green', 'Yellow'],
    reviews: []
  },
  {
    name: 'Hanes Mens Long Sleeve Beefy Henley Shirt',
    slug: toSlug('Hanes Mens Long Sleeve Beefy Henley Shirt'),
    category: 'Vacuum Cleaners',
    brand: 'Jerzees',
    images: ['/images/p16-1.jpg', '/images/p16-2.jpg'],
    tags: ['best-seller', 'todays-deal'],
    isPublished: true,
    price: 25.3,
    listPrice: 32.99,
    avgRating: 3.46,
    numReviews: 13,
    ratingDistribution: [
      { rating: 1, count: 1 },
      { rating: 2, count: 2 },
      { rating: 3, count: 3 },
      { rating: 4, count: 4 },
      { rating: 5, count: 3 }
    ],
    numSales: 56,
    countInStock: 16,
    description: 'Heavyweight cotton (Heathers are 60% cotton/40% polyester; Pebblestone is 75% cotton/25% polyester)',
    sizes: ['XL', 'XXL'],
    colors: ['Grey', 'White'],
    reviews: []
  },
  {
    name: 'Modern Sectional Sofa',
    slug: toSlug('Modern Sectional Sofa'),
    category: 'Sofas',
    brand: 'Ashley Furniture',
    images: ['/images/sofa1.jpg', '/images/sofa2.jpg'], // Assuming you have these images
    tags: ['new-arrival', 'living-room'],
    isPublished: true,
    price: 799.99,
    listPrice: 999.99,
    avgRating: 4.5,
    numReviews: 25,
    ratingDistribution: [
      { rating: 1, count: 1 },
      { rating: 2, count: 1 },
      { rating: 3, count: 3 },
      { rating: 4, count: 10 },
      { rating: 5, count: 10 }
    ],
    numSales: 45,
    countInStock: 30,
    description: 'Comfortable and stylish sectional sofa, perfect for modern living rooms.',
    sizes: ['Large'],
    colors: ['Gray', 'Beige', 'Navy'],
    reviews: []
  },
  {
    name: 'Classic Leather Sofa',
    slug: toSlug('Classic Leather Sofa'),
    category: 'Coffee Tables',
    brand: 'Lexington Home Brands',
    images: ['/images/leather_sofa1.jpg', '/images/leather_sofa2.jpg'], // Assuming you have these images
    tags: ['best-seller', 'living-room'],
    isPublished: true,
    price: 1299.99,
    listPrice: 1499.99,
    avgRating: 4.8,
    numReviews: 30,
    ratingDistribution: [
      { rating: 1, count: 0 },
      { rating: 2, count: 1 },
      { rating: 3, count: 2 },
      { rating: 4, count: 7 },
      { rating: 5, count: 20 }
    ],
    numSales: 60,
    countInStock: 20,
    description: 'Elegant classic leather sofa, adding a touch of luxury to any living space.',
    sizes: ['Medium'],
    colors: ['Brown', 'Black', 'Burgundy'],
    reviews: []
  },
  {
    name: 'Modern Glass Coffee Table',
    slug: toSlug('Modern Glass Coffee Table'),
    category: 'Coffee Tables',
    brand: 'Coaster Fine Furniture',
    images: ['/images/glass_table1.jpg', '/images/glass_table2.jpg'], // Assuming you have these images
    tags: ['new-arrival', 'living-room'],
    isPublished: true,
    price: 249.99,
    listPrice: 299.99,
    avgRating: 4.6,
    numReviews: 15,
    ratingDistribution: [
      { rating: 1, count: 0 },
      { rating: 2, count: 0 },
      { rating: 3, count: 2 },
      { rating: 4, count: 5 },
      { rating: 5, count: 8 }
    ],
    numSales: 35,
    countInStock: 40,
    description: 'Sleek modern glass coffee table, perfect for contemporary living rooms.',
    sizes: ['Standard'],
    colors: ['Clear Glass', 'Black Frame', 'Chrome Frame'],
    reviews: []
  },
  {
    name: 'Rustic Wooden Coffee Table',
    slug: toSlug('Rustic Wooden Coffee Table'),
    category: 'Coffee Tables',
    brand: 'Signature Design by Ashley',
    images: ['/images/wooden_table1.jpg', '/images/wooden_table2.jpg'], // Assuming you have these images
    tags: ['best-seller', 'living-room'],
    isPublished: true,
    price: 199.99,
    listPrice: 249.99,
    avgRating: 4.7,
    numReviews: 20,
    ratingDistribution: [
      { rating: 1, count: 0 },
      { rating: 2, count: 0 },
      { rating: 3, count: 1 },
      { rating: 4, count: 6 },
      { rating: 5, count: 13 }
    ],
    numSales: 55,
    countInStock: 50,
    description: 'Charming rustic wooden coffee table, adding warmth and character to your living space.',
    sizes: ['Standard'],
    colors: ['Natural Wood', 'Dark Oak', 'Weathered Grey'],
    reviews: []
  },
  {
    name: 'Samsung 65-inch 4K Smart TV',
    slug: toSlug('Samsung 65-inch 4K Smart TV'),
    category: 'Televisions',
    brand: 'Samsung',
    images: ['/images/tv_samsung1.jpg', '/images/tv_samsung2.jpg'], // Assuming you have these images
    tags: ['new-arrival', 'electronics'],
    isPublished: true,
    price: 899.99,
    listPrice: 1099.99,
    avgRating: 4.9,
    numReviews: 40,
    ratingDistribution: [
      { rating: 1, count: 0 },
      { rating: 2, count: 0 },
      { rating: 3, count: 0 },
      { rating: 4, count: 5 },
      { rating: 5, count: 35 }
    ],
    numSales: 70,
    countInStock: 15,
    description: 'Immersive 65-inch 4K Smart TV from Samsung, with stunning picture quality and smart features.',
    sizes: ['65-inch'],
    colors: ['Black', 'Silver'],
    reviews: []
  },
  {
    name: 'LG 55-inch OLED TV',
    slug: toSlug('LG 55-inch OLED TV'),
    category: 'Televisions',
    brand: 'LG',
    images: ['/images/tv_lg1.jpg', '/images/tv_lg2.jpg'], // Assuming you have these images
    tags: ['best-seller', 'electronics'],
    isPublished: true,
    price: 1199.99,
    listPrice: 1399.99,
    avgRating: 4.85,
    numReviews: 35,
    ratingDistribution: [
      { rating: 1, count: 0 },
      { rating: 2, count: 0 },
      { rating: 3, count: 1 },
      { rating: 4, count: 4 },
      { rating: 5, count: 30 }
    ],
    numSales: 65,
    countInStock: 10,
    description: 'Experience perfect black and vibrant color with this 55-inch LG OLED TV.',
    sizes: ['55-inch'],
    colors: ['Black'],
    reviews: []
  }
],

categories: [
    {
      name: 'Kitchen',
      image: '/images/category-kitchen.jpg',
      subCategories: [
        {
          name: 'Major Appliances',
          image: '/images/category-major-appliances.jpg',
          categories: [
            'Refrigerators',
            'Freezers',
            'Cookers',
            'Microwaves',
            'Dishwashers'
          ]
        },
        {
          name: 'Small Appliances',
          image: '/images/category-small-appliances.jpg',
          categories: [
            'Toasters',
            'Toaster Ovens',
            'Kettles',
            'Blenders',
            'Mixers',
            'Food Processors',
            'Coffee Makers',
            'Juicers',
            'Rice Cookers',
            'Pressure Cookers',
            'Air Fryers',
            'Food Steamers',
            'Food Sealers',
            'Indoor Grills',
            'Electric/Deep Fryers',
            'Bread Makers',
            'Can Openers',
            'Hot Plates',
            'Mini Kitchens',
            'Toaster Oven and Kettle Sets',
            'Bottle Coolers'
          ]
        },
        {
          name: 'Cookware',
          image: '/images/category-cookware.jpg',
          categories: [
            'Pots',
            'Pans',
            'Specialty Cookware'
          ]
        }
      ]
    },
    {
      name: 'Laundry',
      image: '/images/category-laundry.jpg',
      subCategories: [
        {
          name: 'Washers',
          image: '/images/category-washers.jpg',
          categories: [
            'Washers'
          ]
        },
        {
          name: 'Dryers',
          image: '/images/category-dryers.jpg',
          categories: [
            'Dryers'
          ]
        },
        {
          name: 'Irons',
          image: '/images/category-irons.jpg',
          categories: [
            'Irons'
          ]
        },
        {
          name: 'Vacuum Cleaners',
          image: '/images/category-vacuum-cleaners.jpg',
          categories: [
            'Vacuum Cleaners'
          ]
        },
        {
          name: 'Sewing Machines',
          image: '/images/category-sewing-machines.jpg',
          categories: [
            'Sewing Machines'
          ]
        }
      ]
    },
    {
      name: 'Home Comfort',
      image: '/images/category-home-comfort.jpg',
      subCategories: [
        {
          name: 'Fans',
          image: '/images/category-fans.jpg',
          categories: [
            'Fans'
          ]
        },
        {
          name: 'Water Heaters',
          image: '/images/category-water-heaters.jpg',
          categories: [
            'Water Heaters'
          ]
        },
        {
          name: 'Barbecue Grills',
          image: '/images/category-barbecue-grills.jpg',
          categories: [
            'Barbecue Grills'
          ]
        }
      ]
    },
    {
      name: 'Electronics',
      image: '/images/category-electronics.jpg',
      subCategories: [
        {
          name: 'Televisions',
          image: '/images/category-televisions.jpg',
          categories: [
            'Televisions'
          ]
        },
        {
          name: 'Audio & Video',
          image: '/images/category-audio-video.jpg',
          categories: [
            'Audio & Video'
          ]
        },
        {
          name: 'Accessories',
          image: '/images/category-accessories.jpg',
          categories: [
            'Accessories'
          ]
        }
      ]
    },
    {
      name: 'Furniture',
      image: '/images/category-furniture.jpg',
      subCategories: [
        {
          name: 'Living Room',
          image: '/images/category-living-room.jpg',
          categories: [
            'Sofas',
            'Coffee Tables',
            'TV Stands'
          ]
        },
        {
          name: 'Dining Room',
          image: '/images/category-dining-room.jpg',
          categories: [
            'Dining Tables',
            'Chairs'
          ]
        },
        {
          name: 'Bedroom',
          image: '/images/category-bedroom.jpg',
          categories: [
            'Beds',
            'Dressers',
            'Nightstands'
          ]
        }
      ]
    },
    {
      name: 'Beauty & Personal Care',
      image: '/images/category-beauty-personal-care.jpg',
      subCategories: [
        {
          name: 'Hair Care',
          image: '/images/category-hair-care.jpg',
          categories: [
            'Hair Care'
          ]
        },
        {
          name: 'Personal Care',
          image: '/images/category-personal-care.jpg',
          categories: [
            'Personal Care'
          ]
        }
      ]
    },
    {
      name: 'Other Gas Appliances',
      image: '/images/category-gas-appliances.jpg',
      subCategories: [
        {
          name: 'Gas Cookers',
          image: '/images/category-gas-cookers.jpg',
          categories: [
            'Gas Cookers'
          ]
        },
        {
          name: 'Gas Grills',
          image: '/images/category-gas-grills.jpg',
          categories: [
            'Gas Grills'
          ]
        }
      ]
    }
  ],
  
  settings: [
    {
      common: {
        freeShippingMinPrice: 35,
        isMaintenanceMode: false,
        defaultTheme: 'Light',
        defaultColor: 'Gold',
        pageSize: 9,
      },
      site: {
        name: 'NxtAmzn',
        description:
          'NxtAmzn is a sample Ecommerce website built with Next.js, Tailwind CSS, and MongoDB.',
        keywords: 'Next Ecommerce, Next.js, Tailwind CSS, MongoDB',
        url: 'https://next-mongo-ecommerce-final.vercel.app',
        logo: '/icons/logo.svg',
        slogan: 'Spend less, enjoy more.',
        author: 'Next Ecommerce',
        copyright: '2000-2024, Next-Ecommerce.com, Inc. or its affiliates',
        email: 'admin@cdveiraltd.com',
        address: '123, Main Street, Anytown, CA, Zip 12345',
        phone: '+1 (123) 456-7890',
      },
      carousels: [
        {
          title: 'Most Popular Shoes For Sale',
          buttonCaption: 'Shop Now',
          image: '/images/banner3.jpg',
          url: './search?category=Shoes',
          textColor: '#FFFFFF',
        },
        {
          title: 'Best Sellers in T-Shirts',
          buttonCaption: 'Shop Now',
          image: '/images/banner1.jpg',
          url: './search?category=T-Shirts',
          textColor: '#FFFFFF',
        },
        {
          title: 'Best Deals on Wrist Watches',
          buttonCaption: 'See More',
          image: '/images/banner2.jpg',
          url: './search?category=Wrist Watches',
          textColor: '#FFFFFF',
        },
      ],
      availableLanguages: i18n.locales.map((locale) => ({
        code: locale.code,
        name: locale.name,
      })),
      defaultLanguage: 'en-US',
      availableCurrencies: [
        {
          name: 'United States Dollar',
          code: 'USD',
          symbol: '$',
          convertRate: 1,
        },
        { name: 'Euro', code: 'EUR', symbol: '€', convertRate: 0.96 },
        { name: 'UAE Dirham', code: 'AED', symbol: 'AED', convertRate: 3.67 },
      ],
      defaultCurrency: 'USD',
      availablePaymentMethods: [
        { name: 'PayPal', commission: 0 },
        { name: 'Stripe', commission: 0 },
        { name: 'Cash On Delivery', commission: 0 },
      ],
      defaultPaymentMethod: 'PayPal',
      availableDeliveryDates: [
        {
          name: 'Standard',
          daysToDeliver: 3,
          shippingPrice: 5,
          freeShippingMinPrice: 35,
        },
        {
          name: 'Express',
          daysToDeliver: 1,
          shippingPrice: 15,
          freeShippingMinPrice: 100,
        },
      ],
      defaultDeliveryDate: 'Standard',
    },
  ],
  
  webPages: [
    {
      title: 'About Us',
      slug: 'about-us',
      content: 'Welcome to our store. We sell high-quality products at affordable prices.',
      isPublished: true,
    },
    {
      title: 'Customer Service',
      slug: 'customer-service',
      content: 'Contact us at support@example.com for any issues with your order.',
      isPublished: true,
    },
    {
      title: 'Help',
      slug: 'help',
      content: 'Frequently asked questions and answers.',
      isPublished: true,
    },
  ],
  
  headerMenus: [
    {
      name: "Today's Deal",
      href: './search?tag=todays-deal',
    },
    {
      name: 'New Arrivals',
      href: './search?tag=new-arrival',
    },
    {
      name: 'Featured Products',
      href: './search?tag=featured',
    },
    {
      name: 'Best Sellers',
      href: './search?tag=best-seller',
    },
    {
      name: 'Browsing History',
      href: '/#browsing-history',
    },
    {
      name: 'Customer Service',
      href: '/page/customer-service',
    },
    {
      name: 'About Us',
      href: '/about',
    },
    {
      name: 'Help',
      href: '/page/help',
    },
  ],
  
  carousels: [
    {
      image: '/images/banner1.jpg',
      url: './search?category=T-Shirts',
      title: 'Best Sellers in T-Shirts',
      buttonCaption: 'Shop Now',
      isPublished: true,
    },
    {
      image: '/images/banner2.jpg',
      url: './search?category=Wrist Watches',
      title: 'Best Deals on Wrist Watches',
      buttonCaption: 'See More',
      isPublished: true,
    },
    {
      image: '/images/banner1.webp',
      url: './search?category=Shoes',
      title: 'Most Popular Shoes For Sale',
      buttonCaption: 'Shop Now',
      isPublished: true,
    },
  ],
}

export default data
