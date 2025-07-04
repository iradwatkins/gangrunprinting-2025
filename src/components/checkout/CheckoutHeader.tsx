import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Printer, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CheckoutHeader() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Back Button */}
          <div className="flex items-center space-x-4">
            <Link to="/cart">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Cart
              </Button>
            </Link>
            <div className="h-6 w-px bg-gray-300" />
            <Link to="/" className="flex items-center space-x-2">
              <Printer className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">GangRun</span>
            </Link>
          </div>
          
          {/* Security Badge */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Shield className="w-4 h-4 text-green-600" />
            <span className="hidden sm:inline">Secure Checkout</span>
          </div>
        </div>
      </div>
    </header>
  );
}