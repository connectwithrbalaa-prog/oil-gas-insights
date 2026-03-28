import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import RcaRuns from "./pages/RcaRuns";
import RunDetail from "./pages/RunDetail";
import EquipmentHierarchy from "./pages/EquipmentHierarchy";
import FailureEvents from "./pages/FailureEvents";
import BadActors from "./pages/BadActors";
import RcaOutcomes from "./pages/RcaOutcomes";
import Signals from "./pages/Signals";
import PmProposals from "./pages/PmProposals";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/rca-runs" element={<RcaRuns />} />
            <Route path="/rca-runs/:id" element={<RunDetail />} />
            <Route path="/equipment" element={<EquipmentHierarchy />} />
            <Route path="/failure-events" element={<FailureEvents />} />
            <Route path="/bad-actors" element={<BadActors />} />
            <Route path="/rca-outcomes" element={<RcaOutcomes />} />
            <Route path="/signals" element={<Signals />} />
            <Route path="/pm-proposals" element={<PmProposals />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
