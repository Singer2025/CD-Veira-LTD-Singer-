'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { Eye, Heart, ShoppingCart, Star, Clock, Check } from 'lucide-react';
import { motion } from 'framer-motion';

import { IProduct } from '@/types/product.model';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import ProductPrice from '@/components/shared/product/product-price';
import Rating from '@/components/shared/product/rating';
import FulfillmentOptions from '@/components/shared/product/fulfillment-options';
import { formatNumber } from '@/lib/utils';

interface ProductCardProps {
  product: IProduct
  hideDetails?: boolean
  hideBorder?: boolean
}

// Animation variants for card and image hover effects
const cardVariants = {
  initial: { y: 0, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' },
  hover: { y: -8, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' },
};

const imageVariants = {
  initial: { scale: 1 },
  hover: { scale: 1.05 },
};

const quickActionVariants = {
  initial: { opacity: 0, x: 20 },
  hover: { opacity: 1, x: 0, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const buttonVariants = {
  initial: { opacity: 0, y: 10, scale: 0.95 },
  hover: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2, ease: "easeOut" } },
};

const badgeVariants = {
  initial: { scale: 1 },
  hover: { scale: 1.05, transition: { duration: 0.2 } },
};

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  hideDetails = false,
  hideBorder = false,
}): React.ReactElement => {
  // Set debug mode to false to hide the test component
  const debugMode = false;
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlistActive, setIsWishlistActive] = useState(false);
  
  // Extract brand name safely
  const safeBrand = typeof product.brand === 'object' ? '' : String(product.brand || '');
  
  // Determine if product is a best seller or new arrival
  const isBestSeller = product.tags?.includes('best-seller') || false;
  const isNewArrival = product.tags?.includes('new arrival') || false;
  
  const hasDiscount = product.listPrice && product.price && product.listPrice > product.price;
  const discountPercentage = hasDiscount && product.listPrice && product.price
    ? Math.round(((product.listPrice - product.price) / product.listPrice) * 100)
    : 0;
    
  // We're using the animation variants defined at the top of the file

  const ProductImage = () => {
    const [hasError, setHasError] = useState(false);
    
    const primaryImage = product.images?.[0] || '';
    const secondaryImage = product.images?.[1] || '';
    
    return (
      <div
        className="relative aspect-square overflow-hidden rounded-t-xl bg-white"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link href={product.slug ? `/product/${product.slug}` : '#'}
          className='relative h-full w-full bg-white block'
        >
          {/* Primary Image with Motion */}
          <motion.div 
            className="absolute inset-0 z-10"
            variants={imageVariants}
            initial="initial"
            animate={isHovered ? "hover" : "initial"}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <Image
              src={hasError ? '/images/default-product.png' : (primaryImage || '/images/default-product.png')}
              alt={product.name || 'Product Image'}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-contain p-4 transition-all duration-300"
              onError={() => setHasError(true)}
              priority={false}
              loading="lazy"
              unoptimized={true}
            />
          </motion.div>
          
          {/* Secondary Image with Motion */}
          {secondaryImage && !hasError && (
            <motion.div 
              className="absolute inset-0 z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <Image
                src={secondaryImage}
                alt={`${product.name || 'Product'} - Alternate View`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-contain p-4 transition-all duration-300"
                onError={() => setHasError(true)}
                priority={false}
                loading="lazy"
                unoptimized={true}
              />
            </motion.div>
          )}
        </Link>

        {/* Quick Action Buttons */}
        <motion.div 
          className="absolute top-3 right-3 z-30 flex flex-col gap-2"
          variants={quickActionVariants}
          initial="initial"
          animate={isHovered ? "hover" : "initial"}
        >
          <motion.div variants={buttonVariants}>
            <Button 
              size="icon" 
              variant="secondary" 
              className={`w-9 h-9 rounded-full bg-white hover:bg-primary hover:text-white shadow-lg transition-all duration-300 ${isWishlistActive ? 'bg-primary text-white' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                setIsWishlistActive(!isWishlistActive);
              }}
            >
            <Heart className={`h-4 w-4 ${isWishlistActive ? 'fill-current' : ''}`} />
            </Button>
          </motion.div>
          <motion.div variants={buttonVariants}>
            <Button 
              size="icon" 
              variant="secondary" 
              className="w-9 h-9 rounded-full bg-white hover:bg-primary hover:text-white shadow-lg transition-all duration-300"
              onClick={(e) => e.preventDefault()}
            >
            <Eye className="h-4 w-4" />
            </Button>
          </motion.div>
          <motion.div variants={buttonVariants}>
            <Button 
              size="icon" 
              variant="secondary" 
              className="w-9 h-9 rounded-full bg-white hover:bg-primary hover:text-white shadow-lg transition-all duration-300"
              onClick={(e) => e.preventDefault()}
            >
            <ShoppingCart className="h-4 w-4" />
            </Button>
          </motion.div>
        </motion.div>

        {/* Badges */}
        <motion.div className="absolute top-3 left-3 z-30 flex flex-col gap-1.5 transition-all duration-300">
          {hasDiscount && discountPercentage > 0 && (
            <motion.div variants={badgeVariants}>
              <Badge className="bg-red-600 text-white border-0 px-2.5 py-1 text-xs font-medium rounded-full shadow-md transition-transform duration-300">
              {discountPercentage}% OFF
              </Badge>
            </motion.div>
          )}
          {isBestSeller && (
            <motion.div variants={badgeVariants}>
              <Badge variant="secondary" className="bg-amber-400 text-amber-900 border-0 px-2.5 py-1 text-xs font-medium rounded-full shadow-md flex items-center gap-1 transition-transform duration-300">
              <Star className="h-3 w-3 fill-amber-900" /> Best Seller
              </Badge>
            </motion.div>
          )}
          {isNewArrival && (
            <motion.div variants={badgeVariants}>
              <Badge variant="secondary" className="bg-emerald-400 text-emerald-900 border-0 px-2.5 py-1 text-xs font-medium rounded-full shadow-md flex items-center gap-1 transition-transform duration-300">
              <Clock className="h-3 w-3" /> New Arrival
              </Badge>
            </motion.div>
          )}
          {product.countInStock === 0 && (
            <motion.div variants={badgeVariants}>
              <Badge variant="secondary" className="bg-gray-800 text-white border-0 px-2.5 py-1 text-xs font-medium rounded-full shadow-md transition-transform duration-300">
              Out of Stock
              </Badge>
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  };

  const ProductDetails = () => {
    return (
      <div className="space-y-3 h-full flex flex-col">
        {/* Brand Name */}
        {safeBrand && (
          <Link 
            href={`./search?brand=${safeBrand}`}
            className="text-xs font-medium text-primary/80 hover:text-primary transition-colors inline-block hover:underline"
          >
            {safeBrand}
          </Link>
        )}
        
        {/* Product Name */}
        <Link
          href={product.slug ? `/product/${product.slug}` : '#'}
          className='line-clamp-2 min-h-[2.5rem] font-medium text-gray-800 hover:text-primary transition-colors group-hover:text-primary/90 hover:underline'
        >
          {product.name}
        </Link>
        
        {/* Price Section */}
        <div className="mt-auto pt-3">
          <ProductPrice 
            price={product.price || 0}
            listPrice={product.listPrice}
            className="text-sm font-semibold"
          />
        </div>
        
        {/* Rating and Reviews */}
        <div className='flex items-center gap-2'>
          <Rating rating={product.avgRating || 0} size={16} />
          {product.numReviews > 0 && (
            <span className="text-xs text-muted-foreground">({formatNumber(product.numReviews)} {product.numReviews === 1 ? 'review' : 'reviews'})</span>
          )}
        </div>

        {/* Stock Status */}
        {product.countInStock > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <Check className="h-3.5 w-3.5" />
            <span>In Stock</span>
          </div>
        )}
        
        {/* Fulfillment Options */}
        {(product.isShippable || product.isPickupAvailable) && (
          <div>
            <FulfillmentOptions 
              product={product} 
              iconSize={16} 
              showLabels={false}
              compact={true}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Debug component removed */}
      <motion.div
        className={`
          group flex flex-col h-full overflow-hidden rounded-xl
          ${!hideBorder ? 'border border-gray-200 hover:border-primary/20' : ''}
        `}
        variants={cardVariants}
        initial="initial"
        whileHover="hover"
        transition={{ duration: 0.3 }}
      >
        <Card className="border-0 shadow-none bg-white rounded-xl overflow-hidden h-full">
          <CardHeader className='p-0 relative overflow-hidden group'>
            <ProductImage />
          </CardHeader>
          {!hideDetails && (
            <>
              <CardContent className='p-5 flex-1 flex flex-col justify-between'>
                <ProductDetails />
              </CardContent>
              <CardFooter className='px-5 pb-5 pt-2'>
                <Button asChild className="w-full group relative overflow-hidden bg-primary hover:bg-primary/90 transition-all duration-300 transform hover:scale-[1.02] rounded-lg font-medium">
                  <Link href={product.slug ? `/product/${product.slug}` : '#'}>
                    More Details
                  </Link>
                </Button>
              </CardFooter>
            </>
          )}
        </Card>
      </motion.div>
    </>
  );
};

export default ProductCard;
