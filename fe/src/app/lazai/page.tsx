import { Suspense } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function LazAIPage() {
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
                LazAI Integration
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Leverage the power of LazAI for encrypted data upload and AI inference
              </p>
            </div>

            {/* LazAI Features */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Encrypted Upload</h3>
                <p className="text-gray-600">Securely upload your data with end-to-end encryption using LazAI framework.</p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Inference</h3>
                <p className="text-gray-600">Run AI models on your encrypted data without compromising privacy.</p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Anchoring</h3>
                <p className="text-gray-600">Create Data Anchoring Tokens (DATs) for your encrypted data assets.</p>
              </div>
            </div>

            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Upload Encrypted Data</h2>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                <div className="text-6xl text-gray-400 mb-4">🔒</div>
                <p className="text-lg text-gray-600 mb-4">Upload your data files for encryption and processing</p>
                <p className="text-sm text-gray-500 mb-4">Supported formats: CSV, JSON, XML, TXT, Images</p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
                  Choose Files
                </button>
              </div>
            </div>

            {/* DAT Management */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Data Anchoring Tokens (DATs)</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Create New DAT</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data Description
                      </label>
                      <input
                        type="text"
                        placeholder="Describe your data asset"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Query Price (LAZAI)
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        placeholder="0.001"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                      Mint DAT
                    </button>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Your DATs</h3>
                  <div className="space-y-3">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">Financial Data #1</h4>
                          <p className="text-sm text-gray-600">0.005 LAZAI per query</p>
                        </div>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Active</span>
                      </div>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">IoT Sensor Data #2</h4>
                          <p className="text-sm text-gray-600">0.002 LAZAI per query</p>
                        </div>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Pending</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Inference Section */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Run AI Inference</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select DAT
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option>Financial Data #1</option>
                    <option>IoT Sensor Data #2</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Query Type
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option>Data Analysis</option>
                    <option>Pattern Recognition</option>
                    <option>Predictive Modeling</option>
                    <option>Custom Query</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Query Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe what you want to analyze or predict..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="mt-6 flex justify-end">
                <button className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
                  Run Inference
                </button>
              </div>
            </div>
          </div>
        </Suspense>
      </main>

      <Footer />
    </div>
  )
}
