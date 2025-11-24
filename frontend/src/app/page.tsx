import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Welcome to Real Estate Management
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Buy, sell, and manage properties with ease. Your one-stop platform for all real estate needs.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/properties"
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Browse Properties
          </Link>
          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Get Started
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-blue-600 text-4xl mb-3">🏠</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Browse Listings</h3>
            <p className="text-gray-600 text-sm">
              Explore a wide variety of properties tailored to your needs
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-blue-600 text-4xl mb-3">💼</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">List Your Property</h3>
            <p className="text-gray-600 text-sm">
              Easily create and manage your property listings
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-blue-600 text-4xl mb-3">📊</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Track Performance</h3>
            <p className="text-gray-600 text-sm">
              Monitor your listings and market trends from your dashboard
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
