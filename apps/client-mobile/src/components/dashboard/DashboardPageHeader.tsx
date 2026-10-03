import { DashboardHeader } from "@/components/DashboardHeader";

interface DashboardPageHeaderProps {
  title: string;
  subtitle?: string;
}

export function DashboardPageHeader({ title, subtitle }: DashboardPageHeaderProps) {
  return <DashboardHeader title={title} subtitle={subtitle} />;
}
