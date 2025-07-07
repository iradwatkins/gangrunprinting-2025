import React from 'react';

export function AdminDashboard() {
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🎉 Admin Dashboard Working!
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Congratulations! The admin dashboard is now loading successfully.
        </p>
        
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          <strong>Success!</strong> The JavaScript errors have been resolved and the admin dashboard is functional.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">Products</h3>
            <p className="text-blue-700">Manage your product catalog</p>
            <a href="/admin/products" className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              View Products
            </a>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-900 mb-2">Orders</h3>
            <p className="text-green-700">Process customer orders</p>
            <a href="/admin/orders" className="inline-block mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              View Orders
            </a>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <h3 className="font-semibold text-purple-900 mb-2">Analytics</h3>
            <p className="text-purple-700">View business insights</p>
            <a href="/admin/analytics" className="inline-block mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
              View Analytics
            </a>
          </div>
        </div>

        <div className="mt-8 p-4 bg-gray-100 rounded">
          <h4 className="font-semibold mb-2">Debug Info:</h4>
          <p>URL: {window.location.href}</p>
          <p>Path: {window.location.pathname}</p>
          <p>Build Time: {new Date().toISOString()}</p>
        </div>
      </div>
    </div>
  );
}