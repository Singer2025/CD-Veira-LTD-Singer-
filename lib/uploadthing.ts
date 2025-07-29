import {
  generateUploadButton,
  generateUploadDropzone,
  generateReactHelpers,
} from '@uploadthing/react'
import type { OurFileRouter } from '@/app/api/uploadthing/core'

export const UploadButton = generateUploadButton<OurFileRouter>()
export const UploadDropzone = generateUploadDropzone<OurFileRouter>()

export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>()

// Helper function to verify image URLs
export const verifyImageUrl = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};
