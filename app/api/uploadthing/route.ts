import { createRouteHandler } from 'uploadthing/next'

import { ourFileRouter } from './core'

// Export routes for Next App Router
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,

  // Apply configuration using the UPLOADTHING_TOKEN from environment variables
  config: {
    uploadthingToken: process.env.UPLOADTHING_TOKEN
  },
})
