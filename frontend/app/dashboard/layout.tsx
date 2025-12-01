import { AppSidebar } from "@/components/Dashboard/AppSidebar";
import AuthProvider from "@/providers/AuthProvider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppHeader from "@/components/Dashboard/AppHeader";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1 relative min-h-screen pb-15">
          <AppHeader />
          {children}

          <SidebarTrigger className="fixed right-2 bottom-2 z-10 lg:hidden" />
        </main>
      </SidebarProvider>
    </AuthProvider>
  );
}
