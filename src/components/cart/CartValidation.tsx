import { useEffect } from 'react';
import { AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartValidation } from '@/hooks/useCart';
import type { CartValidationResult } from '@/types/cart';

interface CartValidationProps {
  onValidationChange?: (isValid: boolean) => void;
  autoValidate?: boolean;
}

export function CartValidation({ onValidationChange, autoValidate = true }: CartValidationProps) {
  const { validationResult, validateCart } = useCartValidation();

  useEffect(() => {
    if (autoValidate) {
      validateCart();
    }
  }, [autoValidate, validateCart]);

  useEffect(() => {
    if (validationResult && onValidationChange) {
      onValidationChange(validationResult.isValid);
    }
  }, [validationResult, onValidationChange]);

  if (!validationResult) {
    return null;
  }

  const { isValid, errors, warnings } = validationResult;
  const hasErrors = errors.length > 0;
  const hasWarnings = warnings.length > 0;

  if (isValid && !hasWarnings) {
    return (
      <Alert>
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <span className="text-green-600">Your cart is ready for checkout</span>
            <Badge variant="secondary" className="text-green-600">
              Valid
            </Badge>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-3">
      {/* Validation Errors */}
      {hasErrors && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Cart validation errors found</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => validateCart()}
                  className="h-auto p-1"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="space-y-2">
                {errors.map((error, index) => (
                  <div key={index} className="text-sm">
                    <div className="font-medium">Item {index + 1}:</div>
                    <ul className="ml-4 space-y-1">
                      {error.errors.map((msg, msgIndex) => (
                        <li key={msgIndex}>• {msg}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              
              <p className="text-xs">
                Please fix these issues before proceeding to checkout.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Validation Warnings */}
      {hasWarnings && (
        <Alert>
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-yellow-600">Cart warnings</span>
                <Badge variant="outline" className="text-yellow-600">
                  Warning
                </Badge>
              </div>
              
              <div className="space-y-2">
                {warnings.map((warning, index) => (
                  <div key={index} className="text-sm">
                    <div className="font-medium">Item {index + 1}:</div>
                    <ul className="ml-4 space-y-1">
                      {warning.warnings.map((msg, msgIndex) => (
                        <li key={msgIndex}>• {msg}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              
              <p className="text-xs text-muted-foreground">
                These are recommendations that won't prevent checkout.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}