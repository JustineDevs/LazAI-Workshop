import { Suspense } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { HomePage } from '@/components/pages/HomePage'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        }>
          <HomePage />
        </Suspense>
      </main>
      
      <Footer />
    </div>
  )
}