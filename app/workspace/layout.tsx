import { Sidebar } from "@/components/workspace/sidebar";
import { TopAppBar } from "@/components/workspace/top-app-bar";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <TopAppBar />
        <div className="max-w-5xl mx-auto px-8 py-12">{children}</div>
      </main>
    </>
  );
}