export type MediaConverterScope =
  | "media_library"
  | "competition_prizes"
  | "landing_videos"
  | "avatars"
  | "og_images";

export type MediaConverterScopeMap = Record<MediaConverterScope, boolean>;

export interface MediaConverterImageSettings {
  enabled: boolean;
  quality: number;
  maxWidth: number;
  maxHeight: number;
  scopes: MediaConverterScopeMap;
}

export interface MediaConverterVideoSettings {
  enabled: boolean;
  quality: number;
  maxWidth: number;
  preserveAudio: boolean;
  scopes: MediaConverterScopeMap;
}

export interface MediaConverterSettings {
  _id: "media_converter_settings";
  addonEnabled: boolean;
  image: MediaConverterImageSettings;
  video: MediaConverterVideoSettings;
}

export type MediaConverterBulkConvertStatus =
  | "converted"
  | "skipped"
  | "failed"
  | "already_optimal";

export interface MediaConverterBulkCatalogItem {
  key: string;
  kind: "image" | "video";
  scope: MediaConverterScope;
  contentType: string;
}

export interface MediaConverterBulkPreview {
  eligibleImages: number;
  eligibleVideos: number;
  alreadyTargetFormat: number;
  skipped: number;
  items: MediaConverterBulkCatalogItem[];
}

export interface MediaConverterBulkConvertResultItem {
  key: string;
  newKey: string;
  kind: "image" | "video";
  status: MediaConverterBulkConvertStatus;
  oldUrl: string;
  newUrl: string;
  originalKeyForDeletion?: string;
  verified: boolean;
  documentsUpdated: number;
  error?: string;
}

export interface MediaConverterBulkVerifyResultItem {
  key: string;
  ok: boolean;
  contentType?: string;
  contentLength?: number;
  error?: string;
}

export const DEFAULT_MEDIA_CONVERTER_SCOPES: MediaConverterScopeMap = {
  media_library: true,
  competition_prizes: true,
  landing_videos: false,
  avatars: true,
  og_images: true,
};

export const DEFAULT_MEDIA_CONVERTER_VIDEO_SCOPES: MediaConverterScopeMap = {
  media_library: false,
  competition_prizes: false,
  landing_videos: true,
  avatars: false,
  og_images: false,
};

export const DEFAULT_MEDIA_CONVERTER_SETTINGS: MediaConverterSettings = {
  _id: "media_converter_settings",
  addonEnabled: false,
  image: {
    enabled: false,
    quality: 82,
    maxWidth: 2560,
    maxHeight: 2560,
    scopes: { ...DEFAULT_MEDIA_CONVERTER_SCOPES, landing_videos: false },
  },
  video: {
    enabled: false,
    quality: 75,
    maxWidth: 1920,
    preserveAudio: true,
    scopes: { ...DEFAULT_MEDIA_CONVERTER_VIDEO_SCOPES },
  },
};
