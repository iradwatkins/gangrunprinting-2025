import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Save, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { paperStocksApi } from '@/api/global-options';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

const paperStockSchema = z.object({
  name: z.string().min(1, 'Paper stock name is required'),
  description: z.string().optional(),
  weight: z.coerce.number().min(1, 'Weight must be at least 1 GSM').max(1000, 'Weight cannot exceed 1000 GSM'),
  finish: z.string().min(1, 'Finish is required'),
  price_per_square_inch: z.coerce.number().min(0.0001, 'Price must be greater than 0').max(99.9999, 'Price too high'),
  is_active: z.boolean()
});

type PaperStockFormData = z.infer<typeof paperStockSchema>;
type PaperStock = Tables<'paper_stocks'>;

interface PaperStockFormProps {
  open: boolean;
  onClose: () => void;
  paperStock?: PaperStock | null;
  onSuccess: () => void;
}

const finishOptions = [
  'Matte',
  'Gloss',
  'Satin',
  'Uncoated',
  'Textured',
  'Linen',
  'Felt',
  'Smooth',
  'Recycled',
  'Metallic'
];

export function PaperStockForm({ open, onClose, paperStock, onSuccess }: PaperStockFormProps) {
  const { toast } = useToast();
  const isEditing = !!paperStock;

  const form = useForm<PaperStockFormData>({
    resolver: zodResolver(paperStockSchema),
    defaultValues: {
      name: '',
      description: '',
      weight: 120, // Common default weight for business cards
      finish: '',
      price_per_square_inch: 0.0100, // $0.01 per square inch default
      is_active: true
    }
  });

  useEffect(() => {
    if (paperStock) {
      form.reset({
        name: paperStock.name || '',
        description: paperStock.description || '',
        weight: paperStock.weight || 120,
        finish: paperStock.finish || '',
        price_per_square_inch: paperStock.price_per_square_inch || 0.0100,
        is_active: paperStock.is_active ?? true
      });
    } else {
      form.reset({
        name: '',
        description: '',
        weight: 120,
        finish: '',
        price_per_square_inch: 0.0100,
        is_active: true
      });
    }
  }, [paperStock, form]);

  const onSubmit = async (data: PaperStockFormData) => {
    try {
      let response;

      if (isEditing && paperStock) {
        response = await paperStocksApi.updatePaperStock(paperStock.id, data as TablesUpdate<'paper_stocks'>);
      } else {
        response = await paperStocksApi.createPaperStock(data as TablesInsert<'paper_stocks'>);
      }

      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: `Paper stock ${isEditing ? 'updated' : 'created'} successfully`,
      });

      form.reset();
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} paper stock`,
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {isEditing ? 'Edit Paper Stock' : 'Add Paper Stock'}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update paper stock information and pricing' : 'Add a new paper stock for product configuration'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Premium Matte Cardstock" {...field} />
                    </FormControl>
                    <FormDescription>
                      Display name for this paper stock
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Detailed description of the paper stock..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional description for admin and customer reference
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Paper Specifications */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Paper Specifications</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (GSM) *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          max="1000"
                          placeholder="120"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Paper weight in grams per square meter
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="finish"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Finish *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select finish" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {finishOptions.map((finish) => (
                            <SelectItem key={finish} value={finish}>
                              {finish}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Paper surface finish type
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Pricing</h3>
              
              <FormField
                control={form.control}
                name="price_per_square_inch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price per Square Inch *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                        <Input 
                          type="number" 
                          step="0.0001"
                          min="0.0001"
                          max="99.9999"
                          placeholder="0.0100"
                          className="pl-8"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Base pricing per square inch for calculations (e.g., $0.0100)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Status</h3>
              
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Active
                      </FormLabel>
                      <FormDescription>
                        Make this paper stock available for product configuration
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center gap-3 pt-4">
              <Button 
                type="submit" 
                disabled={form.formState.isSubmitting}
                className="flex-1"
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEditing ? 'Update Paper Stock' : 'Create Paper Stock'}
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}