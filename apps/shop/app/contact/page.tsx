import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with LUXERO. General inquiries, order support, returns, and press contacts.",
  openGraph: {
    title: "Contact — Luxero",
    description:
      "Get in touch with LUXERO. General inquiries, order support, returns, and press contacts.",
  },
};

export default function ContactPage() {
  return (
    <main className="luxero-container py-12">
      {/* Header */}
      <section className="mx-auto max-w-3xl text-center">
        <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-gold">
          Get in Touch
        </span>
        <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">Contact Us</h1>
        <p className="mt-4 text-base text-muted-foreground md:text-lg">
          We&apos;d love to hear from you. Whether it&apos;s a question about your order, a press
          inquiry, or just to say hello — we&apos;re here to help.
        </p>
      </section>

      {/* Email Contacts */}
      <section className="mx-auto mt-16 max-w-2xl">
        <h2 className="text-2xl font-bold tracking-tight">Email</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          We aim to respond within 24 hours on business days.
        </p>
        <div className="mt-8 space-y-6">
          <ContactRow label="General Inquiries" email="contact@luxero.win" />
          <ContactRow label="Order Support" email="contact@luxero.win" />
          <ContactRow label="Returns" email="contact@luxero.win" />
          <ContactRow label="Press" email="contact@luxero.win" />
        </div>
      </section>

      {/* Business Details */}
      <section className="mx-auto mt-16 max-w-2xl">
        <h2 className="text-2xl font-bold tracking-tight">Business Details</h2>
        <div className="mt-6 grid gap-8 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gold">Address</h3>
            <address className="mt-2 not-italic text-muted-foreground leading-relaxed">
              107 Dalriada Crescent
              <br />
              Motherwell, ML1 3XT
              <br />
              Scotland, United Kingdom
            </address>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gold">
              Customer Service Hours
            </h3>
            <p className="mt-2 text-muted-foreground leading-relaxed">
              Monday — Friday
              <br />
              9:00 — 18:00 GMT
            </p>
          </div>
        </div>
      </section>

      <footer className="mx-auto mt-16 max-w-3xl border-t border-border-subtle pt-6 text-center text-xs text-muted-foreground">
        Last updated: June 2026
      </footer>
    </main>
  );
}

function ContactRow({ label, email }: { label: string; email: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border-subtle px-5 py-4 transition-colors hover:border-gold/40">
      <span className="font-medium text-sm">{label}</span>
      <a
        href={`mailto:${email}`}
        className="text-sm text-gold underline-offset-2 transition-colors hover:underline"
      >
        {email}
      </a>
    </div>
  );
}
