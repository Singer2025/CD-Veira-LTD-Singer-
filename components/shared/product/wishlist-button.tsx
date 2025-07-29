'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import useWishlistStore, { WishlistItem } from '@/hooks/use-wishlist-store';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface WishlistButtonProps {
  product: {
    id: string;
    name: string;
    slug: string;
    image: string;
    price: number;
    listPrice?: number;
    brand: string;
    category: string;
    countInStock: number;
    color?: string;
    size?: string;
  };
  variant?: 'icon' | 'button';
  className?: string;
}

export default function WishlistButton({ product, variant = 'icon', className = '' }: WishlistButtonProps) {
  const t = useTranslations('Product');
  const { addItem, removeItem, isInWishlist } = useWishlistStore();
  const [isAnimating, setIsAnimating] = useState(false);
  
  const inWishlist = isInWishlist(product.id);

  const handleToggleWishlist = () => {
    setIsAnimating(true);
    
    if (inWishlist) {
      removeItem(product.id);
    } else {
      const wishlistItem: WishlistItem = {
        ...product,
        addedAt: new Date()
      };
      addItem(wishlistItem);
    }
    
    // Reset animation state after animation completes
    setTimeout(() => setIsAnimating(false), 500);
  };

  if (variant === 'icon') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              onClick={handleToggleWishlist}
              className={`p-1.5 rounded-full shadow-sm transition-colors ${inWishlist ? 'bg-red-50' : 'bg-white/80 hover:bg-white'} ${className}`}
              aria-label={inWishlist ? t('Remove from Wishlist') : t('Add to Wishlist')}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={inWishlist ? 'filled' : 'outline'}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Heart 
                    size={18} 
                    className={inWishlist ? 'fill-red-600 text-red-600' : 'text-gray-600'} 
                    fill={inWishlist ? 'currentColor' : 'none'}
                  />
                </motion.div>
              </AnimatePresence>
              {isAnimating && (
                <motion.div 
                  className="absolute inset-0 rounded-full bg-red-100"
                  initial={{ scale: 0.2, opacity: 1 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{inWishlist ? t('Remove from Wishlist') : t('Add to Wishlist')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return (
    <Button 
      variant="outline" 
      className={`rounded-full flex items-center justify-center space-x-2 ${className}`}
      onClick={handleToggleWishlist}
    >
      <Heart 
        className={inWishlist ? 'fill-red-600 text-red-600' : 'text-gray-600'} 
        fill={inWishlist ? 'currentColor' : 'none'}
        size={16}
      />
      <span>{inWishlist ? t('Remove from Wishlist') : t('Add to Wishlist')}</span>
    </Button>
  );
}