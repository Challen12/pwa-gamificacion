import { TopBar, BottomNav } from "@/components/Navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <TopBar />
      <main className="pt-20 px-container-padding max-w-lg mx-auto flex flex-col gap-6 w-full flex-1">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
