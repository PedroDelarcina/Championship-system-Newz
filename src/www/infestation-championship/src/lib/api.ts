import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";
import i18n from "@/i18n";
import { useAuthStore } from "@/stores/auth-store";
import type { ApiResponse, TokenResponseDto, User } from "@/types/api";

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

/** Base da API sem o sufixo /api — usada para servir arquivos estáticos (logos). */
export function getApiOrigin(): string {
  const base = import.meta.env.VITE_API_URL || defaultApiBase;
  return base.replace(/\/api\/?$/, "");
}

/** Converte URL relativa (/uploads/...) ou absoluta em URL completa para exibição. */
export function resolveAssetUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:") ||
    url.startsWith("blob:")
  ) {
    return url;
  }
  const origin = getApiOrigin();
  return `${origin}${url.startsWith("/") ? url : `/${url}`}`;
}

/** Detecta resposta no formato { message, data } do BaseController.FromResult. */
export function isApiEnvelope(value: unknown): value is ApiResponse<unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    "data" in value &&
    "message" in value &&
    typeof (value as ApiResponse<unknown>).message === "string"
  );
}

/** Extrai `data` do envelope ou retorna o payload legado (migração gradual). */
export function unwrapApiData<T>(payload: unknown): T {
  if (isApiEnvelope(payload)) {
    return payload.data as T;
  }
  return payload as T;
}

/** Normaliza qualquer resposta para o envelope tipado. */
export function toApiResponse<T>(payload: unknown): ApiResponse<T> {
  if (isApiEnvelope(payload)) {
    return payload as ApiResponse<T>;
  }
  return { message: "", data: payload as T };
}

async function requestData<T>(
  request: () => Promise<AxiosResponse<unknown>>,
): Promise<T> {
  const res = await request();
  return unwrapApiData<T>(res.data);
}

async function requestFull<T>(
  request: () => Promise<AxiosResponse<unknown>>,
): Promise<ApiResponse<T>> {
  const res = await request();
  return toApiResponse<T>(res.data);
}

/** GET — retorna apenas `data` (compatível com envelope e formato legado). */
export function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return requestData<T>(() => api.get(url, config));
}

/** POST — retorna apenas `data`. */
export function apiPost<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  return requestData<T>(() => api.post(url, body, config));
}

/** POST — retorna `{ message, data }` (útil para toasts de sucesso). */
export function apiPostFull<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  return requestFull<T>(() => api.post(url, body, config));
}

/** PUT — retorna apenas `data`. */
export function apiPut<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  return requestData<T>(() => api.put(url, body, config));
}

/** PATCH — retorna apenas `data` (ou void). */
export function apiPatch<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  return requestData<T>(() => api.patch(url, body, config));
}

/** DELETE — retorna apenas `data` (ou void). */
export function apiDelete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return requestData<T>(() => api.delete(url, config));
}

/** Mapeia TokenResponseDto → sessão do Zustand. */
export function mapLoginToAuth(data: TokenResponseDto): {
  token: string;
  user: User;
} {
  return {
    token: data.token,
    user: {
      id: data.userId,
      email: data.email,
      nickName: data.nickname,
      isAdmin: data.isAdmin,
      dataRegistro: new Date().toISOString(),
    },
  };
}

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
      return i18n.t("common.networkError", {
        url: import.meta.env.VITE_API_URL || defaultApiBase,
      });
    }
    return err.message;
  }
  if (err instanceof Error) return err.message;
  return i18n.t("common.unknownError");
}
