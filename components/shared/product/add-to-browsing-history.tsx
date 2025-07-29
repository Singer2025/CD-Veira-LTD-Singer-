'use client'
import useBrowsingHistory from '@/hooks/use-browsing-history'
import { useEffect } from 'react'

export default function AddToBrowsingHistory({
  id,
  category,
}: {
  id: string
  category: string
}) {
  const { addItem } = useBrowsingHistory()
  
  useEffect(() => {
    if (!id || !category) {
      console.warn('AddToBrowsingHistory: Missing id or category');
      return;
    }

    // Add item with a small delay to ensure proper client-side hydration
    const timeoutId = setTimeout(() => {
      try {
        addItem({ id, category });
        console.log('Added to browsing history:', { id, category });
      } catch (error) {
        console.error('Failed to add to browsing history:', error);
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [id, category, addItem])

  return null
}
