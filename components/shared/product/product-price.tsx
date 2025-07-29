'use client'
import useSettingStore from '@/hooks/use-setting-store'
import { cn, round2 } from '@/lib/utils'
import { useFormatter } from 'next-intl'

const ProductPrice = ({
  price,
  className,
  listPrice = 0,
  plain = false,
}: {
  price: number
  listPrice?: number
  className?: string
  plain?: boolean
}) => {
  const { getCurrency } = useSettingStore()
  const currency = getCurrency()
  const convertedPrice = round2(currency.convertRate * price);
  // Ensure listPrice is treated as a number and handle potential null/undefined
  const safeListPrice = listPrice ?? price;
  const convertedListPrice = round2(currency.convertRate * safeListPrice);

  const format = useFormatter();

  // Calculate discount only if listPrice is greater than price
  const discountPercent =
    convertedListPrice > convertedPrice
      ? Math.round(100 - (convertedPrice / convertedListPrice) * 100)
      : 0;

  // Special case for zero prices
  if (convertedPrice === 0) {
    return plain ? (
      format.number(0, {
        style: 'currency',
        currency: currency.code,
        currencyDisplay: 'narrowSymbol',
      })
    ) : (
      <div className={cn('text-xl font-bold text-gray-900', className)}>
        {format.number(0, {
          style: 'currency',
          currency: currency.code,
          currencyDisplay: 'narrowSymbol',
        })}
      </div>
    );
  }

  if (plain) {
    return format.number(convertedPrice, {
      style: 'currency',
      currency: currency.code,
      currencyDisplay: 'narrowSymbol',
    });
  }

  const priceContent = format.number(convertedPrice, {
    style: 'currency',
    currency: currency.code,
    currencyDisplay: 'narrowSymbol',
  });

  if (convertedListPrice > convertedPrice) {
    const listPriceContent = format.number(convertedListPrice, {
      style: 'currency',
      currency: currency.code,
      currencyDisplay: 'narrowSymbol',
    });

    return (
      <div className={cn('flex items-baseline gap-2', className)}>
        <span className="text-xl font-bold text-gray-900">
          {priceContent}
        </span>
        <span className="text-sm line-through text-gray-500">
          {listPriceContent}
        </span>
        <span className="text-xs font-medium text-white bg-primary px-2 py-0.5 rounded-full animate-pulse-slow">
          {discountPercent}% off
        </span>
      </div>
    );
  }

  return (
    <div className={className}>
      <span className="text-xl font-bold text-gray-900">
        {priceContent}
      </span>
    </div>
  );
}

export default ProductPrice
