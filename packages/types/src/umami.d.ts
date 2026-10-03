interface Umami {
  identify(payload: { id: string; email?: string }): void;
  track(event: string, data?: Record<string, unknown>): void;
}

interface Window {
  umami?: Umami;
}
