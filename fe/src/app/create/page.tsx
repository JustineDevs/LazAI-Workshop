import { Suspense } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function CreatePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <Navbar />

      <main className="flex-1">
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        }>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Create Data NFT
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Transform your data into a valuable NFT that generates continuous revenue
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <form className="space-y-8">
                {/* Data Upload Section */}
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Upload Your Data</h2>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                    <div className="text-6xl text-gray-400 mb-4">📁</div>
                    <p className="text-lg text-gray-600 mb-4">Drag and drop your data files here</p>
                    <p className="text-sm text-gray-500 mb-4">or</p>
                    <button
                      type="button"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                    >
                      Browse Files
                    </button>
                    <p className="text-xs text-gray-500 mt-2">
                      Supported formats: CSV, JSON, XML, TXT (Max 100MB)
                    </p>
                  </div>
                </div>

                {/* Data Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Financial Market Data 2024"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option>Financial Data</option>
                      <option>Health Data</option>
                      <option>IoT Data</option>
                      <option>Social Data</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe your data, its source, and potential use cases..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Pricing Section */}
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Set Pricing</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price per Query (LAZAI)
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        placeholder="0.001"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        License Type
                      </label>
                      <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option>Query-based (Pay per use)</option>
                        <option>Time-based (Monthly subscription)</option>
                        <option>Volume-based (Bulk pricing)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Advanced Settings */}
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Advanced Settings</h2>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="encryption"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="encryption" className="ml-2 text-sm text-gray-700">
                        Encrypt data for enhanced security
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="verification"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="verification" className="ml-2 text-sm text-gray-700">
                        Request data verification from LazAI
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="public"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="public" className="ml-2 text-sm text-gray-700">
                        Make data publicly discoverable
                      </label>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6 border-t border-gray-200">
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Save as Draft
                    </button>
                    <button
                      type="submit"
                      className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    >
                      Create Data NFT
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </Suspense>
      </main>

      <Footer />
    </div>
  )
}
