import Link from "next/link";

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/shipping", label: "Shipping" },
  { href: "/refunds", label: "Refunds" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
];

export function Footer() {
  return (
    <footer className="border-t border-border-subtle mt-16">
      <div className="luxero-container py-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <Link href="/" className="tracking-widest text-sm font-bold text-gold uppercase">
            Luxero
          </Link>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            {footerLinks.map((link) => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-gold">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="mt-6 text-center text-[10px] text-muted-foreground/60">
          &copy; {new Date().getFullYear()} LUXERO COMPETITIONS LTD. All rights reserved. Company
          No. SC888260.
        </p>
      </div>
    </footer>
  );
}
