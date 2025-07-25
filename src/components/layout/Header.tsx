import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Printer, ShoppingCart, User, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { UserButtonSimple } from '@/components/UserButtonSimple';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/hooks/useCart';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export function Header() {
  const { user, loading } = useAuth();
  const { cart } = useCart();
  const location = useLocation();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Debug logging (commented out to prevent console spam)
  // console.log('🔍 HEADER: Render state:', {
  //   hasUser: !!user,
  //   userEmail: user?.email,
  //   loading,
  //   userProfile: user?.profile
  // });

  const navigation = [
    { name: 'All Products', href: '/products' },
    { name: 'Business Cards', href: '/products?category=business-cards' },
    { name: 'Flyers', href: '/products?category=flyers' },
    { name: 'Postcards', href: '/products?category=postcards' },
    { name: 'Banners', href: '/products?category=banners' },
  ];

  const isActive = (href: string) => {
    if (href === '/products') {
      return location.pathname === '/products' && !location.search;
    }
    return location.pathname + location.search === href;
  };

  return (
    <>
      <header className="bg-background shadow-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <Printer className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">GangRun</span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            
            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {/* Cart Button */}
              <Button variant="ghost" size="sm" className="relative" asChild>
                <Link to="/cart">
                  <ShoppingCart className="h-5 w-5" />
                  {cart.total_items > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs"
                    >
                      {cart.total_items}
                    </Badge>
                  )}
                </Link>
              </Button>
              
              {/* Theme Toggle */}
              <ThemeToggle />
              
              {/* Authentication */}
              {loading ? (
                <Button variant="outline" size="sm" disabled>
                  <User className="h-4 w-4 mr-2" />
                  Loading...
                </Button>
              ) : user ? (
                <UserButtonSimple />
              ) : (
                <Button variant="outline" size="sm" asChild>
                  <Link to="/auth">
                    <User className="h-4 w-4 mr-2" />
                    Sign In
                  </Link>
                </Button>
              )}

              {/* Mobile Menu Toggle */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="flex flex-col space-y-4 mt-6">
                    <div className="flex items-center space-x-2 mb-6">
                      <Printer className="h-6 w-6 text-blue-600" />
                      <span className="text-lg font-bold">GangRun</span>
                    </div>
                    
                    {/* Mobile Navigation */}
                    <nav className="flex flex-col space-y-3">
                      {navigation.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`px-3 py-2 rounded-md font-medium transition-colors ${
                            isActive(item.href)
                              ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </nav>

                    {/* Mobile Cart & Auth */}
                    <div className="border-t pt-4 mt-6">
                      <Link
                        to="/cart"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <div className="flex items-center space-x-3">
                          <ShoppingCart className="h-5 w-5" />
                          <span>Shopping Cart</span>
                        </div>
                        {cart.total_items > 0 && (
                          <Badge variant="secondary">{cart.total_items}</Badge>
                        )}
                      </Link>
                      
                      {loading ? (
                        <Button 
                          variant="outline" 
                          className="w-full mt-3" 
                          disabled
                        >
                          <User className="h-4 w-4 mr-2" />
                          Loading...
                        </Button>
                      ) : !user && (
                        <Button 
                          onClick={() => {
                            setMobileMenuOpen(false);
                            setAuthModalOpen(true);
                          }} 
                          variant="outline" 
                          className="w-full mt-3"
                        >
                          <User className="h-4 w-4 mr-2" />
                          Sign In
                        </Button>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </>
  );
}