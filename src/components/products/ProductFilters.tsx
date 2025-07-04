import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Slider } from '@/components/ui/slider';
import type { Tables } from '@/integrations/supabase/types';

type Category = Tables<'product_categories'>;

interface ProductFiltersProps {
  categories: Category[];
  selectedCategory?: string | null;
  onCategoryChange: (categorySlug: string | null) => void;
  priceRange?: [number, number];
  onPriceRangeChange?: (range: [number, number]) => void;
  minQuantity?: number;
  onMinQuantityChange?: (quantity: number) => void;
}

export function ProductFilters({
  categories,
  selectedCategory,
  onCategoryChange,
  priceRange = [0, 1000],
  onPriceRangeChange,
  minQuantity = 1,
  onMinQuantityChange,
}: ProductFiltersProps) {
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);
  const [quantityOpen, setQuantityOpen] = useState(false);

  // Group categories by parent
  const parentCategories = categories.filter(c => !c.parent_category_id);
  const childCategories = categories.filter(c => c.parent_category_id);

  const getChildCategories = (parentId: string) => {
    return childCategories.filter(c => c.parent_category_id === parentId);
  };

  const handleCategorySelect = (categorySlug: string) => {
    if (selectedCategory === categorySlug) {
      onCategoryChange(null);
    } else {
      onCategoryChange(categorySlug);
    }
  };

  const clearAllFilters = () => {
    onCategoryChange(null);
    onPriceRangeChange?.([0, 1000]);
    onMinQuantityChange?.(1);
  };

  const hasActiveFilters = selectedCategory || priceRange[0] > 0 || priceRange[1] < 1000 || minQuantity > 1;

  return (
    <div className="space-y-6">
      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Active Filters</span>
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            Clear All
          </Button>
        </div>
      )}

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {selectedCategory && (
            <Badge variant="secondary" className="text-xs">
              {categories.find(c => c.slug === selectedCategory)?.name}
              <button
                onClick={() => onCategoryChange(null)}
                className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full"
              >
                ×
              </button>
            </Badge>
          )}
          {(priceRange[0] > 0 || priceRange[1] < 1000) && (
            <Badge variant="secondary" className="text-xs">
              ${priceRange[0]} - ${priceRange[1]}
              <button
                onClick={() => onPriceRangeChange?.([0, 1000])}
                className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full"
              >
                ×
              </button>
            </Badge>
          )}
          {minQuantity > 1 && (
            <Badge variant="secondary" className="text-xs">
              Min Qty: {minQuantity}+
              <button
                onClick={() => onMinQuantityChange?.(1)}
                className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full"
              >
                ×
              </button>
            </Badge>
          )}
        </div>
      )}

      <Separator />

      {/* Categories */}
      <Collapsible open={categoriesOpen} onOpenChange={setCategoriesOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0 font-medium">
            Categories
            <ChevronDown className={`h-4 w-4 transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 mt-3">
          {/* All Products */}
          <button
            onClick={() => handleCategorySelect('')}
            className={`w-full text-left text-sm py-2 px-3 rounded-md transition-colors ${
              !selectedCategory
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            }`}
          >
            <div className="flex items-center justify-between">
              All Products
              {!selectedCategory && <Check className="h-4 w-4" />}
            </div>
          </button>

          {/* Parent Categories */}
          {parentCategories.map((category) => {
            const children = getChildCategories(category.id);
            const isSelected = selectedCategory === category.slug;
            
            return (
              <div key={category.id} className="space-y-1">
                <button
                  onClick={() => handleCategorySelect(category.slug)}
                  className={`w-full text-left text-sm py-2 px-3 rounded-md transition-colors ${
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {category.name}
                    {isSelected && <Check className="h-4 w-4" />}
                  </div>
                </button>

                {/* Child Categories */}
                {children.length > 0 && (
                  <div className="ml-4 space-y-1">
                    {children.map((child) => {
                      const isChildSelected = selectedCategory === child.slug;
                      
                      return (
                        <button
                          key={child.id}
                          onClick={() => handleCategorySelect(child.slug)}
                          className={`w-full text-left text-xs py-1.5 px-3 rounded-md transition-colors ${
                            isChildSelected
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-muted'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            {child.name}
                            {isChildSelected && <Check className="h-3 w-3" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Price Range */}
      {onPriceRangeChange && (
        <Collapsible open={priceOpen} onOpenChange={setPriceOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 font-medium">
              Price Range
              <ChevronDown className={`h-4 w-4 transition-transform ${priceOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-3">
            <div className="px-3">
              <Slider
                value={priceRange}
                onValueChange={(value) => onPriceRangeChange(value as [number, number])}
                max={1000}
                min={0}
                step={10}
                className="w-full"
              />
              <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {onPriceRangeChange && <Separator />}

      {/* Minimum Quantity */}
      {onMinQuantityChange && (
        <Collapsible open={quantityOpen} onOpenChange={setQuantityOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 font-medium">
              Minimum Quantity
              <ChevronDown className={`h-4 w-4 transition-transform ${quantityOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 mt-3">
            <div className="grid grid-cols-2 gap-2">
              {[1, 25, 50, 100, 250, 500].map((qty) => (
                <button
                  key={qty}
                  onClick={() => onMinQuantityChange(qty)}
                  className={`text-sm py-2 px-3 rounded-md border transition-colors ${
                    minQuantity === qty
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'hover:bg-muted border-border'
                  }`}
                >
                  {qty === 1 ? 'Any' : `${qty}+`}
                </button>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Featured Filters */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Quick Filters</h4>
        <div className="space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start text-xs">
            Fast Turnaround (1-2 days)
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start text-xs">
            Eco-Friendly Materials
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start text-xs">
            Premium Quality
          </Button>
        </div>
      </div>
    </div>
  );
}