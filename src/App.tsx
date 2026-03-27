import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { AnalysisProvider } from "@/contexts/AnalysisContext";
import { PrivateRoute } from "@/components/PrivateRoute";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Competitors from "./pages/Competitors";
import CompetitorsSalvos from "./pages/CompetitorsSalvos";
import AnaliseInteligente from "./pages/AnaliseInteligente";
import AnaliseResultados from "./pages/AnaliseResultados";
import CompetitorDetail from "./pages/CompetitorDetail";
import Events from "./pages/Events";
import PrimeExperience from "./pages/PrimeExperience";
import Prospecting from "./pages/Prospecting";
import Settings from "./pages/Settings";
import Logs from "./pages/Logs";
import KnowledgeBase from "./pages/KnowledgeBase";
import ProspectsList from "./pages/ProspectsList";
import ClientsList from "./pages/ClientsList";
import AnaliseProspect from "./pages/AnaliseProspect";
import AnaliseCliente from "./pages/AnaliseCliente";
import ProspectDetail from "./pages/ProspectDetail";
import ClientDetail from "./pages/ClientDetail";
import PrimaryCompanyDetail from "./pages/PrimaryCompanyDetail";
import UserManagement from "./pages/UserManagement";
import EmailAlerts from "./pages/EmailAlerts";
import AutoUpdates from "./pages/AutoUpdates";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ConfirmEmail from "./pages/ConfirmEmail";
import UsageDashboard from "./pages/UsageDashboard";
import Feedbacks from "./pages/Feedbacks";

const App = () => (
  <AuthProvider>
    <NotificationProvider>
      <AnalysisProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner closeButton position="bottom-right" richColors />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/confirm-email" element={<ConfirmEmail />} />
              <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
              <Route path="/competitors" element={<PrivateRoute><Layout><Competitors /></Layout></PrivateRoute>} />
              <Route path="/concorrentes/salvos" element={<PrivateRoute><Layout><CompetitorsSalvos /></Layout></PrivateRoute>} />
              <Route path="/competitor/:id" element={<PrivateRoute><Layout><CompetitorDetail /></Layout></PrivateRoute>} />
              <Route path="/analise-inteligente" element={<PrivateRoute><Layout><AnaliseInteligente /></Layout></PrivateRoute>} />
              <Route path="/analise-resultados" element={<PrivateRoute><Layout><AnaliseResultados /></Layout></PrivateRoute>} />
              <Route path="/events" element={<PrivateRoute><Layout><Events /></Layout></PrivateRoute>} />
              <Route path="/prime-experience" element={<PrivateRoute><Layout><PrimeExperience /></Layout></PrivateRoute>} />
              <Route path="/prospecting" element={<PrivateRoute><Layout><Prospecting /></Layout></PrivateRoute>} />
              <Route path="/prospects" element={<PrivateRoute><Layout><ProspectsList /></Layout></PrivateRoute>} />
              <Route path="/prospect/:id" element={<PrivateRoute><Layout><ProspectDetail /></Layout></PrivateRoute>} />
              <Route path="/analise-prospect" element={<PrivateRoute><Layout><AnaliseProspect /></Layout></PrivateRoute>} />
              <Route path="/clientes" element={<PrivateRoute><Layout><ClientsList /></Layout></PrivateRoute>} />
              <Route path="/client/:id" element={<PrivateRoute><Layout><ClientDetail /></Layout></PrivateRoute>} />
              <Route path="/analise-cliente" element={<PrivateRoute><Layout><AnaliseCliente /></Layout></PrivateRoute>} />
              <Route path="/primary-company/:id" element={<PrivateRoute><Layout><PrimaryCompanyDetail /></Layout></PrivateRoute>} />
              <Route path="/settings" element={<PrivateRoute><Layout><Settings /></Layout></PrivateRoute>} />
              <Route path="/platform-usage" element={<PrivateRoute><Layout><UsageDashboard /></Layout></PrivateRoute>} />
              <Route path="/logs" element={<PrivateRoute><Layout><Logs /></Layout></PrivateRoute>} />
              <Route path="/knowledge-base" element={<PrivateRoute><Layout><KnowledgeBase /></Layout></PrivateRoute>} />
              <Route path="/user-management" element={<PrivateRoute><Layout><UserManagement /></Layout></PrivateRoute>} />
              <Route path="/email-alerts" element={<PrivateRoute><Layout><EmailAlerts /></Layout></PrivateRoute>} />
              <Route path="/auto-updates" element={<PrivateRoute><Layout><AutoUpdates /></Layout></PrivateRoute>} />
              <Route path="/feedbacks" element={<PrivateRoute><Layout><Feedbacks /></Layout></PrivateRoute>} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<PrivateRoute><NotFound /></PrivateRoute>} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AnalysisProvider>
    </NotificationProvider>
  </AuthProvider>
);

export default App;