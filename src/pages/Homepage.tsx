import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { AuthModal } from '@/components/auth/AuthModal';
import { UserMenu } from '@/components/auth/UserMenu';
import { useAuth } from '@/hooks/useAuth';
import { 
  ShoppingCart, 
  User, 
  LogIn, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  ShieldCheck,
  Leaf,
  Facebook,
  Instagram,
  CreditCard,
  FileText,
  Image,
  Printer,
  Calendar,
  Trophy,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

// Types
interface HeroSlide {
  imageUrl: string;
  headline: string;
  subtext: string;
  ctaText?: string;
  ctaLink?: string;
  textPosition: 'center' | 'left' | 'right';
}

interface ProductCategory {
  name: string;
  icon: React.ComponentType<any>;
  link: string;
}

interface ValueProposition {
  icon: React.ComponentType<any>;
  headline: string;
  description: string;
}

const Homepage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  // Hero carousel data
  const heroSlides: HeroSlide[] = [
    {
      imageUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1920&h=800&fit=crop",
      headline: "5,000 4x6 Flyers for $169",
      subtext: "Premium quality printing at unbeatable prices",
      ctaText: "Shop Now",
      ctaLink: "/flyers",
      textPosition: "center"
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=1920&h=800&fit=crop",
      headline: "24 Hour Service Available",
      subtext: "Rush orders delivered when you need them most",
      textPosition: "left"
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=1920&h=800&fit=crop",
      headline: "Free Sample Pack",
      subtext: "See and feel our quality before you order",
      ctaText: "Request Samples",
      ctaLink: "/samples",
      textPosition: "right"
    }
  ];

  // Product categories data
  const productCategories: ProductCategory[] = [
    { name: "Business Cards", icon: CreditCard, link: "/business-cards" },
    { name: "Flyers", icon: FileText, link: "/flyers" },
    { name: "Postcards", icon: Mail, link: "/postcards" },
    { name: "Banners", icon: Image, link: "/banners" },
    { name: "Posters", icon: Printer, link: "/posters" },
    { name: "Brochures", icon: FileText, link: "/brochures" },
    { name: "Calendars", icon: Calendar, link: "/calendars" },
    { name: "Certificates", icon: Trophy, link: "/certificates" },
    { name: "Stickers", icon: Image, link: "/stickers" },
    { name: "Booklets", icon: FileText, link: "/booklets" }
  ];

  // Value propositions data
  const valueProps: ValueProposition[] = [
    {
      icon: Clock,
      headline: "24-Hour Turnaround",
      description: "Need it fast? We deliver premium quality printing in just 24 hours for rush orders."
    },
    {
      icon: ShieldCheck,
      headline: "Unbeatable Quality",
      description: "State-of-the-art printing technology ensures every piece meets our high standards."
    },
    {
      icon: Leaf,
      headline: "Eco-Friendly Options",
      description: "Sustainable printing solutions with recycled materials and eco-friendly inks available."
    }
  ];

  // Carousel setup
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(false);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(false);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback((emblaApi: any) => {
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect(emblaApi);
    emblaApi.on('reInit', onSelect);
    emblaApi.on('select', onSelect);
  }, [emblaApi, onSelect]);

  // Auto-rotate carousel
  useEffect(() => {
    if (!emblaApi) return;

    const autoplay = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);

    return () => clearInterval(autoplay);
  }, [emblaApi]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <header className="bg-secondary border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="text-2xl font-montserrat font-bold text-primary">
                GangRun
              </div>
            </div>

            {/* Primary Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-foreground hover:text-primary transition-colors font-medium">
                All Products
              </a>
              <a href="#" className="text-foreground hover:text-primary transition-colors font-medium">
                Business Cards
              </a>
              <a href="#" className="text-foreground hover:text-primary transition-colors font-medium">
                Flyers
              </a>
              <a href="#" className="text-foreground hover:text-primary transition-colors font-medium">
                Postcards
              </a>
              <a href="#" className="text-foreground hover:text-primary transition-colors font-medium">
                Banners
              </a>
            </nav>

            {/* Account & Cart */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <UserMenu />
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowAuthModal(true)}
                    className="hidden sm:flex items-center"
                  >
                    <User className="w-4 h-4 mr-2" />
                    My Account
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowAuthModal(true)}
                    className="hidden sm:flex items-center"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Carousel */}
      <section className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {heroSlides.map((slide, index) => (
              <div key={index} className="flex-[0_0_100%] min-w-0 relative">
                <div className="relative h-[400px] md:h-[600px]">
                  <img
                    src={slide.imageUrl}
                    alt={slide.headline}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40" />
                  <div className={`absolute inset-0 flex items-center ${
                    slide.textPosition === 'left' ? 'justify-start pl-8 md:pl-16' :
                    slide.textPosition === 'right' ? 'justify-end pr-8 md:pr-16' :
                    'justify-center'
                  }`}>
                    <div className="text-center max-w-2xl px-4">
                      <h1 className="text-3xl md:text-5xl lg:text-6xl font-montserrat font-bold text-white mb-4">
                        {slide.headline}
                      </h1>
                      <p className="text-lg md:text-xl text-white/90 mb-8">
                        {slide.subtext}
                      </p>
                      {slide.ctaText && (
                        <Button size="lg" className="bg-primary hover:bg-primary-hover text-primary-foreground px-8 py-3 text-lg">
                          {slide.ctaText}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Carousel Controls */}
        <Button
          variant="outline"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
          onClick={scrollPrev}
          disabled={prevBtnDisabled}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
          onClick={scrollNext}
          disabled={nextBtnDisabled}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </section>

      {/* Product Category Showcase */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-montserrat font-bold text-center mb-12">
            Our Products
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {productCategories.map((category, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <category.icon className="w-12 h-12 mx-auto mb-4 text-primary group-hover:scale-110 transition-transform" />
                  <h3 className="font-montserrat font-semibold text-foreground">
                    {category.name}
                  </h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {valueProps.map((prop, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
                  <prop.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-montserrat font-semibold mb-4">
                  {prop.headline}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {prop.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Email Signup Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-montserrat font-bold mb-4">
            Sign up for exclusive sales and product news
          </h2>
          <p className="text-primary-foreground/90 mb-8 text-lg">
            Be the first to know about special offers and new products
          </p>
          <div className="max-w-md mx-auto flex gap-4">
            <Input
              type="email"
              placeholder="Enter your email address"
              className="bg-white text-foreground border-0"
            />
            <Button variant="secondary" size="lg" className="bg-white text-primary hover:bg-white/90">
              Sign Up
            </Button>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-secondary border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <div className="text-2xl font-montserrat font-bold text-primary mb-4">
                GangRun
              </div>
              <p className="text-muted-foreground mb-4">
                Your trusted partner for high-quality printing solutions since 2010.
              </p>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone className="w-4 h-4 mr-2" />
                  404-668-2401
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Mail className="w-4 h-4 mr-2" />
                  support@gangrunprinting.com
                </div>
              </div>
            </div>

            {/* Products */}
            <div>
              <h3 className="font-montserrat font-semibold mb-4">Products</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Business Cards</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Flyers</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Postcards</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Banners</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Posters</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-montserrat font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Order Status</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Shipping Info</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Returns</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</a></li>
              </ul>
            </div>

            {/* About */}
            <div>
              <h3 className="font-montserrat font-semibold mb-4">About Us</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Our Story</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Quality Promise</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Sustainability</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Press</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-muted-foreground mb-4 md:mb-0">
              © 2024 GangRun Printing. All rights reserved.
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Authentication Modal */}
      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal}
        defaultTab="login"
      />
    </div>
  );
};

export default Homepage;