export type SocialIconName =
  | "facebook"
  | "instagram"
  | "whatsapp"
  | "telegram"
  | "tiktok"
  | "youtube";

export interface SocialLink {
  label: string;
  href: string;
  icon: SocialIconName;
}

export const SOCIAL_LINKS: SocialLink[] = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61592003516271",
    icon: "facebook",
  },
  { label: "Instagram", href: "https://www.instagram.com/win.luxero/", icon: "instagram" },
  {
    label: "WhatsApp",
    href: "https://chat.whatsapp.com/GPcQAlYiSwNGL2NcGZY0Bg",
    icon: "whatsapp",
  },
  { label: "Telegram", href: "https://t.me/luxero_competitions", icon: "telegram" },
  { label: "TikTok", href: "https://www.tiktok.com/@luxero.win", icon: "tiktok" },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@Luxero_win",
    icon: "youtube",
  },
];
