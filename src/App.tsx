
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FloatingCart } from "@/components/cart/FloatingCart";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AdminModeContextWrapper } from "@/components/AdminModeContextWrapper";
import { AdminModeWrapper } from "@/components/AdminModeWrapper";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import { ProductCatalog } from "./pages/ProductCatalog";
import ProductDetail from "./pages/ProductDetail";
import { Cart } from "./pages/Cart";
import Checkout from "./pages/checkout/Checkout";
import OrderConfirmation from "./pages/checkout/OrderConfirmation";
import { MyAccountPage } from "./pages/account/MyAccountPage";
import { DashboardRouter } from "./components/DashboardRouter";
import { ProfileSettings } from "./pages/account/ProfileSettings";
import { BrokerApplication } from "./pages/account/BrokerApplication";
import { AccountOrdersPage } from "./pages/account/AccountOrdersPage";
import NotFound from "./pages/NotFound";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { ProductsPage } from "./pages/admin/ProductsPage";
import { NewProductPage } from "./pages/admin/NewProductPage";
import { EditProductPage } from "./pages/admin/EditProductPage";
import { AnalyticsPage } from "./pages/admin/AnalyticsPage";
import { AdminOrdersPage } from "./pages/admin/AdminOrdersPage";
import { AdminEmailPage } from "./pages/admin/AdminEmailPage";
import { AdminFilesPage } from "./pages/admin/AdminFilesPage";
import { PaperStocksPage } from "./pages/admin/PaperStocksPage";
import { NewPaperStockPage } from "./pages/admin/NewPaperStockPage";
import { CategoriesPage } from "./pages/admin/CategoriesPage";
import { VendorsPage } from "./pages/admin/VendorsPage";
import { PrintSizesPage } from "./pages/admin/PrintSizesPage";
import { TurnaroundTimesPage } from "./pages/admin/TurnaroundTimesPage";
import { AddOnsPage } from "./pages/admin/AddOnsPage";
import { QuantitiesPage } from "./pages/admin/QuantitiesPage";
import { UserManagementPage } from "./pages/admin/UserManagementPage";
import CheckoutSettingsPage from "./pages/admin/CheckoutSettingsPage";
import FilesPage from "./pages/files/FilesPage";
import UploadArtworkPage from "./pages/UploadArtworkPage";
import EmailDashboard from "./pages/email/EmailDashboard";
import { OrdersPage } from "./pages/orders/OrdersPage";
import InvoicePaymentPage from "./pages/InvoicePaymentPage";

// Import cleanup utility to make it available
import "./utils/cleanup-auth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <AdminModeContextWrapper>
            <AdminModeWrapper>
              <TooltipProvider>
              <ErrorBoundary>
                <Toaster />
                <Sonner />
                <div className="relative">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/products" element={<ProductCatalog />} />
                    <Route path="/products/:slug" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/upload-artwork" element={<UploadArtworkPage />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/checkout/confirmation/:referenceNumber" element={<OrderConfirmation />} />
                    <Route path="/account" element={<DashboardRouter />} />
                    <Route path="/my-account" element={<MyAccountPage />} />
                    <Route path="/my-account/profile" element={<ProfileSettings />} />
                    <Route path="/my-account/orders" element={<AccountOrdersPage />} />
                    <Route path="/my-account/broker-application" element={<BrokerApplication />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/products" element={<ProductsPage />} />
                    <Route path="/admin/products/new" element={<NewProductPage />} />
                    <Route path="/admin/products/:id/edit" element={<EditProductPage />} />
                    <Route path="/admin/analytics" element={<AnalyticsPage />} />
                    <Route path="/admin/checkout-settings" element={<CheckoutSettingsPage />} />
                    <Route path="/admin/orders" element={<AdminOrdersPage />} />
                    <Route path="/admin/email" element={<AdminEmailPage />} />
                    <Route path="/admin/files" element={<AdminFilesPage />} />
                    <Route path="/admin/paper-stocks" element={<PaperStocksPage />} />
                    <Route path="/admin/paper-stocks/new" element={<NewPaperStockPage />} />
                    <Route path="/admin/print-sizes" element={<PrintSizesPage />} />
                    <Route path="/admin/turnaround-times" element={<TurnaroundTimesPage />} />
                    <Route path="/admin/add-ons" element={<AddOnsPage />} />
                    <Route path="/admin/quantities" element={<QuantitiesPage />} />
                    <Route path="/admin/users" element={<UserManagementPage />} />
                    <Route path="/admin/categories" element={<CategoriesPage />} />
                    <Route path="/admin/vendors" element={<VendorsPage />} />
                    <Route path="/files" element={<FilesPage />} />
                    <Route path="/invoice/:invoiceNumber/pay" element={<InvoicePaymentPage />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  
                  {/* Floating Cart - Available on all pages */}
                  <div className="fixed bottom-6 right-6 z-50">
                    <FloatingCart />
                  </div>
                </div>
              </ErrorBoundary>
              </TooltipProvider>
            </AdminModeWrapper>
          </AdminModeContextWrapper>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
