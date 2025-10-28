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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/poderes" element={<Poderes />} />
          <Route path="/aulas"={<Aulas />} />
          <Route path="/missoes" element={<Missoes />} />
          <Route path="/professor" element={<Professor />} />
          <Route path="/professor/atividades" element={<ProfessorAtividades />} />
          <Route path="/professor/missoes" element={<ProfessorMissoes />} />
          <Route path="/professor/xp" element={<ProfessorXP />} />
          <Route path="/professor/submission/:submissionId" element={<ProfessorSubmissionReview />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;