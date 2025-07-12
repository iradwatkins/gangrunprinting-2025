
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FloatingCart } from "@/components/cart/FloatingCart";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SessionProvider } from "@/hooks/useSession";
import { AuthErrorBoundary } from "@/components/auth/AuthErrorBoundary";
import Index from "./pages/Index";
import { ProductCatalog } from "./pages/ProductCatalog";
import ProductDetail from "./pages/ProductDetail";
import { Cart } from "./pages/Cart";
import Checkout from "./pages/checkout/Checkout";
import OrderConfirmation from "./pages/checkout/OrderConfirmation";
import { MyAccountPage } from "./pages/account/MyAccountPage";
import { DashboardRouter } from "./components/DashboardRouter";
import { ProfileSettings } from "./pages/account/ProfileSettings";
import { AccountOrdersPage } from "./pages/account/AccountOrdersPage";
import { BrokerApplication } from "./pages/account/BrokerApplication";
import NotFound from "./pages/NotFound";
import AdminApp from "./AdminApp";
import FilesPage from "./pages/files/FilesPage";
import UploadArtworkPage from "./pages/UploadArtworkPage";
import EmailDashboard from "./pages/email/EmailDashboard";
import { OrdersPage } from "./pages/orders/OrdersPage";
import InvoicePaymentPage from "./pages/InvoicePaymentPage";
import { AuthPage } from "./pages/AuthPage";
import { AuthGuard } from "./components/AuthGuard";
import { AdminLayout } from "./components/admin/AdminLayout";

// Import utilities to make them available
import "./utils/checkAdminStatus";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <SessionProvider>
            <TooltipProvider>
              <ErrorBoundary>
                <AuthErrorBoundary>
                  <Toaster />
                  <Sonner />
                  <div className="relative">
                    <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/products" element={<ProductCatalog />} />
                    <Route path="/products/:slug" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/upload-artwork" element={<UploadArtworkPage />} />
                    <Route path="/checkout" element={<AuthGuard requireAuth><Checkout /></AuthGuard>} />
                    <Route path="/checkout/confirmation/:referenceNumber" element={<OrderConfirmation />} />
                    <Route path="/account" element={<AuthGuard requireAuth><DashboardRouter /></AuthGuard>} />
                    <Route path="/my-account" element={<AuthGuard requireAuth><MyAccountPage /></AuthGuard>} />
                    <Route path="/my-account/profile" element={<AuthGuard requireAuth><ProfileSettings /></AuthGuard>} />
                    <Route path="/my-account/orders" element={<AuthGuard requireAuth><AccountOrdersPage /></AuthGuard>} />
                    <Route path="/my-account/broker-application" element={<AuthGuard requireAuth><BrokerApplication /></AuthGuard>} />
                    <Route path="/admin/*" element={<AdminLayout><AdminApp /></AdminLayout>} />
                    <Route path="/files" element={<FilesPage />} />
                    <Route path="/invoice/:invoiceNumber/pay" element={<InvoicePaymentPage />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  
                  {/* Floating Cart - Temporarily disabled */}
                  {/* <div className="fixed bottom-6 right-6 z-50">
                    <FloatingCart />
                  </div> */}
                  
                </div>
                </AuthErrorBoundary>
            </ErrorBoundary>
          </TooltipProvider>
          </SessionProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
