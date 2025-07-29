import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { UploadThingError } from 'uploadthing/server'
import { authOptions } from '@/auth'
import { getServerSession } from 'next-auth/next'

const f = createUploadthing()

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({
    image: {
      maxFileSize: '8MB',
      maxFileCount: 10
    }
  })
    // Set permissions and file types for this FileRoute
    .middleware(async () => {
      // This code runs on your server before upload
      const session = await getServerSession(authOptions)

      // If you throw, the user will not be able to upload
      if (!session) throw new UploadThingError('Unauthorized')

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: session?.user?.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log('Banner upload starting callback processing:', { 
        fileUrl: file.url,
        fileKey: file.key,
        fileName: file.name,
        userId: metadata.userId 
      });

      try {
        if (!file.url) {
          throw new Error('Banner file URL is missing from upload response');
        }

        // Validate that the URL is accessible
        const urlResponse = await fetch(file.url, { method: 'HEAD' });
        if (!urlResponse.ok) {
          throw new Error(`Banner file URL validation failed with status ${urlResponse.status}`);
        }

        const result = {
          url: file.url,
          key: file.key,
          name: file.name,
          uploadedBy: metadata.userId
        };

        console.log('Banner upload callback completed successfully:', result);
        return result;
      } catch (error) {
        console.error('Banner upload callback processing error:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          file: file.name,
          userId: metadata.userId
        });
        throw new UploadThingError(`Failed to process banner upload: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }),

  // Add categoryBanner endpoint for banner image uploads
  categoryBanner: f({
    image: {
      maxFileSize: '8MB',
      maxFileCount: 1
    }
  })
    // Set permissions and file types for this FileRoute
    .middleware(async () => {
      // This code runs on your server before upload
      const session = await getServerSession(authOptions)

      // If you throw, the user will not be able to upload
      if (!session) throw new UploadThingError('Unauthorized')

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: session?.user?.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log('Upload starting callback processing:', { 
        fileUrl: file.url,
        fileKey: file.key,
        fileName: file.name,
        userId: metadata.userId 
      });

      try {
        if (!file.url) {
          throw new Error('File URL is missing from upload response');
        }

        // Validate that the URL is accessible
        const urlResponse = await fetch(file.url, { method: 'HEAD' });
        if (!urlResponse.ok) {
          throw new Error(`File URL validation failed with status ${urlResponse.status}`);
        }

        const result = {
          url: file.url,
          key: file.key,
          name: file.name,
          uploadedBy: metadata.userId
        };

        console.log('Upload callback completed successfully:', result);
        return result;
      } catch (error) {
        console.error('Upload callback processing error:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          file: file.name,
          userId: metadata.userId
        });
        throw new UploadThingError(`Failed to process upload: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
