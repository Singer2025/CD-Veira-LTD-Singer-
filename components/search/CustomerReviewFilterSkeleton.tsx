export default function CustomerReviewFilterSkeleton() {
  return (
    <div className='py-4 px-4 bg-white dark:bg-gray-900 animate-pulse'>
      <div className='h-6 bg-gray-200 rounded w-1/2 mb-3'></div>
      <div className="border-l-2 border-primary/20 pl-3 py-1">
        <ul className='space-y-2'>
          <li className="h-8 bg-gray-200 rounded"></li>
          <li className="h-8 bg-gray-200 rounded"></li>
        </ul>
      </div>
    </div>
  )
}