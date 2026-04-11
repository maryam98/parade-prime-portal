import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import Reservation from "./pages/Reservation";
import Blog from "./pages/Blog";
import Products from "./pages/Products";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminServices from "./pages/admin/AdminServices";
import AdminArticles from "./pages/admin/AdminArticles";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminSlider from "./pages/admin/AdminSlider";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminReservations from "./pages/admin/AdminReservations";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSettings from "./pages/admin/AdminSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public pages with layout */}
          <Route path="/" element={<Layout><Index /></Layout>} />
          <Route path="/about" element={<Layout><About /></Layout>} />
          <Route path="/services" element={<Layout><Services /></Layout>} />
          <Route path="/contact" element={<Layout><Contact /></Layout>} />
          <Route path="/reservation" element={<Layout><Reservation /></Layout>} />
          <Route path="/blog" element={<Layout><Blog /></Layout>} />
          <Route path="/products" element={<Layout><Products /></Layout>} />
          <Route path="/login" element={<Layout><Login /></Layout>} />

          {/* Admin pages (own layout) */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/services" element={<AdminServices />} />
          <Route path="/admin/articles" element={<AdminArticles />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/slider" element={<AdminSlider />} />
          <Route path="/admin/messages" element={<AdminMessages />} />
          <Route path="/admin/reservations" element={<AdminReservations />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/settings" element={<AdminSettings />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
