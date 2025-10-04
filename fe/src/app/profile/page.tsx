import { Suspense } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <Navbar />

      <main className="flex-1">
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        }>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Profile
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Manage your account, data NFTs, and earnings
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Profile Information */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl text-blue-600">👤</span>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">John Doe</h2>
                    <p className="text-gray-600 mb-4">john.doe@example.com</p>
                    <p className="text-sm text-gray-500">0x1234...5678</p>
                  </div>
                </div>

                {/* Wallet Balance */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Wallet Balance</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">LAZAI</span>
                      <span className="font-medium">2.456 LAZAI</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">DAT Tokens</span>
                      <span className="font-medium">15.789 DAT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">USD Value</span>
                      <span className="font-medium">$1,234.56</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Account Settings */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Settings</h2>
                  <form className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Username
                        </label>
                        <input
                          type="text"
                          defaultValue="johndoe"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          defaultValue="john.doe@example.com"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Tell us about yourself..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
                        Update Profile
                      </button>
                    </div>
                  </form>
                </div>

                {/* My Data NFTs */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">My Data NFTs</h2>
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">Financial Market Data</h3>
                          <p className="text-sm text-gray-600">Created 2 days ago</p>
                          <p className="text-sm text-gray-500">0.005 LAZAI per query</p>
                        </div>
                        <div className="flex space-x-2">
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Active</span>
                          <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                        </div>
                      </div>
                      <div className="mt-2 flex justify-between text-sm text-gray-600">
                        <span>Queries: 1,234</span>
                        <span>Earnings: 6.17 LAZAI</span>
                      </div>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">IoT Sensor Data</h3>
                          <p className="text-sm text-gray-600">Created 1 week ago</p>
                          <p className="text-sm text-gray-500">0.002 LAZAI per query</p>
                        </div>
                        <div className="flex space-x-2">
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Pending</span>
                          <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                        </div>
                      </div>
                      <div className="mt-2 flex justify-between text-sm text-gray-600">
                        <span>Queries: 0</span>
                        <span>Earnings: 0 LAZAI</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Earnings History */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Earnings History</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Data NFT
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Queries
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Earnings
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">2024-09-20</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Financial Market Data</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">156</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">0.78 LAZAI</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">2024-09-19</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Financial Market Data</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">89</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">0.45 LAZAI</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">2024-09-18</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Financial Market Data</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">234</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">1.17 LAZAI</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Suspense>
      </main>

      <Footer />
    </div>
  )
}
