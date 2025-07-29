'use client'

import ImageWithFallback from '@/components/shared/image-with-fallback'
import { Link } from '@/i18n/routing'
import React from 'react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

type CardItem = {
  title: string
  link: { text: string; href: string }
  items: {
    name: string
    items?: string[]
    image: string
    href: string
  }[]
}

export function HomeCard({ cards }: { cards: CardItem[] }) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[var(--space-md)]'>
      {cards.map((card) => (
        <Card
          key={card.title}
          className='rounded-[var(--radius-lg)] shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden border border-[var(--color-medium)]'
        >
          <CardContent className='p-[var(--space-md)] flex-1'>
            <h3 className='text-[var(--text-heading-3)] font-bold mb-[var(--space-md)] relative pl-3 before:content-[""] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-[var(--color-primary)] before:rounded-full'>
              {card.title}
            </h3>
            <div className='grid grid-cols-2 gap-[var(--space-sm)]'>
              {card.items.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className='flex flex-col group'
                >
                  <div className="relative overflow-hidden rounded-[var(--radius-md)] mb-[var(--space-sm)] transition-transform duration-300 group-hover:scale-[1.03] z-10">
                    <div className="relative w-full aspect-square bg-gray-100 rounded-[var(--radius-md)]">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        fill
                        className='object-cover rounded-[var(--radius-md)]'
                        sizes="(max-width: 768px) 50vw, 25vw"
                        priority
                        fallbackSrc="/images/default-category.jpg"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-primary)]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"></div>
                  </div>
                  <p className='text-center text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis text-[var(--color-dark)] group-hover:text-[var(--color-primary)] transition-colors duration-200'>
                    {item.name}
                  </p>
                </Link>
              ))}
            </div>
          </CardContent>
          {card.link && (
            <CardFooter className="p-[var(--space-sm)] border-t border-[var(--color-medium)] bg-[var(--color-light)]">
              <Link
                href={card.link.href}
                className='w-full text-center text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-colors duration-200 flex items-center justify-center py-[var(--space-sm)]'
              >
                {card.link.text}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  )
}
