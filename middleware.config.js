export const config = {
  runtime: 'nodejs',
  unstable_allowDynamic: [
    '**/node_modules/@babel/runtime/regenerator/index.js',
    '**/node_modules/next-auth/**',
    // Add next-intl to the allowed dynamic imports
    '**/node_modules/next-intl/**',
  ],
}