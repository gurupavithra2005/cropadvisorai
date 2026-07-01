import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RequireAuth } from "@/components/RequireAuth";
import AppLayout from "@/components/AppLayout";
import Auth from "@/pages/Auth";
import Home from "@/pages/Home";
import Crops from "@/pages/Crops";
import Fertilizer from "@/pages/Fertilizer";
import Pest from "@/pages/Pest";
import Weather from "@/pages/Weather";
import Market from "@/pages/Market";
import Profile from "@/pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
              <Route path="/" element={<Home />} />
              <Route path="/crops" element={<Crops />} />
              <Route path="/fertilizer" element={<Fertilizer />} />
              <Route path="/pest" element={<Pest />} />
              <Route path="/weather" element={<Weather />} />
              <Route path="/market" element={<Market />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
