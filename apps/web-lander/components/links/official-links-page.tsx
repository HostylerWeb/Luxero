"use client";

import { useEffect, useRef, useState } from "react";

const LINK_SYMBOLS = (
  <svg className="symbols" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <symbol id="share" viewBox="0 0 24 24">
      <path d="M12 16V3m-5 5 5-5 5 5M5 13v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7" />
    </symbol>
    <symbol id="instagram" viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5h.01" strokeWidth="3" />
    </symbol>
    <symbol id="tiktok" viewBox="0 0 24 24">
      <path d="M15 3v12.5a5 5 0 1 1-4-4.9M15 3c.4 3.4 2.2 5.2 6 5.5v4c-2.4-.1-4.2-.8-6-2.3" />
    </symbol>
    <symbol id="whatsapp" viewBox="0 0 24 24">
      <path d="M21 11.6a9 9 0 0 1-13.3 8L3 21l1.4-4.6A9 9 0 1 1 21 11.6Z" />
      <path
        d="m8 7 1.5-.3 1.1 2.6-1.1 1.1a8 8 0 0 0 3.8 3.8l1.1-1.1 2.6 1.1-.3 1.5c-.2 1-1.1 1.5-2 1.2a12 12 0 0 1-8-8c-.3-.9.2-1.8 1.3-1.9Z"
        strokeWidth="1.35"
      />
    </symbol>
    <symbol id="telegram" viewBox="0 0 24 24">
      <path d="m3 10 18-7-4 18-6-7-8-4Z" />
      <path d="m11 14 5-6m-5 6-1 5 3-3" />
    </symbol>
    <symbol id="youtube" viewBox="0 0 24 24">
      <rect x="2" y="5" width="20" height="14" rx="4" />
      <path d="m10 9 5 3-5 3Z" />
    </symbol>
    <symbol id="check" viewBox="0 0 24 24">
      <path d="m5 12 4 4L19 6" />
    </symbol>
  </svg>
);

const SOCIAL_LINKS = [
  {
    href: "https://t.me/luxero_competitions",
    icon: "telegram",
    name: "Telegram",
    description: "join our group for news and discounts",
  },
  {
    href: "https://www.tiktok.com/@luxero.win",
    icon: "tiktok",
    name: "TikTok",
    description: "The story, frame by frame",
  },
  {
    href: "https://www.instagram.com/win.luxero/",
    icon: "instagram",
    name: "Instagram",
    description: "A closer look at Luxero",
  },
  {
    href: "https://www.youtube.com/@Luxero_win",
    icon: "youtube",
    name: "YouTube",
    description: "Watch on YouTube",
  },
  {
    href: "https://chat.whatsapp.com/GPcQAlYiSwNGL2NcGZY0Bg",
    icon: "whatsapp",
    name: "WhatsApp",
    description: "Join the Luxero group",
  },
] as const;

