import { dbConnect } from "@luxero/api-db";
import { EmailSettings, type IEmailSettings } from "@luxero/api-db/models";

let _cache: IEmailSettings | null = null;
let _cacheExpiry = 0;
const CACHE_TTL_MS = 60_000;

export type { IEmailSettings };

const DEFAULTS: Omit<IEmailSettings, "siteUrl"> & { siteUrl?: never } = {
  _id: "email_settings",
  fromName: "Luxero",
  fromEmail: "contact@luxero.win",
  supportAddress: "contact@luxero.win",
  social: {
    facebook: "",
    instagram: "",
    whatsapp: "",
    telegram: "",
    tiktok: "",
  },
  updatedAt: new Date(),
};

export async function getEmailConfig(): Promise<IEmailSettings> {
  const now = Date.now();
  if (_cache && now < _cacheExpiry) return _cache;

  try {
    await dbConnect();

    const model = EmailSettings as any;
    const doc = await model.findOne({ _id: "email_settings" }).lean();
    if (doc) {
      _cache = doc as IEmailSettings;
    } else {
      _cache = DEFAULTS;
    }
  } catch {
    _cache = DEFAULTS;
  }

  _cacheExpiry = now + CACHE_TTL_MS;
  return _cache;
}

export function invalidateEmailConfigCache() {
  _cache = null;
  _cacheExpiry = 0;
}
