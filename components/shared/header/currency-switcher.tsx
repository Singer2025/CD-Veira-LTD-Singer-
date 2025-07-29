'use client'

import { useTranslations } from 'next-intl'
import useSettingStore from '@/hooks/use-setting-store'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select' // Assuming this is the correct path to your ShadCN/Radix Select

export default function CurrencySwitcher() {
  const t = useTranslations()
  const {
    setting: { availableCurrencies, currency },
    setCurrency,
  } = useSettingStore()

  if (!availableCurrencies || availableCurrencies.length === 0) {
    return null // Don't render if no currencies are available
  }

  const handleCurrencyChange = (newCurrencyCode: string) => {
    setCurrency(newCurrencyCode)
    // Optionally, you might want to refresh data or redirect,
    // but for now, just setting the currency in the store.
  }

  // const currentCurrencyLabel = availableCurrencies.find(c => c.code === currency)?.name || currency // Unused variable

  return (
    <div className="flex items-center">
      <span className="mr-2 text-xs whitespace-nowrap">{t('Header.TransactionCurrency') || 'Transaction Currency'}:</span>
      <Select value={currency} onValueChange={handleCurrencyChange}>
        <SelectTrigger className="text-xs h-7 px-2 py-1 border-none bg-transparent hover:bg-white/10 focus:ring-0 min-w-[80px]">
          <SelectValue placeholder={t('Footer.Select a currency')} /> {/* Re-using a key, or create a new one */}
        </SelectTrigger>
        <SelectContent className="bg-red-700 text-white">
          {availableCurrencies
            .filter((c) => c.code)
            .map((curr) => (
              <SelectItem
                key={curr.code}
                value={curr.code}
                className="text-xs hover:bg-red-600 focus:bg-red-600"
              >
                {curr.name} ({curr.code})
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  )
}