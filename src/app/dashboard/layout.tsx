import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="sticky top-0 z-40 border-b border-[#E8E8E8] bg-white">
        <DashboardHeader />
        <DashboardNav />
      </header>
      <main className="p-6 lg:p-8">{children}</main>
    </div>
  );
}
