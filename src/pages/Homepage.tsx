
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Layout } from '@/components/layout/Layout';
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
import { useAuth } from '@/contexts/AuthContext';
import { categoriesApi } from '@/api/categories';
import { productsApi } from '@/api/products';
import type { Tables } from '@/integrations/supabase/types';

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
                      <Link to="/products">
                        <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                          Shop Now
                        </Button>
                      </Link>
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

  // Load real categories from database
  const { data: categories = [] } = useQuery({
    queryKey: ['categories', 'active'],
    queryFn: async () => {
      const response = await categoriesApi.getCategories({ is_active: true });
      return response.data || [];
    }
  });

  // Load featured products
  const { data: featuredProducts = [] } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      const response = await productsApi.getProducts({ 
        is_active: true, 
        limit: 6 
      });
      return response.data || [];
    }
  });

  // Icon mapping for categories
  const getIconForCategory = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('business') || name.includes('card')) return CreditCard;
    if (name.includes('flyer')) return FileText;
    if (name.includes('postcard')) return MailIcon;
    if (name.includes('poster')) return Image;
    if (name.includes('banner')) return Megaphone;
    if (name.includes('brochure')) return FileText;
    if (name.includes('calendar')) return Calendar;
    if (name.includes('sticker')) return Award;
    if (name.includes('label')) return Package;
    if (name.includes('booklet')) return Printer;
    return Package; // Default icon
  };

  const getColorForCategory = (index: number) => {
    const colors = [
      'text-blue-600',
      'text-green-600', 
      'text-purple-600',
      'text-red-600',
      'text-yellow-600',
      'text-indigo-600',
      'text-pink-600',
      'text-teal-600',
      'text-orange-600',
      'text-gray-600'
    ];
    return colors[index % colors.length];
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Layout>

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
            {categories.map((category, index) => {
              const IconComponent = getIconForCategory(category.name);
              const color = getColorForCategory(index);
              return (
                <Link 
                  key={category.id} 
                  to={`/products?category=${category.slug}`}
                  className="group"
                >
                  <Card className="group-hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <IconComponent className={`h-12 w-12 mx-auto mb-4 ${color} group-hover:scale-110 transition-transform`} />
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    </CardContent>
                  </Card>
                </Link>
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
    </Layout>
  );
}