export function OfficialLinksPage() {
  const [toastVisible, setToastVisible] = useState(false);
  const copyDialogRef = useRef<HTMLDialogElement>(null);
  const copyInputRef = useRef<HTMLInputElement>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    document.body.classList.add("luxero-official-links");
    return () => {
      document.body.classList.remove("luxero-official-links");
    };
  }, []);

  const handleShare = async () => {
    const url = `${window.location.origin}${window.location.pathname}`;
    try {
      if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
        await navigator.share({ title: document.title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setToastVisible(true);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => setToastVisible(false), 3000);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      const dialog = copyDialogRef.current;
      const input = copyInputRef.current;
      if (!dialog || !input) return;
      input.value = url;
      dialog.showModal();
      input.focus();
      input.select();
    }
  };

  return (
    <>
      {LINK_SYMBOLS}
      <a className="skip-link" href="#explore">Skip to links</a>
      <div className="ambient" aria-hidden="true" />
      <div className="page-shell">
        <header className="masthead">
          <a
            className="wordmark"
            href="https://luxero.win/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Luxero — official website"
          >
            LUXERO
          </a>
          <div className="header-actions">
            <button
              className="share-button"
              type="button"
              aria-label="Share this page"
              title="Share this page"
              onClick={handleShare}
            >
              <svg className="icon" aria-hidden="true">
                <use href="#share" />
              </svg>
            </button>
          </div>
        </header>

        <main>
          <section className="intro" aria-labelledby="page-title">
            <h1 id="page-title">
              <span className="motto-white">
                Everyone deserves <em>a fair chance.</em>
              </span>
              <span className="motto-gold">At something extraordinary.</span>
            </h1>
          </section>

          <section id="explore" className="destinations" aria-label="Luxero platforms">
            <a
              className="destination destination-competitions"
              href="https://luxero.win/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="destination-photo">
                <img
                  src="/links/assets/cupra.webp"
                  width={1400}
                  height={788}
                  alt="Cupra Formentor from Luxero Competitions"
                  fetchPriority="high"
                />
              </div>
              <div className="photo-shade" aria-hidden="true" />
              <div className="card-top">
                <span className="card-kicker">EXPLORE THE PLATFORM</span>
              </div>
              <div className="card-bottom">
                <div className="card-copy">
                  <h2>
                    Luxero <span>Competitions</span>
                  </h2>
                  <p className="destination-description">Cars · Tech · Cash prizes</p>
                </div>
              </div>
            </a>
            <a
              className="destination destination-agro"
              href="https://agro.luxero.win/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="destination-photo">
                <img
                  src="/links/assets/agro.webp"
                  width={1400}
                  height={788}
                  alt="John Deere from Luxero Agro"
                />
              </div>
              <div className="photo-shade" aria-hidden="true" />
              <div className="card-top">
                <span className="card-kicker">EXPLORE THE PLATFORM</span>
              </div>
              <div className="card-bottom">
                <div className="card-copy">
                  <h2>
                    Luxero <span>Agro</span>
                  </h2>
                  <p className="destination-description">Machinery · Equipment · Tools</p>
                </div>
              </div>
            </a>
          </section>

          <section className="community" aria-labelledby="community-title">
            <div className="section-heading">
              <h2 id="community-title">Follow us !</h2>
            </div>
            <div className="social-grid">
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.href}
                  className="social-link"
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="social-title">
                    <svg className="icon" aria-hidden="true">
                      <use href={`#${link.icon}`} />
                    </svg>
                    <span className="social-name">{link.name}</span>
                  </span>
                  <span className="social-description">{link.description}</span>
                </a>
              ))}
            </div>
          </section>
        </main>

        <footer className="footer">
          <div className="footer-main">
            <span>© 2026 LUXERO COMPETITIONS LTD</span>
            <span className="official-label">
              <span className="diamond" aria-hidden="true" />
              <span>OFFICIAL LINKS</span>
            </span>
          </div>
          <div className="footer-legal">
            <span>18+ · Participate responsibly.</span>
            <a href="https://luxero.win/en/terms" target="_blank" rel="noopener noreferrer">
              Terms &amp; conditions
            </a>
            <a
              href="https://luxero.win/en/free-postal-entry"
              target="_blank"
              rel="noopener noreferrer"
            >
              Free postal entry
            </a>
          </div>
        </footer>
      </div>

      <div
        className={`toast${toastVisible ? " visible" : ""}`}
        id="share-toast"
        role="status"
        aria-live="polite"
      >
        <svg className="icon" aria-hidden="true">
          <use href="#check" />
        </svg>
        <span>Luxero link copied.</span>
      </div>

      <dialog className="copy-dialog" ref={copyDialogRef} id="copy-dialog">
        <form method="dialog">
          <div className="dialog-heading">
            <h2>Share Luxero</h2>
            <button className="dialog-close" type="submit" aria-label="Close">×</button>
          </div>
          <p>Copy the link below:</p>
          <input ref={copyInputRef} id="copy-url" readOnly aria-label="Link" />
          <button className="dialog-done" type="submit">Done</button>
        </form>
      </dialog>
    </>
  );
}
