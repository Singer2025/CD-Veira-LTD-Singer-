'use client'
import { useState, useTransition } from 'react'

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

export default function DeleteDialog({
  id,
  action,
  callbackAction,
  buttonText = 'Delete',
  buttonVariant = 'outline',
  buttonSize = 'sm',
  title = 'Are you absolutely sure?',
  description = 'This action cannot be undone.',
  ids,
}: {
  id?: string
  action: (id: string | string[]) => Promise<{ success: boolean; message: string }>
  callbackAction?: () => void
  buttonText?: string
  buttonVariant?: 'outline' | 'destructive' | 'default'
  buttonSize?: 'sm' | 'default' | 'lg'
  title?: string
  description?: string
  ids?: string[]
}) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  
  // Determine if we're deleting multiple items or a single item
  const isMultiDelete = ids && ids.length > 0
  const itemToDelete = isMultiDelete ? ids : id
  
  const handleDelete = async () => {
    if (!itemToDelete) return
    
    startTransition(async () => {
      try {
        const res = await action(itemToDelete)
        if (!res.success) {
          toast({
            variant: 'destructive',
            description: res.message,
          })
        } else {
          // Only close the dialog after successful deletion
          toast({
            description: res.message,
          })
          // Execute callback after successful deletion
          if (callbackAction) callbackAction()
          // Close the dialog after the callback has been executed
          setOpen(false)
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          description: error instanceof Error ? error.message : 'An error occurred during deletion',
        })
      }
    })
  }
  
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button size={buttonSize} variant={buttonVariant}>
          {buttonText}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="fixed z-50">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {isMultiDelete 
              ? `You are about to delete ${ids.length} selected item${ids.length > 1 ? 's' : ''}.` 
              : description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>

          <Button
            variant='destructive'
            size='sm'
            disabled={isPending}
            onClick={handleDelete}
          >
            {isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
