import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import DiagnosticAuth from "./pages/DiagnosticAuth";
import Onboarding from "./pages/Onboarding";
import OnboardingCompany from "./pages/OnboardingCompany";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Solutions from "./pages/Solutions";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import AuditMethodologie from "./pages/AuditMethodologie";
import CalculsKPIs from "./pages/CalculsKPIs";
import MethodologieROI from "./pages/MethodologieROI";
import Support from "./pages/Support";
import MentionsLegales from "./pages/MentionsLegales";
import AuditGratuit from "./pages/AuditGratuit";
import RGPD from "./pages/RGPD";
import CGU from "./pages/CGU";
import AdminAudits from "./pages/AdminAudits";
import AdminBlog from "./pages/AdminBlog";
import AdminUsers from "./pages/AdminUsers";
import ClientAudits from "./pages/ClientAudits";
import AuditReport from "./pages/AuditReport";
import OrchestrationMonitor from "./pages/OrchestrationMonitor";
import VeilleIA from "./pages/VeilleIA";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import { HowItWorks } from "./pages/HowItWorks";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Force light mode
    document.documentElement.classList.remove('dark');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/diagnostic-auth" element={<DiagnosticAuth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/onboarding/company" element={<OnboardingCompany />} />
            <Route path="/solutions" element={<Solutions />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/audit-methodologie" element={<AuditMethodologie />} />
            <Route path="/audit-gratuit" element={<AuditGratuit />} />
            <Route path="/calculs-kpis" element={<CalculsKPIs />} />
            <Route path="/methodologie-roi" element={<MethodologieROI />} />
            <Route path="/guide/support" element={<Support />} />
            <Route path="/legal/mentions" element={<MentionsLegales />} />
            <Route path="/legal/rgpd" element={<RGPD />} />
            <Route path="/legal/cgu" element={<CGU />} />
            <Route path="/admin/audits" element={
              <ProtectedRoute requireAuth requireAdmin>
                <AdminAudits />
              </ProtectedRoute>
            } />
            <Route path="/admin/blog" element={
              <ProtectedRoute requireAuth requireAdmin>
                <AdminBlog />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute requireAuth requireAdmin>
                <AdminUsers />
              </ProtectedRoute>
            } />
            <Route path="/admin/orchestrations" element={
              <ProtectedRoute requireAuth requireAdmin>
                <OrchestrationMonitor />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute requireAuth requireOnboarding>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/client/audits" element={
              <ProtectedRoute requireAuth requireClient>
                <ClientAudits />
              </ProtectedRoute>
            } />
            <Route path="/audit-report/:id" element={<AuditReport />} />
            <Route path="/veille-ia" element={
              <ProtectedRoute requireAuth requireAdmin>
                <VeilleIA />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
