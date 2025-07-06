import { useState, useEffect } from 'react';
import { 
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Tags,
  Users,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { categoriesApi, type CategoryFilters } from '@/api/categories';
import { CategoryForm } from '@/components/admin/CategoryForm';
import type { Tables } from '@/integrations/supabase/types';

type Category = Tables<'product_categories'> & {
  children?: Category[];
  product_count?: number;
};

interface CategoryTreeNodeProps {
  category: Category;
  level: number;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onToggleActive: (category: Category) => void;
  onAddChild: (parent: Category) => void;
}

function CategoryTreeNode({ 
  category, 
  level, 
  onEdit, 
  onDelete, 
  onToggleActive, 
  onAddChild 
}: CategoryTreeNodeProps) {
  const [expanded, setExpanded] = useState(level < 2); // Auto-expand top 2 levels
  const hasChildren = category.children && category.children.length > 0;

  const paddingLeft = `${level * 24}px`;

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <div 
        className="flex items-center justify-between py-3 px-4 hover:bg-gray-50"
        style={{ paddingLeft }}
      >
        <div className="flex items-center gap-3 flex-1">
          {/* Expand/Collapse Button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setExpanded(!expanded)}
            disabled={!hasChildren}
          >
            {hasChildren ? (
              expanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )
            ) : (
              <div className="h-4 w-4" />
            )}
          </Button>

          {/* Category Info */}
          <div className="flex items-center gap-2 flex-1">
            <Tags className="h-4 w-4 text-gray-400" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{category.name}</span>
                <Badge
                  variant={category.is_active ? "default" : "secondary"}
                  className="text-xs"
                >
                  {category.is_active ? "Active" : "Inactive"}
                </Badge>
                {category.default_broker_discount > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {category.default_broker_discount}% discount
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-4">
                <span>/{category.slug}</span>
                <span className="flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  {category.product_count || 0} products
                </span>
                {hasChildren && (
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {category.children?.length} subcategories
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddChild(category)}
            title="Add subcategory"
          >
            <Plus className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(category)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddChild(category)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Subcategory
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleActive(category)}>
                {category.is_active ? (
                  <><ToggleLeft className="h-4 w-4 mr-2" /> Deactivate</>
                ) : (
                  <><ToggleRight className="h-4 w-4 mr-2" /> Activate</>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(category)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Children */}
      {expanded && hasChildren && (
        <div>
          {category.children?.map((child) => (
            <CategoryTreeNode
              key={child.id}
              category={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleActive={onToggleActive}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CategoryTree() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CategoryFilters>({
    page: 1,
    limit: 100
  });
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [parentCategory, setParentCategory] = useState<Category | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [filters]);

  const buildCategoryTree = (categories: Category[]): Category[] => {
    const categoryMap = new Map<string, Category>();
    const rootCategories: Category[] = [];

    // First pass: create map and initialize children arrays
    categories.forEach(category => {
      categoryMap.set(category.id, { ...category, children: [], product_count: 0 });
    });

    // Second pass: build tree structure
    categories.forEach(category => {
      const categoryNode = categoryMap.get(category.id)!;
      
      if (category.parent_category_id) {
        const parent = categoryMap.get(category.parent_category_id);
        if (parent) {
          parent.children!.push(categoryNode);
        } else {
          // Parent not found, treat as root
          rootCategories.push(categoryNode);
        }
      } else {
        rootCategories.push(categoryNode);
      }
    });

    // Sort categories by sort_order
    const sortCategories = (cats: Category[]) => {
      cats.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      cats.forEach(cat => {
        if (cat.children && cat.children.length > 0) {
          sortCategories(cat.children);
        }
      });
    };

    sortCategories(rootCategories);
    return rootCategories;
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await categoriesApi.getCategoryHierarchy();
      
      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
      } else {
        const treeData = buildCategoryTree(response.data || []);
        setCategories(treeData);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search, page: 1 }));
  };

  const handleFilterChange = (key: keyof CategoryFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setParentCategory(null);
    setShowForm(true);
  };

  const handleAddChild = (parent: Category) => {
    setParentCategory(parent);
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleAddRoot = () => {
    setParentCategory(null);
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleToggleActive = async (category: Category) => {
    try {
      const response = await categoriesApi.updateCategory(category.id, {
        ...category,
        is_active: !category.is_active
      });

      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: `Category ${category.is_active ? 'deactivated' : 'activated'} successfully`,
        });
        loadData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update category status",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (category: Category) => {
    if (!confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await categoriesApi.deleteCategory(category.id);

      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Category deleted successfully",
        });
        loadData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  const flattenCategories = (cats: Category[]): Category[] => {
    const result: Category[] = [];
    const traverse = (categories: Category[]) => {
      categories.forEach(cat => {
        result.push(cat);
        if (cat.children && cat.children.length > 0) {
          traverse(cat.children);
        }
      });
    };
    traverse(cats);
    return result;
  };

  const totalCategories = flattenCategories(categories).length;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tags className="h-5 w-5" />
            Category Management
          </CardTitle>
          <CardDescription>
            Manage product categories and hierarchy with broker discount configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search categories..."
                className="pl-10"
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            
            <Select onValueChange={(value) => handleFilterChange('is_active', value === 'true' ? true : value === 'false' ? false : undefined)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleAddRoot}>
              <Plus className="h-4 w-4 mr-2" />
              Add Root Category
            </Button>
          </div>

          {/* Category Tree */}
          <div className="border rounded-lg">
            {totalCategories === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Tags className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No categories found</h3>
                <p className="text-sm">Add your first category to get started organizing products.</p>
                <Button onClick={handleAddRoot} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Category
                </Button>
              </div>
            ) : (
              <div>
                {categories.map((category) => (
                  <CategoryTreeNode
                    key={category.id}
                    category={category}
                    level={0}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleActive={handleToggleActive}
                    onAddChild={handleAddChild}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Statistics */}
          {totalCategories > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {totalCategories} categories total
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Form Dialog */}
      <CategoryForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingCategory(null);
          setParentCategory(null);
        }}
        category={editingCategory}
        parentCategory={parentCategory}
        onSuccess={loadData}
      />
    </div>
  );
}