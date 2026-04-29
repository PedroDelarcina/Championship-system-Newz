import axios from "axios";
import { useAuthStore } from "@/stores/auth-store";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://localhost:7180/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
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
      | { message?: string; title?: string; errors?: Record<string, string[]> }
      | undefined;
    if (data?.message) return data.message;
    if (data?.title) return data.title;
    if (data?.errors) {
      const first = Object.values(data.errors)[0]?.[0];
      if (first) return first;
    }
    if (err.message === "Network Error") {
      return "Não foi possível conectar à API. Verifique se o backend C# está rodando em " +
        (import.meta.env.VITE_API_URL || "https://localhost:7180/api");
    }
    return err.message;
  }
  if (err instanceof Error) return err.message;
  return "Erro desconhecido";
}
