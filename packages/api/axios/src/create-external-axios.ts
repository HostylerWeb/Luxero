import axios, { type AxiosInstance, type AxiosError } from "axios";
import axiosRetry from "axios-retry";

export interface ExternalAxiosAuth {
  type: "bearer" | "basic" | "form-body";
  getToken?: () => Promise<string | null>;
  clientId?: string;
  clientSecret?: string;
}

export interface ExternalAxiosOptions {
  baseURL: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  auth?: ExternalAxiosAuth;
}

export function createExternalAxios(options: ExternalAxiosOptions): AxiosInstance {
  const { baseURL, timeout = 10_000, retries = 2, retryDelay = 250, auth } = options;

  const instance = axios.create({
    baseURL,
    timeout,
    headers: { Accept: "application/json" },
  });

  instance.interceptors.request.use(async (config) => {
    config.headers.set("X-Request-ID", crypto.randomUUID());

    if (auth) {
      if (auth.type === "bearer" && auth.getToken) {
        const token = await auth.getToken();
        if (token) {
          config.headers.set("Authorization", `Bearer ${token}`);
        }
      } else if (auth.type === "basic" && auth.clientId && auth.clientSecret) {
        const encoded = btoa(`${auth.clientId}:${auth.clientSecret}`);
        config.headers.set("Authorization", `Basic ${encoded}`);
      } else if (auth.type === "form-body" && auth.clientId && auth.clientSecret) {
        if (config.data) {
          const params = new URLSearchParams(config.data);
          params.set("client_id", auth.clientId);
          params.set("client_secret", auth.clientSecret);
          config.data = params.toString();
          config.headers.set("Content-Type", "application/x-www-form-urlencoded");
        }
      }
    }

    return config;
  });

  axiosRetry(instance, {
    retries,
    retryDelay: (retryCount) => retryCount * retryDelay,
    retryCondition: (error: AxiosError) => {
      return !error.response || error.response.status >= 500;
    },
    onRetry: (retryCount, error) => {
      console.warn(`[external-axios] Retry ${retryCount} for ${error.config?.url}`);
    },
  });

  return instance;
}
