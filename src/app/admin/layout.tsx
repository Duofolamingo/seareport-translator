import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Navbar } from "@/components/layout/navbar";
import { AdminSidebar } from "@/components/layout/admin-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/admin");
  if (user.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="mx-auto flex max-w-[1600px]">
        <AdminSidebar />
        <main className="min-h-[calc(100vh-4rem)] flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
