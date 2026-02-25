
import { MetadataRoute } from 'next'
import { defaultSchoolInfo } from '@/lib/school-info'
 
export default function manifest(): MetadataRoute.Manifest {
  const iconUrl = 'https://storage.googleapis.com/project-spark-348216.appspot.com/2024-07-31T17:15:53.682Z/user_uploads/e6900f68-7c87-4b71-af36-a19f6f69a844/school-logo.png?v=15';
  
  return {
    name: defaultSchoolInfo.name,
    short_name: 'My School',
    description: 'A central hub for school management.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F0FAF9',
    theme_color: '#2f2a8a',
    icons: [
      {
        src: iconUrl,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: iconUrl,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  }
}
