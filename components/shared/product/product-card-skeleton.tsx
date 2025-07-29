import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { motion } from 'framer-motion'

export default function ProductCardSkeleton() {
  // Animation variants for skeleton card
  const skeletonVariants = {
    initial: { opacity: 0.6 },
    animate: { opacity: 1 },
  };

  return (
    <motion.div
      className="rounded-xl overflow-hidden border border-gray-200 h-full"
      variants={skeletonVariants}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
    >
      <SkeletonTheme baseColor="#e0e0e0" highlightColor="#f5f5f5">
        <Card className="h-full overflow-hidden rounded-xl shadow-sm border-0">
          <CardHeader className="p-0 relative">
            <div className="aspect-square bg-gray-50">
              <Skeleton height="100%" className="rounded-t-xl" />
            </div>
            {/* Skeleton for badges */}
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
              <Skeleton width={60} height={20} className="rounded-full" />
              <Skeleton width={90} height={20} className="rounded-full" />
            </div>
            {/* Skeleton for quick action buttons */}
            <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
              <Skeleton width={36} height={36} circle />
              <Skeleton width={36} height={36} circle />
            </div>
          </CardHeader>
          <CardContent className="p-5 flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              <Skeleton width="40%" height={12} />
              <Skeleton count={2} height={16} />
              <div className="pt-3">
                <Skeleton width="60%" height={20} />
              </div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} width={16} height={16} circle />
                ))}
              </div>
              <Skeleton width="30%" height={12} />
            </div>
          </CardContent>
          <CardFooter className="px-5 pb-5 pt-2">
            <Skeleton height={40} className="rounded-lg" />
          </CardFooter>
        </Card>
      </SkeletonTheme>
    </motion.div>
  )
}