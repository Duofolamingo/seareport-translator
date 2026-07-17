import { Navbar } from "@/components/layout/navbar";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/dashboard");

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="mx-auto flex max-w-7xl">
        <DashboardSidebar />
        <main className="min-h-[calc(100vh-4rem)] flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
