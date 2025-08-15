
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
import { insertRealTestData } from '@/utils/insertRealTestData';
import { AnimatedSection, FadeIn, ScaleIn, StaggerContainer, StaggerItem } from '@/components/animations/AnimatedSection';
import { ParallaxSection, ParallaxText, FloatingElement } from '@/components/animations/ParallaxSection';
import { InteractiveCard, MagneticButton, PulseRing } from '@/components/animations/InteractiveCard';
import { ScrollProgressBar, ScrollRevealText, CountUp } from '@/components/animations/ScrollProgress';
import { Spinner, PulsingDots, Skeleton, LoadingOverlay } from '@/components/animations/LoadingStates';
import { TypewriterText, GradientText, RotatingText } from '@/components/animations/TextEffects';

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay()]);

  const scrollPrev = () => {
    emblaApi && emblaApi.scrollPrev();
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };
  const scrollNext = () => {
    emblaApi && emblaApi.scrollNext();
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  React.useEffect(() => {
    if (emblaApi) {
      emblaApi.on('select', () => {
        setCurrentSlide(emblaApi.selectedScrollSnap());
      });
    }
  }, [emblaApi]);

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
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`text-${slide.textPosition} max-w-2xl ${slide.textPosition === 'center' ? 'mx-auto' : slide.textPosition === 'right' ? 'ml-auto' : ''}`}
                  >
                    <h1 className="text-4xl md:text-6xl font-bold mb-4">
                      <TypewriterText text={slide.title} speed={0.05} />
                    </h1>
                    <motion.p
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                      className="text-xl md:text-2xl mb-2 text-blue-100"
                    >
                      {slide.subtitle}
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                      className="text-lg mb-8 text-blue-100"
                    >
                      {slide.description}
                    </motion.p>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7, duration: 0.6 }}
                      className="space-x-4"
                    >
                      <MagneticButton>
                        <Link to="/products">
                          <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                            Shop Now
                          </Button>
                        </Link>
                      </MagneticButton>
                      <MagneticButton>
                        <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                          Get Quote
                        </Button>
                      </MagneticButton>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={scrollNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
      >
        <ChevronRight className="w-6 h-6" />
      </motion.button>
      
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <motion.button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              currentSlide === index ? 'bg-white' : 'bg-white/50'
            }`}
            whileHover={{ scale: 1.2 }}
            onClick={() => {
              emblaApi && emblaApi.scrollTo(index);
              setCurrentSlide(index);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default function Homepage() {
  const { user, loading: authLoading } = useAuth();
  const [isInserting, setIsInserting] = useState(false);
  const [insertResult, setInsertResult] = useState<any>(null);
  
  // Make insertRealTestData available in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      (window as any).insertRealTestData = insertRealTestData;
      console.log('💡 Test data function available in console:');
      console.log('   - insertRealTestData() - Insert real test data with correct table names');
    }
  }, []);

  const handleInsertTestData = async () => {
    setIsInserting(true);
    setInsertResult(null);
    try {
      const result = await insertRealTestData();
      setInsertResult(result);
      console.log('Test data insertion result:', result);
      // Refresh the page data after successful insertion
      if (result.success) {
        window.location.reload();
      }
    } catch (error: any) {
      console.error('Error inserting test data:', error);
      setInsertResult({ success: false, error: error.message });
    } finally {
      setIsInserting(false);
    }
  };

  // Fetch categories with React Query - proper configuration to prevent loading loops
  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['categories-homepage'],
    queryFn: async () => {
      try {
        const response = await categoriesApi.getCategories();
        if (response.error) {
          console.error('Categories error:', response.error);
          return []; // Return empty array on error instead of throwing
        }
        return response.data || [];
      } catch (error) {
        console.error('Categories fetch error:', error);
        return []; // Return empty array on error
      }
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: 1,
    refetchOnWindowFocus: false, // Prevent refetch on window focus
    refetchOnMount: false // Prevent refetch on component mount if data exists
  });

  // Fetch featured products with React Query
  const { data: featuredProducts = [], isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['featured-products-homepage'],
    queryFn: async () => {
      try {
        const response = await productsApi.getAll();
        if (response.error) {
          console.error('Products error:', response.error);
          return []; // Return empty array on error instead of throwing
        }
        // For now, just take the first 6 products as featured
        return (response.data || []).slice(0, 6);
      } catch (error) {
        console.error('Products fetch error:', error);
        return []; // Return empty array on error
      }
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });

  const loading = categoriesLoading || productsLoading;

  // Debug logging
  useEffect(() => {
    console.log('Homepage loading states:', {
      authLoading,
      categoriesLoading,
      productsLoading,
      categoriesError,
      productsError,
      user
    });
  }, [authLoading, categoriesLoading, productsLoading, categoriesError, productsError, user]);

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


  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <FloatingElement duration={2}>
          <Spinner size={60} color="rgb(59, 130, 246)" />
        </FloatingElement>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <PulsingDots size={12} />
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-4 text-gray-600 font-medium"
        >
          Loading amazing products...
        </motion.p>
      </div>
    );
  }

  return (
    <Layout>
      <ScrollProgressBar color="rgb(59, 130, 246)" height={3} />
      
      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Test Data Section - Development Only */}
      {process.env.NODE_ENV === 'development' && (
        <section className="py-8 bg-yellow-50 border-y border-yellow-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-yellow-800 mb-4">Development Tools</h3>
              <div className="space-y-4">
                <div>
                  <Button 
                    onClick={handleInsertTestData}
                    disabled={isInserting}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    {isInserting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Inserting Test Data...
                      </>
                    ) : (
                      '🚀 Insert Real Test Data'
                    )}
                  </Button>
                  <p className="text-sm text-yellow-700 mt-2">
                    This will insert real test data with correct table names into your Supabase database
                  </p>
                </div>
                
                {insertResult && (
                  <div className={`mt-4 p-4 rounded-lg ${insertResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {insertResult.success ? (
                      <div>
                        <p className="font-semibold">✅ Test data inserted successfully!</p>
                        <div className="mt-2 text-sm">
                          {insertResult.results?.map((r: any, i: number) => (
                            <div key={i}>
                              {r.table}: {r.inserted} inserted, {r.verified} verified
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="font-semibold">❌ Error inserting test data</p>
                        <p className="text-sm mt-1">{insertResult.error}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Product Categories Grid */}
      <ParallaxSection className="py-16 bg-gray-50" offset={30}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              <GradientText text="Our Products" gradient="from-blue-600 to-purple-600" />
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              <ScrollRevealText text="Professional printing solutions for all your business needs" delay={0.2} />
            </p>
          </AnimatedSection>
          
          {!categoriesLoading && categories.length > 0 ? (
            <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {categories.map((category, index) => {
                const IconComponent = getIconForCategory(category.name);
                const color = getColorForCategory(index);
                return (
                  <StaggerItem key={category.id}>
                    <Link 
                      to={`/products?category=${category.slug}`}
                      className="group block"
                    >
                      <InteractiveCard glowColor="rgba(59, 130, 246, 0.3)">
                        <Card className="group-hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden">
                          <CardContent className="p-6 text-center relative">
                            <FloatingElement duration={3} delay={index * 0.1}>
                              <IconComponent className={`h-12 w-12 mx-auto mb-4 ${color} group-hover:scale-110 transition-transform`} />
                            </FloatingElement>
                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {category.name}
                            </h3>
                          </CardContent>
                        </Card>
                      </InteractiveCard>
                    </Link>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No categories available at the moment.</p>
            </div>
          )}
        </div>
      </ParallaxSection>

      {/* Featured Products */}
      {!productsLoading && featuredProducts.length > 0 && (
        <ParallaxSection className="py-16 bg-white" offset={40}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="text-center mb-12" delay={0.2}>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                <RotatingText 
                  words={['Featured', 'Popular', 'Best-Selling']} 
                  className="inline-block mr-2"
                />
                Products
              </h2>
              <ParallaxText speed={0.3}>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Popular choices for businesses like yours
                </p>
              </ParallaxText>
            </AnimatedSection>
            
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredProducts.slice(0, 3).map((product) => (
                <StaggerItem key={product.id}>
                  <Link 
                    to={`/products/${product.slug}`}
                    className="group block h-full"
                  >
                    <InteractiveCard className="h-full" glowColor="rgba(139, 92, 246, 0.3)">
                      <Card className="group-hover:shadow-xl transition-all duration-300 cursor-pointer h-full transform group-hover:-translate-y-1">
                        <CardContent className="p-6">
                          <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                            {product.name}
                          </h3>
                          <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-blue-600 font-semibold group-hover:text-purple-600 transition-colors">
                              View Details
                            </span>
                            <motion.div
                              animate={{ x: [0, 5, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              <ChevronRight className="w-5 h-5 text-blue-600 group-hover:text-purple-600 transition-colors" />
                            </motion.div>
                          </div>
                        </CardContent>
                      </Card>
                    </InteractiveCard>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </ParallaxSection>
      )}

      {/* Value Propositions */}
      <ParallaxSection className="py-16 bg-gray-50" offset={20}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {valueProps.map((prop, index) => {
              const IconComponent = prop.icon;
              return (
                <AnimatedSection key={index} delay={index * 0.2} direction="up">
                  <div className="text-center group cursor-pointer">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className="inline-block"
                    >
                      <IconComponent className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {prop.title}
                    </h3>
                    <p className="text-gray-600">{prop.description}</p>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </ParallaxSection>

      {/* Statistics Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <AnimatedSection>
              <h3 className="text-4xl font-bold text-blue-600">
                <CountUp end={5000} duration={2} suffix="+" />
              </h3>
              <p className="text-gray-600 mt-2">Happy Customers</p>
            </AnimatedSection>
            <AnimatedSection delay={0.1}>
              <h3 className="text-4xl font-bold text-green-600">
                <CountUp end={24} duration={2} prefix="" suffix="hr" />
              </h3>
              <p className="text-gray-600 mt-2">Turnaround Time</p>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <h3 className="text-4xl font-bold text-purple-600">
                <CountUp end={100} duration={2} suffix="%" />
              </h3>
              <p className="text-gray-600 mt-2">Quality Guarantee</p>
            </AnimatedSection>
            <AnimatedSection delay={0.3}>
              <h3 className="text-4xl font-bold text-orange-600">
                <CountUp end={50} duration={2} suffix="+" />
              </h3>
              <p className="text-gray-600 mt-2">Product Types</p>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Email Signup */}
      <ParallaxSection className="py-16 bg-gradient-to-r from-blue-600 to-purple-600" offset={50}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <FloatingElement duration={4} className="absolute -top-10 left-10">
            <Mail className="h-8 w-8 text-white/30" />
          </FloatingElement>
          <FloatingElement duration={5} delay={1} className="absolute -top-10 right-10">
            <Megaphone className="h-8 w-8 text-white/30" />
          </FloatingElement>
          
          <AnimatedSection>
            <h2 className="text-3xl font-bold text-white mb-4">
              <TypewriterText text="Stay Updated" speed={0.1} />
            </h2>
          </AnimatedSection>
          
          <AnimatedSection delay={0.2}>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Get the latest deals and printing tips delivered to your inbox
            </p>
          </AnimatedSection>
          
          <AnimatedSection delay={0.4}>
            <div className="flex max-w-md mx-auto gap-4">
              <Input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-white"
              />
              <MagneticButton>
                <Button className="bg-white text-blue-600 hover:bg-blue-50 transform transition-all">
                  Subscribe
                </Button>
              </MagneticButton>
            </div>
          </AnimatedSection>
        </div>
      </ParallaxSection>
    </Layout>
  );
}
