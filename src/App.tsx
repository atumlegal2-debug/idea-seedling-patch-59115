import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Poderes from "./pages/Poderes";
import Aulas from "./pages/Aulas";
import Missoes from "./pages/Missoes";
import Professor from "./pages/Professor";
import ProfessorAtividades from "./pages/ProfessorAtividades";
import ProfessorMissoes from "./pages/ProfessorMissoes";
import ProfessorXP from "./pages/ProfessorXP";
import ProfessorSubmissionReview from "./pages/ProfessorSubmissionReview";
import ProfessorPoderes from "./pages/ProfessorPoderes";
import ProfessorEditProfile from "./pages/ProfessorEditProfile";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminUsers from "./pages/AdminUsers";
import Locations from "./pages/Locations";
import Chat from "./pages/Chat";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />

          {/* Student Routes */}
          <Route element={<ProtectedRoute isProfessorRoute={false} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/poderes" element={<Poderes />} />
            <Route path="/aulas" element={<Aulas />} />
            <Route path="/missoes" element={<Missoes />} />
            <Route path="/locais" element={<Locations />} />
            <Route path="/chat/:locationId" element={<Chat />} />
          </Route>

          {/* Professor Routes */}
          <Route element={<ProtectedRoute isProfessorRoute={true} />}>
            <Route path="/professor" element={<Professor />} />
            <Route path="/professor/atividades" element={<ProfessorAtividades />} />
            <Route path="/professor/missoes" element={<ProfessorMissoes />} />
            <Route path="/professor/xp" element={<ProfessorXP />} />
            <Route path="/professor/submission/:submissionId" element={<ProfessorSubmissionReview />} />
            <Route path="/professor/poderes" element={<ProfessorPoderes />} />
            <Route path="/professor/perfil" element={<ProfessorEditProfile />} />
          </Route>
          
          {/* Admin Route */}
          <Route path="/admin/users" element={<AdminUsers />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;