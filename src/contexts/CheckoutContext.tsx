import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/hooks/useCart';
import { checkoutApi } from '@/api/checkout';
import { paymentsApi } from '@/api/payments';
import { toast } from 'sonner';
import type { 
  CheckoutContextType, 
  CheckoutState, 
  CheckoutSession,
  CheckoutFlowConfig,
  UpdateCheckoutSessionRequest,
  ValidateAddressResponse,
  ShippingMethod,
  TaxCalculation,
  ProcessPaymentRequest,
  ProcessPaymentResponse
} from '@/types/checkout';
import type { Address } from '@/types/auth';
import type { CartItem } from '@/types/cart';

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

// Default checkout flow configuration
const defaultFlowConfig: CheckoutFlowConfig = {
  type: 'multi_step',
  steps: [
    { id: 'shipping', title: 'Shipping', component: 'ShippingStep', required: true, order: 1 },
    { id: 'payment', title: 'Payment', component: 'PaymentStep', required: true, order: 2 },
    { id: 'review', title: 'Review', component: 'ReviewStep', required: true, order: 3 }
  ],
  theme: 'light',
  allow_guest_checkout: true,
  require_phone: false,
  require_company: false
};

type CheckoutAction = 
  | { type: 'SET_SESSION'; payload: CheckoutSession | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'SET_VALIDATION_ERRORS'; payload: Record<string, string[]> }
  | { type: 'SET_PAYMENT_PROCESSING'; payload: boolean }
  | { type: 'RESET_CHECKOUT' };

function checkoutReducer(state: CheckoutState, action: CheckoutAction): CheckoutState {
  switch (action.type) {
    case 'SET_SESSION':
      return { ...state, session: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_CURRENT_STEP':
      return { ...state, currentStep: action.payload };
    case 'SET_VALIDATION_ERRORS':
      return { ...state, validationErrors: action.payload };
    case 'SET_PAYMENT_PROCESSING':
      return { ...state, paymentProcessing: action.payload };
    case 'RESET_CHECKOUT':
      return {
        session: null,
        isLoading: false,
        error: null,
        currentStep: 0,
        validationErrors: {},
        paymentProcessing: false
      };
    default:
      return state;
  }
}

const initialState: CheckoutState = {
  session: null,
  isLoading: false,
  error: null,
  currentStep: 0,
  validationErrors: {},
  paymentProcessing: false
};

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(checkoutReducer, initialState);
  const { user } = useAuth();
  const { cart } = useCart();

  // Create checkout session when cart is available
  useEffect(() => {
    if (cart?.items && cart.items.length > 0 && !state.session) {
      createSession(cart.items);
    }
  }, [cart, state.session]);

  const createSession = async (items: CartItem[]) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await checkoutApi.createSession({
        cart_items: items,
        user_id: user?.id,
        session_id: cart?.session_id
      });

      if (response.success) {
        dispatch({ type: 'SET_SESSION', payload: response.data });
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create checkout session';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateSession = async (updates: UpdateCheckoutSessionRequest) => {
    if (!state.session) {
      throw new Error('No active checkout session');
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await checkoutApi.updateSession(state.session.id, updates);

      if (response.success) {
        dispatch({ type: 'SET_SESSION', payload: response.data });
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update checkout session';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const validateAddress = async (address: Omit<Address, 'id' | 'is_default'>): Promise<ValidateAddressResponse> => {
    try {
      const response = await checkoutApi.validateAddress({ address });
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to validate address';
      toast.error(errorMessage);
      throw error;
    }
  };

  const calculateShipping = async (address: Address, items: CartItem[]): Promise<ShippingMethod[]> => {
    try {
      const response = await checkoutApi.calculateShipping({
        shipping_address: address,
        cart_items: items
      });

      if (response.success) {
        return response.data.shipping_methods;
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to calculate shipping';
      toast.error(errorMessage);
      throw error;
    }
  };

  const calculateTax = async (address: Address, items: CartItem[], shipping: number): Promise<TaxCalculation> => {
    try {
      const response = await checkoutApi.calculateTax({
        shipping_address: address,
        cart_items: items,
        shipping_cost: shipping
      });

      if (response.success) {
        return response.data.tax_calculation;
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to calculate tax';
      toast.error(errorMessage);
      throw error;
    }
  };

  const processPayment = async (paymentData: ProcessPaymentRequest): Promise<ProcessPaymentResponse> => {
    try {
      dispatch({ type: 'SET_PAYMENT_PROCESSING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await paymentsApi.processPayment(paymentData);

      if (response.success) {
        toast.success('Payment processed successfully!');
        return response.data;
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment processing failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    } finally {
      dispatch({ type: 'SET_PAYMENT_PROCESSING', payload: false });
    }
  };

  const nextStep = () => {
    const maxStep = defaultFlowConfig.steps.length - 1;
    if (state.currentStep < maxStep) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: state.currentStep + 1 });
    }
  };

  const prevStep = () => {
    if (state.currentStep > 0) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: state.currentStep - 1 });
    }
  };

  const goToStep = (step: number) => {
    const maxStep = defaultFlowConfig.steps.length - 1;
    if (step >= 0 && step <= maxStep) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: step });
    }
  };

  const resetCheckout = () => {
    dispatch({ type: 'RESET_CHECKOUT' });
  };

  const contextValue: CheckoutContextType = {
    session: state.session,
    isLoading: state.isLoading,
    error: state.error,
    currentStep: state.currentStep,
    flowConfig: defaultFlowConfig,
    createSession,
    updateSession,
    validateAddress,
    calculateShipping,
    calculateTax,
    processPayment,
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