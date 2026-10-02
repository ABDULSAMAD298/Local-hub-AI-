import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardTopBar } from "@/components/layout/dashboard-top-bar";
import { BusinessProvider } from "@/components/providers/business-provider";
import { OnboardingGate } from "@/components/onboarding/onboarding-gate";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <BusinessProvider>
      <div className="flex h-screen overflow-hidden bg-bg-primary">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardTopBar />
          <main className="flex-1 overflow-y-auto p-6">
            <OnboardingGate>{children}</OnboardingGate>
          </main>
        </div>
      </div>
    </BusinessProvider>
  );
}
