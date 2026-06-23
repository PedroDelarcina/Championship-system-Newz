import axios from "axios";
import { useAuthStore } from "@/stores/auth-store";

const defaultApiBase = "http://localhost:7180/api";

declare module "axios" {
  export interface AxiosRequestConfig {
    /** Não envia Authorization (rotas públicas mesmo com token inválido no store). */
    skipAuth?: boolean;
  }
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultApiBase,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (config.skipAuth) return config;
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error?.response?.status === 401) {
      // Token expirado/inválido — desloga
      const { token, logout } = useAuthStore.getState();
      if (token) logout();
    }
    return Promise.reject(error);
  },
);

export function getApiErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as
      | {
          message?: string;
          title?: string;
          errors?: Record<string, string[]> | string[];
        }
      | undefined;
    if (data?.message) return data.message;
    if (data?.title) return data.title;
    if (data?.errors) {
      if (Array.isArray(data.errors)) {
        const first = data.errors.find(Boolean);
        if (first) return first;
      } else {
        const first = Object.values(data.errors)[0]?.[0];
        if (first) return first;
      }
    }
    if (err.message === "Network Error") {
      return "Não foi possível conectar à API. Verifique se o backend C# está rodando em " +
        (import.meta.env.VITE_API_URL || defaultApiBase);
    }
    return err.message;
  }
  if (err instanceof Error) return err.message;
  return "Erro desconhecido";
}
