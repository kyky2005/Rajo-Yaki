import { rmSync } from 'node:fs'

// Some repository export workflows preserve files that were deleted during the
// Payload-to-Supabase migration. Remove those stale sources before Next scans
// the App Router so Vercel always builds the Supabase application.
const legacyPaths = [
  'figma-image-loader.ts',
  'src/app/(payload)',
  'src/collections',
  'src/globals',
  'src/lib/payload.ts',
  'src/payload-types.ts',
  'src/payload.config.ts',
]

for (const path of legacyPaths) {
  rmSync(path, { force: true, recursive: true })
}
