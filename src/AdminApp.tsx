import { Routes, Route } from "react-router-dom";
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
import NotFound from "./pages/NotFound";

const AdminApp = () => (
  <Routes>
    <Route path="/" element={<AdminDashboard />} />
    <Route path="/products" element={<ProductsPage />} />
    <Route path="/products/new" element={<NewProductPage />} />
    <Route path="/products/:id/edit" element={<EditProductPage />} />
    <Route path="/analytics" element={<AnalyticsPage />} />
    <Route path="/checkout-settings" element={<CheckoutSettingsPage />} />
    <Route path="/orders" element={<AdminOrdersPage />} />
    <Route path="/email" element={<AdminEmailPage />} />
    <Route path="/files" element={<AdminFilesPage />} />
    <Route path="/paper-stocks" element={<PaperStocksPage />} />
    <Route path="/paper-stocks/new" element={<NewPaperStockPage />} />
    <Route path="/print-sizes" element={<PrintSizesPage />} />
    <Route path="/turnaround-times" element={<TurnaroundTimesPage />} />
    <Route path="/add-ons" element={<AddOnsPage />} />
    <Route path="/quantities" element={<QuantitiesPage />} />
    <Route path="/users" element={<UserManagementPage />} />
    <Route path="/categories" element={<CategoriesPage />} />
    <Route path="/vendors" element={<VendorsPage />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AdminApp;