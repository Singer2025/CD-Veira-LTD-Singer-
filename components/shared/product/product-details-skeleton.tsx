import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export default function ProductDetailsSkeleton() {
  return (
    <SkeletonTheme baseColor="#e0e0e0" highlightColor="#f5f5f5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="aspect-square">
              <Skeleton height="100%" />
            </div>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="aspect-square">
                  <Skeleton height="100%" />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <Skeleton width="40%" height={30} />
            <Skeleton height={40} />
            <Skeleton width="60%" height={30} />
            <Skeleton count={4} />
            <Skeleton height={50} />
          </div>
        </div>
      </div>
    </SkeletonTheme>
  )
}