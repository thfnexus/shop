import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { KhataProvider } from "./lib/store";
import Layout from "./components/layout";
import NotFound from "@/pages/not-found";

// Pages
import Dashboard from "@/pages/dashboard";
import KhataList from "@/pages/khata-list";
import KhataDetails from "@/pages/khata-details";
import BulkImport from "@/pages/bulk-import";
import Reports from "@/pages/reports";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/khatas" component={KhataList} />
        <Route path="/khata/:id" component={KhataDetails} />
        <Route path="/bulk" component={BulkImport} />
        <Route path="/reports" component={Reports} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <KhataProvider>
        <Router />
        <Toaster />
      </KhataProvider>
    </QueryClientProvider>
  );
}

export default App;
