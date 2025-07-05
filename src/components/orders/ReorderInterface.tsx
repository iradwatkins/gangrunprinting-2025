import React, { useState } from 'react';
import { useReorder } from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ReorderValidation } from '@/types/orders';
import { RotateCcw, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface ReorderInterfaceProps {
  orderId: string;
  selectedJobIds?: string[];
  onReorderComplete?: (newOrderId: string) => void;
}

export const ReorderInterface: React.FC<ReorderInterfaceProps> = ({ 
  orderId, 
  selectedJobIds,
  onReorderComplete 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [validation, setValidation] = useState<ReorderValidation | null>(null);
  const [selectedJobs, setSelectedJobs] = useState<string[]>(selectedJobIds || []);
  const [validating, setValidating] = useState(false);
  const { loading, error, validateReorder, reorder } = useReorder();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleValidateReorder = async () => {
    try {
      setValidating(true);
      const result = await validateReorder(orderId);
      setValidation(result);
    } catch (error) {
      toast({
        title: "Validation Error",
        description: "Failed to validate reorder. Please try again.",
        variant: "destructive"
      });
    } finally {
      setValidating(false);
    }
  };

  const handleReorder = async () => {
    if (!validation) return;

    try {
      const newOrderId = await reorder(orderId, selectedJobs.length > 0 ? selectedJobs : undefined);
      
      toast({
        title: "Reorder Created",
        description: "Your reorder has been created successfully.",
      });

      if (onReorderComplete) {
        onReorderComplete(newOrderId);
      } else {
        navigate(`/cart`);
      }
      
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Reorder Failed",
        description: "Failed to create reorder. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleJobSelection = (jobId: string, checked: boolean) => {
    if (checked) {
      setSelectedJobs(prev => [...prev, jobId]);
    } else {
      setSelectedJobs(prev => prev.filter(id => id !== jobId));
    }
  };

  const handleOpenDialog = () => {
    setIsOpen(true);
    if (!validation) {
      handleValidateReorder();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button onClick={handleOpenDialog}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Reorder
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Reorder Items</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {validating && (
            <div className="text-center p-4">
              <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
              <p>Validating reorder...</p>
            </div>
          )}

          {validation && (
            <div className="space-y-4">
              {!validation.is_valid && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Some items cannot be reordered:
                    <ul className="mt-2 ml-4 list-disc">
                      {validation.unavailable_products.map((product, index) => (
                        <li key={index}>{product} is no longer available</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {validation.warnings.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      {validation.warnings.map((warning, index) => (
                        <div key={index}>{warning}</div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {validation.modified_prices.length > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Price Changes</h4>
                    <div className="space-y-2">
                      {validation.modified_prices.map((price, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span>Product pricing updated</span>
                          <div className="flex items-center gap-2">
                            <span className="line-through text-gray-500">
                              ${price.old_price.toFixed(2)}
                            </span>
                            <span className="font-medium">
                              ${price.new_price.toFixed(2)}
                            </span>
                            <Badge variant={price.new_price > price.old_price ? "destructive" : "secondary"}>
                              {price.new_price > price.old_price ? '+' : ''}
                              ${(price.new_price - price.old_price).toFixed(2)}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {validation.is_valid && validation.warnings.length === 0 && validation.modified_prices.length === 0 && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    All items are available for reorder with no changes.
                  </AlertDescription>
                </Alert>
              )}

              {selectedJobIds && selectedJobIds.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Selected Items</h4>
                  <div className="space-y-2">
                    {selectedJobIds.map((jobId, index) => (
                      <div key={jobId} className="flex items-center space-x-2">
                        <Checkbox
                          id={jobId}
                          checked={selectedJobs.includes(jobId)}
                          onCheckedChange={(checked) => handleJobSelection(jobId, checked as boolean)}
                        />
                        <label htmlFor={jobId} className="text-sm">
                          Item {index + 1}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleReorder}
                  disabled={loading || !validation.is_valid}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Creating Reorder...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Create Reorder
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};