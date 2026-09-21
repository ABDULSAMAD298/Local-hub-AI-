import { SuperAdminSidebar } from "@/components/layout/super-admin-sidebar";
import { SuperAdminTopBar } from "@/components/layout/super-admin-top-bar";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-bg-primary">
      <SuperAdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <SuperAdminTopBar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
