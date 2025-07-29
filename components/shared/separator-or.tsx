import { ReactNode } from 'react'

const SeparatorWithOr = ({ children }: { children?: ReactNode }) => {
  return (
    <div className='h-5 border-b border-gray-200 my-6 text-center w-full relative'>
      <span className='bg-white absolute left-1/2 -translate-x-1/2 px-4 text-sm text-gray-400 font-medium'>
        {children ?? 'or'}
      </span>
    </div>
  )
}

export default SeparatorWithOr
