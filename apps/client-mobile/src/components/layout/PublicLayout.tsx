import { Outlet } from "react-router-dom";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { HeaderMobileNavProvider } from "./header-mobile-nav";

export function PublicLayout() {
  return (
    <HeaderMobileNavProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 pt-[91px]">
          <Outlet />
        </main>
        <Footer />
      </div>
    </HeaderMobileNavProvider>
  );
}
