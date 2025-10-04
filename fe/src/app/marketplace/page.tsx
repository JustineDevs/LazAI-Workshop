import { Suspense } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <Navbar />

      <main className="flex-1">
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        }>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Marketplace
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Discover and purchase data NFTs from creators around the world
              </p>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search data NFTs..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-2">
                  <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option>All Categories</option>
                    <option>Financial Data</option>
                    <option>Health Data</option>
                    <option>IoT Data</option>
                    <option>Social Data</option>
                  </select>
                  <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Newest First</option>
                    <option>Most Popular</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Data NFTs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Sample Data NFT Cards */}
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="h-48 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                    <div className="text-6xl text-blue-600">📊</div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Sample Data NFT #{item}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      High-quality dataset for AI training and analysis
                    </p>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-2xl font-bold text-blue-600">0.5 LAZAI</span>
                      <span className="text-sm text-gray-500">per query</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
                        View Details
                      </button>
                      <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors">
                        Purchase
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            <div className="text-center mt-12">
              <button className="bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-8 rounded-lg border border-gray-300 transition-colors">
                Load More Data NFTs
              </button>
            </div>
          </div>
        </Suspense>
      </main>

      <Footer />
    </div>
  )
}
