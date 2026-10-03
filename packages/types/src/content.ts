export interface EmailSettings {
  _id: "email_settings";
  fromName: string;
  fromEmail: string;
  supportAddress: string;
  social: {
    facebook: string;
    instagram: string;
    whatsapp: string;
    telegram: string;
    tiktok: string;
  };
  updatedAt: Date;
}
