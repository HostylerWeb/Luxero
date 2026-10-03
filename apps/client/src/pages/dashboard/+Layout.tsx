import { usePageContext } from "vike-react/usePageContext";
import { DashboardShell } from "@/components/layout/DashboardShell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { sidebarDefaultOpen } = usePageContext();
  return <DashboardShell defaultOpen={sidebarDefaultOpen}>{children}</DashboardShell>;
}
