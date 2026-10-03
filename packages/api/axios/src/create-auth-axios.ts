import axios, { type AxiosInstance, type AxiosError } from "axios";

export interface AuthAxiosOptions {
  baseURL: string;
  timeout?: number;
}

export function createAuthAxios(options: AuthAxiosOptions): AxiosInstance {
  const instance = axios.create({
    baseURL: options.baseURL,
    withCredentials: true,
    timeout: options.timeout ?? 5_000,
  });

  instance.interceptors.response.use(
    (res) => res,
    () => Promise.resolve({ data: null, status: null, statusText: "error", headers: {}, config: undefined as any }),
  );

  return instance;
}
