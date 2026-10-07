"use client";

import { useContactForm } from "@luxero/api-client";
import {
  CONTACT_INFO_CARDS as CONTACT_INFO_CARDS_EN,
  contactFooterNote as contactFooterNoteEN,
  contactHero as contactHeroEN,
} from "@luxero/content/contact";
import { resolveContent } from "@luxero/content/locales";
import {
  CONTACT_INFO_CARDS as CONTACT_INFO_CARDS_RO,
  contactFooterNote as contactFooterNoteRO,
  contactHero as contactHeroRO,
} from "@luxero/content/ro";
import { Building2, Mail, MapPin, Phone, SocialIcon } from "@luxero/icons";
import { SOCIAL_LINKS } from "@luxero/utils";
import { useEffect, useState } from "react";
import { GoldButton } from "@/components/buttons";
import { Link } from "@/components/Link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/lib/i18n";

const ICON_MAP = {
  Email: Mail,
  Phone,
  Address: MapPin,
  Registered: Building2,
} as const;

export default function ContactPage() {
  const { t, locale } = useTranslation();
  const contactHero = resolveContent(locale, contactHeroEN, contactHeroRO);
  const contactFooterNote = resolveContent(locale, contactFooterNoteEN, contactFooterNoteRO);
  const infoCards = resolveContent(locale, CONTACT_INFO_CARDS_EN, CONTACT_INFO_CARDS_RO);

  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const mutation = useContactForm();

  useEffect(() => {
    if (mutation.isSuccess) {
      setSuccessMsg(t("staticPages.contact.messageSent"));
      setFormData({ name: "", email: "", subject: "", message: "" });
    }
    if (mutation.isError) {
      setErrorMsg(t("staticPages.contact.sendError"));
    }
  }, [mutation.isSuccess, mutation.isError]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");
    mutation.mutate(formData);
  }

  return (
    <div className="luxero-container-content pb-10 lg:pb-14 animate-fade-in">
      <div className="py-6 lg:py-12">
        <header className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-5 ring-1 ring-gold/15">
            <Mail className="w-8 h-8 text-gold" aria-hidden />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4 text-balance">
            {t("staticPages.contact.heading")}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed text-pretty">
            {contactHero.subtitle}
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] gap-6 lg:gap-8 items-start">
          <aside className="space-y-4">
            <ul className="rounded-2xl border border-gold/10 bg-card overflow-hidden divide-y divide-gold/10 list-none p-0 m-0">
              {infoCards.map(({ label, value, href, subvalue }) => {
                const Icon = ICON_MAP[label as keyof typeof ICON_MAP] ?? Mail;
                const body = (
                  <>
                    <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground font-semibold">
                      {label}
                    </p>
                    <p className="mt-1 text-sm sm:text-base font-semibold text-foreground leading-snug break-words">
                      {value}
                    </p>
                    {subvalue ? (
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{subvalue}</p>
                    ) : null}
                  </>
                );
                return (
                  <li key={label} className="flex gap-4 px-5 py-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/10">
                      <Icon className="h-4 w-4 text-gold" aria-hidden />
                    </div>
                    <div className="min-w-0">
                      {href ? (
                        <a
                          href={href}
                          className="block hover:text-gold transition-colors"
                          data-umami-event="contact:info-link-click"
                          data-umami-event-type={label}
                        >
                          {body}
                        </a>
                      ) : (
                        body
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="rounded-2xl border border-gold/10 bg-card p-5">
              <p className="text-sm font-semibold text-foreground">{t("staticPages.contact.followUs")}</p>
              <p className="text-xs text-muted-foreground mt-1 mb-3">
                {t("staticPages.contact.followUsSubtitle")}
              </p>
              <div className="flex flex-wrap gap-2">
                {SOCIAL_LINKS.map(({ label, href, icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-umami-event="contact:social-follow"
                    data-umami-event-social={label}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gold/20 text-xs font-medium text-muted-foreground hover:border-gold/50 hover:text-gold transition-colors"
                  >
                    <SocialIcon name={icon} className="size-3.5" />
                    {label}
                  </a>
                ))}
              </div>
            </div>

            <p className="text-xs leading-relaxed text-muted-foreground px-1">
              {contactFooterNote}{" "}
              <Link
                href="/faq"
                className="text-gold hover:underline font-medium"
                data-umami-event="contact:faq-link"
              >
                {t("staticPages.contact.browseFaq")}
              </Link>
            </p>
          </aside>

          <section className="rounded-2xl border border-gold/10 bg-card p-5 sm:p-8 shadow-sm">
            {successMsg && (
              <div className="mb-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-medium text-muted-foreground">
                    {t("staticPages.contact.fullName")}
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder={t("staticPages.contact.namePlaceholder")}
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="h-11 sm:h-10 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">
                    {t("staticPages.contact.emailAddress")}
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={t("staticPages.contact.emailPlaceholder")}
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="h-11 sm:h-10 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="subject" className="text-xs font-medium text-muted-foreground">
                  {t("staticPages.contact.subject")}
                </Label>
                <Input
                  id="subject"
                  name="subject"
                  placeholder={t("staticPages.contact.subjectPlaceholder")}
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="h-11 sm:h-10 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="message" className="text-xs font-medium text-muted-foreground">
                  {t("staticPages.contact.message")}
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder={t("staticPages.contact.messagePlaceholder")}
                  required
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="min-h-[100px] sm:min-h-[120px] text-sm"
                />
              </div>

              <GoldButton
                type="submit"
                className="w-full"
                disabled={mutation.isPending}
                data-umami-event="contact:form-submit"
              >
                {mutation.isPending
                  ? t("staticPages.contact.sending")
                  : t("staticPages.contact.sendMessage")}
              </GoldButton>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
