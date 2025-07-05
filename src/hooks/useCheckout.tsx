import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { checkoutApi } from '@/api/checkout';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import type { 
  CheckoutSession,
  CheckoutContextType,
  CheckoutFlowConfig,
  CheckoutStep,
  UpdateCheckoutSessionRequest,
  ValidateAddressResponse,
  ShippingMethod,
  TaxCalculation,
  ProcessPaymentRequest,
  ProcessPaymentResponse,
  CheckoutState
} from '@/types/checkout';
import type { CartItem } from '@/types/cart';
import type { Address } from '@/types/auth';

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export const CHECKOUT_QUERY_KEY = ['checkout'];

// Default checkout flow configuration
const DEFAULT_FLOW_CONFIG: CheckoutFlowConfig = {
  type: 'multi_step',
  steps: [
    { id: 'shipping', title: 'Shipping Information', component: 'ShippingForm', required: true, order: 1 },
    { id: 'billing', title: 'Billing Information', component: 'BillingForm', required: true, order: 2 },
    { id: 'shipping_method', title: 'Shipping Method', component: 'ShippingMethodForm', required: true, order: 3 },
    { id: 'payment', title: 'Payment Information', component: 'PaymentForm', required: true, order: 4 },
    { id: 'review', title: 'Review Order', component: 'OrderReview', required: true, order: 5 }
  ],
  theme: 'light',
  allow_guest_checkout: true,
  require_phone: false,
  require_company: false
};

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [checkoutState, setCheckoutState] = useState<CheckoutState>({
    session: null,
    isLoading: false,
    error: null,
    currentStep: 0,
    validationErrors: {},
    paymentProcessing: false
  });

  const [flowConfig] = useState<CheckoutFlowConfig>(DEFAULT_FLOW_CONFIG);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  // Get current checkout session
  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: [...CHECKOUT_QUERY_KEY, 'session'],
    queryFn: async () => {
      const sessionId = localStorage.getItem('checkout_session_id');
      if (!sessionId) return null;
      
      const response = await checkoutApi.getSession(sessionId);
      if (!response.success) return null;
      
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update state when session changes
  useEffect(() => {
    setCheckoutState(prev => ({
      ...prev,
      session: session || null,
      isLoading: sessionLoading
    }));
  }, [session, sessionLoading]);

  // Create checkout session mutation
  const createSessionMutation = useMutation({
    mutationFn: (items: CartItem[]) => checkoutApi.createSession({
      cart_items: items,
      user_id: user?.id,
      session_id: localStorage.getItem('cart_session_id') || undefined
    }),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: [...CHECKOUT_QUERY_KEY, 'session'] });
        toast({
          title: 'Checkout Started',
          description: 'Your checkout session has been created.'
        });
      } else {
        toast({
          title: 'Error',
          description: response.error,
          variant: 'destructive'
        });
      }
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to start checkout process',
        variant: 'destructive'
      });
    }
  });

  // Update session mutation
  const updateSessionMutation = useMutation({
    mutationFn: (updates: UpdateCheckoutSessionRequest) => {
      if (!session?.id) throw new Error('No active checkout session');
      return checkoutApi.updateSession(session.id, updates);
    },
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: [...CHECKOUT_QUERY_KEY, 'session'] });
      } else {
        toast({
          title: 'Update Failed',
          description: response.error,
          variant: 'destructive'
        });
      }
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update checkout information',
        variant: 'destructive'
      });
    }
  });

  // Address validation mutation
  const validateAddressMutation = useMutation({
    mutationFn: (address: Omit<Address, 'id' | 'is_default'>) => 
      checkoutApi.validateAddress({ address }),
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to validate address',
        variant: 'destructive'
      });
    }
  });

  // Shipping calculation mutation
  const calculateShippingMutation = useMutation({
    mutationFn: ({ address, items }: { address: Address; items: CartItem[] }) =>
      checkoutApi.calculateShipping({ shipping_address: address, cart_items: items }),
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to calculate shipping costs',
        variant: 'destructive'
      });
    }
  });

  // Tax calculation mutation
  const calculateTaxMutation = useMutation({
    mutationFn: ({ address, items, shipping }: { address: Address; items: CartItem[]; shipping: number }) =>
      checkoutApi.calculateTax({ shipping_address: address, cart_items: items, shipping_cost: shipping }),
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to calculate tax',
        variant: 'destructive'
      });
    }
  });

  // Payment processing mutation
  const processPaymentMutation = useMutation({
    mutationFn: async (paymentData: ProcessPaymentRequest): Promise<ProcessPaymentResponse> => {
      // Mock payment processing - in real implementation, this would call payment gateway APIs
      return new Promise((resolve) => {
        setTimeout(() => {
          const success = Math.random() > 0.1; // 90% success rate for demo
          
          if (success) {
            resolve({
              success: true,
              payment_id: `pay_${Date.now()}`,
              order_id: `ord_${Date.now()}`,
              reference_number: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
              transaction_id: `txn_${Date.now()}`
            });
          } else {
            resolve({
              success: false,
              payment_id: '',
              order_id: '',
              reference_number: '',
              error: 'Payment was declined. Please try a different payment method.'
            });
          }
        }, 2000); // Simulate processing time
      });
    },
    onMutate: () => {
      setCheckoutState(prev => ({ ...prev, paymentProcessing: true }));
    },
    onSuccess: (response) => {
      setCheckoutState(prev => ({ ...prev, paymentProcessing: false }));
      
      if (response.success) {
        // Clear checkout session after successful payment
        const sessionId = localStorage.getItem('checkout_session_id');
        if (sessionId) {
          checkoutApi.clearSession(sessionId);
        }
        
        toast({
          title: 'Payment Successful',
          description: `Order ${response.reference_number} has been placed successfully.`
        });
        
        // Redirect to confirmation page would happen here
      } else {
        toast({
          title: 'Payment Failed',
          description: response.error,
          variant: 'destructive'
        });
      }
    },
    onError: () => {
      setCheckoutState(prev => ({ ...prev, paymentProcessing: false }));
      toast({
        title: 'Payment Error',
        description: 'An unexpected error occurred during payment processing',
        variant: 'destructive'
      });
    }
  });

  // Step navigation functions
  const nextStep = () => {
    setCheckoutState(prev => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, flowConfig.steps.length - 1)
    }));
  };

  const prevStep = () => {
    setCheckoutState(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 0)
    }));
  };

  const goToStep = (step: number) => {
    setCheckoutState(prev => ({
      ...prev,
      currentStep: Math.max(0, Math.min(step, flowConfig.steps.length - 1))
    }));
  };

  const resetCheckout = () => {
    const sessionId = localStorage.getItem('checkout_session_id');
    if (sessionId) {
      checkoutApi.clearSession(sessionId);
    }
    
    setCheckoutState({
      session: null,
      isLoading: false,
      error: null,
      currentStep: 0,
      validationErrors: {},
      paymentProcessing: false
    });
    
    queryClient.invalidateQueries({ queryKey: [...CHECKOUT_QUERY_KEY] });
  };

  const contextValue: CheckoutContextType = {
    session: checkoutState.session,
    isLoading: checkoutState.isLoading,
    error: checkoutState.error,
    currentStep: checkoutState.currentStep,
    flowConfig,
    createSession: createSessionMutation.mutate,
    updateSession: updateSessionMutation.mutate,
    validateAddress: async (address) => {
      const result = await validateAddressMutation.mutateAsync(address);
      return result.success ? result.data : { is_valid: false, errors: [result.error || 'Validation failed'] };
    },
    calculateShipping: async (address, items) => {
      const result = await calculateShippingMutation.mutateAsync({ address, items });
      return result.success ? result.data.shipping_methods : [];
    },
    calculateTax: async (address, items, shipping) => {
      const result = await calculateTaxMutation.mutateAsync({ address, items, shipping });
      return result.success ? result.data.tax_calculation : { rate: 0, amount: 0, breakdown: { state_tax: 0, local_tax: 0, county_tax: 0 } };
    },
    processPayment: async (paymentData) => {
      const result = await processPaymentMutation.mutateAsync(paymentData);
      return result;
    },
    nextStep,
    prevStep,
    goToStep,
    resetCheckout
  };

  return (
    <CheckoutContext.Provider value={contextValue}>
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout(): CheckoutContextType {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
}