import React from 'react';
import { Link } from 'react-router-dom';

export function CheckoutFooter() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          {/* Help Links */}
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <Link to="/support" className="hover:text-gray-900">
              Need Help?
            </Link>
            <Link to="/shipping" className="hover:text-gray-900">
              Shipping Info
            </Link>
            <Link to="/returns" className="hover:text-gray-900">
              Returns
            </Link>
            <Link to="/terms" className="hover:text-gray-900">
              Terms
            </Link>
            <Link to="/privacy" className="hover:text-gray-900">
              Privacy
            </Link>
          </div>
          
          {/* Security and Trust */}
          <div className="text-sm text-gray-500">
            <span>© 2024 GangRun Printing. Secured by SSL encryption.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}