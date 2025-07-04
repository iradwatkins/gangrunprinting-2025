
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { AuthModal } from '@/components/auth/AuthModal';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ShoppingCart, 
  User, 
  Phone, 
  Mail, 
  MapPin,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileText,
  Image,
  Mail as MailIcon,
  Megaphone,
  Calendar,
  Award,
  Printer,
  Package,
  Clock,
  Facebook,
  Twitter,
  Instagram,
  Linkedin
} from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useAuth } from '@/hooks/useAuth';
import { UserButton } from '@/components/auth/UserButton';

const HeroCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay()]);

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  const slides = [
    {
      title: "Premium Business Cards",
      subtitle: "Starting at $39",
      description: "Make a lasting impression with our high-quality business cards",
      bgColor: "bg-gradient-to-r from-blue-600 to-blue-800",
      textPosition: "left"
    },
    {
      title: "$169 for 5,000 Flyers", 
      subtitle: "Limited Time Offer",
      description: "Boost your marketing with our premium flyer printing",
      bgColor: "bg-gradient-to-r from-green-600 to-green-800",
      textPosition: "center"
    },
    {
      title: "24 Hour Turnaround",
      subtitle: "Rush Orders Available", 
      description: "Need it fast? We've got you covered with our express service",
      bgColor: "bg-gradient-to-r from-purple-600 to-purple-800",
      textPosition: "right"
    }
  ];

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide, index) => (
            <div key={index} className="flex-[0_0_100%] min-w-0">
              <div className={`${slide.bgColor} text-white py-16 px-4 md:py-24`}>
                <div className="max-w-7xl mx-auto">
                  <div className={`text-${slide.textPosition} max-w-2xl ${slide.textPosition === 'center' ? 'mx-auto' : slide.textPosition === 'right' ? 'ml-auto' : ''}`}>
                    <h1 className="text-4xl md:text-6xl font-bold mb-4">
                      {slide.title}
                    </h1>
                    <p className="text-xl md:text-2xl mb-2 text-blue-100">
                      {slide.subtitle}
                    </p>
                    <p className="text-lg mb-8 text-blue-100">
                      {slide.description}
                    </p>
                    <div className="space-x-4">
                      <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                        Shop Now
                      </Button>
                      <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                        Get Quote
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <button 
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button 
        onClick={scrollNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
};

export default function Homepage() {
  const { user, isLoading } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const productCategories = [
    { name: 'Business Cards', icon: CreditCard, color: 'text-blue-600' },
    { name: 'Flyers', icon: FileText, color: 'text-green-600' },
    { name: 'Postcards', icon: MailIcon, color: 'text-purple-600' },
    { name: 'Posters', icon: Image, color: 'text-red-600' },
    { name: 'Banners', icon: Megaphone, color: 'text-yellow-600' },
    { name: 'Brochures', icon: FileText, color: 'text-indigo-600' },
    { name: 'Calendars', icon: Calendar, color: 'text-pink-600' },
    { name: 'Stickers', icon: Award, color: 'text-teal-600' },
    { name: 'Labels', icon: Package, color: 'text-orange-600' },
    { name: 'Booklets', icon: Printer, color: 'text-gray-600' }
  ];

  const valueProps = [
    {
      icon: Clock,
      title: "24-Hour Turnaround",
      description: "Rush orders available for when you need it fast"
    },
    {
      icon: Award,
      title: "Quality Guarantee", 
      description: "Premium materials and professional printing every time"
    },
    {
      icon: Package,
      title: "Eco-Friendly Options",
      description: "Sustainable printing solutions for environmentally conscious businesses"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Printer className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">GangRun</span>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">All Products</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Business Cards</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Flyers</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Postcards</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Banners</a>
            </nav>
            
            {/* User Actions */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="h-5 w-5" />
                <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs">
                  3
                </Badge>
              </Button>
              
              {user ? (
                <UserButton />
              ) : (
                <Button onClick={() => setAuthModalOpen(true)} variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Product Categories Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Products</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Professional printing solutions for all your business needs
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {productCategories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <Card key={index} className="group hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <IconComponent className={`h-12 w-12 mx-auto mb-4 ${category.color} group-hover:scale-110 transition-transform`} />
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {valueProps.map((prop, index) => {
              const IconComponent = prop.icon;
              return (
                <div key={index} className="text-center">
                  <IconComponent className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{prop.title}</h3>
                  <p className="text-gray-600">{prop.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Email Signup */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Stay Updated</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Get the latest deals and printing tips delivered to your inbox
          </p>
          <div className="flex max-w-md mx-auto gap-4">
            <Input 
              type="email" 
              placeholder="Enter your email" 
              className="bg-white"
            />
            <Button className="bg-white text-blue-600 hover:bg-blue-50">
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Printer className="h-8 w-8 text-blue-400" />
                <span className="text-xl font-bold">GangRun</span>
              </div>
              <p className="text-gray-400 mb-4">
                Professional printing services for businesses of all sizes.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-blue-400" />
                  <span>404-668-2401</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-blue-400" />
                  <span>support@gangrunprinting.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-blue-400" />
                  <span>Atlanta, GA</span>
                </div>
              </div>
            </div>
            
            {/* Products */}
            <div>
              <h3 className="font-semibold mb-4">Products</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Business Cards</a></li>
                <li><a href="#" className="hover:text-white">Flyers</a></li>
                <li><a href="#" className="hover:text-white">Postcards</a></li>
                <li><a href="#" className="hover:text-white">Banners</a></li>
                <li><a href="#" className="hover:text-white">Brochures</a></li>
              </ul>
            </div>
            
            {/* Services */}
            <div>
              <h3 className="font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Design Services</a></li>
                <li><a href="#" className="hover:text-white">Rush Orders</a></li>
                <li><a href="#" className="hover:text-white">Bulk Printing</a></li>
                <li><a href="#" className="hover:text-white">Direct Mail</a></li>
                <li><a href="#" className="hover:text-white">Fulfillment</a></li>
              </ul>
            </div>
            
            {/* Support */}
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
                <li><a href="#" className="hover:text-white">Order Status</a></li>
                <li><a href="#" className="hover:text-white">File Upload</a></li>
                <li><a href="#" className="hover:text-white">Proofing</a></li>
              </ul>
            </div>
          </div>
          
          <Separator className="my-8 bg-gray-800" />
          
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400 mb-4 md:mb-0">
              © 2024 GangRun Printing. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
              <Twitter className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
              <Instagram className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
              <Linkedin className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  );
}
