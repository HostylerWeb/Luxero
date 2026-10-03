import { useLogicalPathname } from "@/lib/i18n";
import { Footer } from "./Footer";
import { Header } from "./Header";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = useLogicalPathname();
  const isDashboard = pathname.startsWith("/dashboard");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-[91px]">{children}</main>
      {!isDashboard ? <Footer /> : null}
    </div>
  );
}
