import axios, { type AxiosInstance, type AxiosError } from "axios";

export interface ServerAxiosOptions {
  baseURL: string;
  defaultTimeout?: number;
  publicTimeout?: number;
  onError?: (path: string, error: unknown, isTimeout: boolean) => void;
}

export function createServerAxios(options: ServerAxiosOptions): AxiosInstance {
  const { baseURL, defaultTimeout = 30_000, onError } = options;

  const instance = axios.create({
    baseURL,
    timeout: defaultTimeout,
    headers: { Accept: "application/json" },
  });

  instance.interceptors.request.use((config) => {
    config.headers.set("X-Request-ID", crypto.randomUUID());
    return config;
  });

  instance.interceptors.response.use(
    (res) => res,
    (error: AxiosError) => {
      if (error.code === "ECONNABORTED" && typeof process !== "undefined" && process.env.NODE_ENV === "development") {
        console.warn(`[server-axios] Timeout on ${error.config?.url}, retrying...`);
      }
      onError?.(error.config?.url ?? "", error, error.code === "ECONNABORTED");
      return Promise.resolve({ data: null, status: null, statusText: "error", headers: {}, config: error.config });
    },
  );

  return instance;
}
