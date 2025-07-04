import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import type { Tables } from '@/integrations/supabase/types';

type Category = Tables<'product_categories'>;

interface BreadcrumbNavProps {
  category?: Category;
  product?: {
    name: string;
    slug: string;
  };
}

export function BreadcrumbNav({ category, product }: BreadcrumbNavProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/" className="flex items-center">
              <Home className="h-4 w-4 mr-1" />
              Home
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        
        <BreadcrumbSeparator>
          <ChevronRight className="h-4 w-4" />
        </BreadcrumbSeparator>
        
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/products">Products</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {category && (
          <>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              {product ? (
                <BreadcrumbLink asChild>
                  <Link to={`/products?category=${category.slug}`}>
                    {category.name}
                  </Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{category.name}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </>
        )}

        {product && (
          <>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>{product.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}