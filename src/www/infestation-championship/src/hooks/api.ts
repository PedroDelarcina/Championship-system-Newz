import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPostFull,
  apiPut,
  mapLoginToAuth,
} from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import type {
  ApiResponse,
  CampeonatoDetalhes,
  CampeonatoRequestDto,
  CampeonatoResponseDto,
  ForgotPasswordDto,
  InscricaoListDto,
  InscricaoRequestDto,
  LoginDto,
  RegistroDto,
  ResetPasswordDto,
  TimeRequestDto,
  TimeResponseDto,
  TokenResponseDto,
  User,
  UsuarioResponseDto,
} from "@/types/api";

// ============ AUTH ============
export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  return useMutation({
    mutationFn: (data: LoginDto) =>
      apiPost<TokenResponseDto>("/Auth/Login", data, { skipAuth: true }),
    onSuccess: (data) => {
      const { token, user } = mapLoginToAuth(data);
      setAuth(token, user);
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegistroDto) =>
      apiPost<UsuarioResponseDto>("/Auth/Registro", data, { skipAuth: true }),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordDto) =>
      apiPostFull<boolean>("/Auth/EsqueciSenha", data, { skipAuth: true }),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: ResetPasswordDto) =>
      apiPostFull<boolean>("/Auth/ResetarSenha", data, { skipAuth: true }),
  });
}

// ============ CAMPEONATOS ============
export function useCampeonatos(status?: string) {
  return useQuery({
    queryKey: ["campeonatos", status ?? "all"],
    queryFn: async () => {
      const path = status === "ativos" ? "/Campeonato/Ativos" : "/Campeonato";
      return apiGet<CampeonatoResponseDto[]>(path);
    },
  });
}

export function useCampeonato(id: string | number | undefined) {
  return useQuery({
    queryKey: ["campeonato", id],
    enabled: id !== undefined && id !== "",
    queryFn: async () => {
      const [campeonato, inscricoes] = await Promise.all([
        apiGet<CampeonatoResponseDto>(`/Campeonato/${id}`, { skipAuth: true }),
        apiGet<InscricaoListDto[]>(`/Inscricao/campeonato/${id}`, {
          skipAuth: true,
        }),
      ]);
      return {
        ...campeonato,
        inscricoes,
      } satisfies CampeonatoDetalhes;
    },
  });
}

export type CampeonatoFormData = CampeonatoRequestDto;

export function useCreateCampeonato() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CampeonatoFormData) =>
      apiPost<unknown>("/Campeonato/Criar", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campeonatos"] }),
  });
}

export function useUpdateCampeonato() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string | number;
      data: CampeonatoFormData;
    }) => apiPut<unknown>(`/Campeonato/${id}`, data),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["campeonatos"] });
      qc.invalidateQueries({ queryKey: ["campeonato", vars.id] });
    },
  });
}

export function useDeleteCampeonato() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => apiDelete(`/Campeonato/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campeonatos"] }),
  });
}

export function useToggleCampeonatoStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) =>
      apiPatch(`/Campeonato/${id}/alternar-status`),
    onSuccess: (_d, id) => {
      qc.invalidateQueries({ queryKey: ["campeonatos"] });
      qc.invalidateQueries({ queryKey: ["campeonato", id] });
    },
  });
}

export function useInscreverCampeonato() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: InscricaoRequestDto) =>
      apiPost<unknown>("/Inscricao", payload),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["campeonato", vars.campeonatoId] });
      qc.invalidateQueries({ queryKey: ["meus-times"] });
    },
  });
}

// ============ INSCRIÇÕES (admin) ============
export function useInscricoes() {
  return useQuery({
    queryKey: ["inscricoes"],
    queryFn: () => apiGet<InscricaoListDto[]>("/Inscricao"),
  });
}

function makeInscricaoMutation(action: "aprovar" | "rejeitar" | "eliminar" | "campeao") {
  return function useInscricaoAction() {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (inscricaoId: string | number) =>
        apiPost<unknown>(`/Inscricao/${inscricaoId}/${action}`),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["inscricoes"] });
        qc.invalidateQueries({ queryKey: ["campeonatos"] });
        qc.invalidateQueries({ queryKey: ["campeonato"] });
        qc.invalidateQueries({ queryKey: ["meus-times"] });
        qc.invalidateQueries({ queryKey: ["time"] });
      },
    });
  };
}
export const useAprovarInscricao = makeInscricaoMutation("aprovar");
export const useReprovarInscricao = makeInscricaoMutation("rejeitar");
export const useEliminarInscricao = makeInscricaoMutation("eliminar");
export const useDefinirCampeao = makeInscricaoMutation("campeao");

export function useRemoverInscricao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (inscricaoId: string | number) =>
      apiDelete(`/Inscricao/${inscricaoId}/removerInscricao`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inscricoes"] });
      qc.invalidateQueries({ queryKey: ["campeonatos"] });
      qc.invalidateQueries({ queryKey: ["campeonato"] });
      qc.invalidateQueries({ queryKey: ["meus-times"] });
      qc.invalidateQueries({ queryKey: ["time"] });
    },
  });
}

// ============ TIMES ============
export function useMeusTimes() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ["meus-times"],
    enabled: !!token,
    queryFn: () => apiGet<TimeResponseDto[]>("/Time/meus-times"),
  });
}

export function useTime(id: string | number | undefined) {
  return useQuery({
    queryKey: ["time", id],
    enabled: id !== undefined,
    queryFn: () => apiGet<TimeResponseDto>(`/Time/${id}`),
  });
}

export type TimeFormData = TimeRequestDto;

export function useUploadLogo() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const body = await apiPost<{ url: string }>("/Upload/logo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return body.url;
    },
  });
}

type CreateTimeLegacyResponse = { id?: number; timeId?: number };

export function useCreateTime() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: TimeFormData) => {
      const result = await apiPost<number | CreateTimeLegacyResponse>("/Time", data);
      if (typeof result === "number") return { id: result };
      const id = result.id ?? result.timeId;
      if (id == null) throw new Error("Resposta da API sem id do time.");
      return { id };
    },
    onSuccess: (time) => {
      qc.invalidateQueries({ queryKey: ["meus-times"] });
      return time;
    },
  });
}

export function useDeleteTime() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => apiDelete(`/Time/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["meus-times"] });
    },
  });
}

export function useAddJogador() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      timeId,
      usuarioId,
    }: {
      timeId: string | number;
      usuarioId: string;
    }) =>
      apiPost("/Time/adicionar-jogador", {
        timeId: Number(timeId),
        usuarioId,
      }),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["time", vars.timeId] });
      qc.invalidateQueries({ queryKey: ["meus-times"] });
    },
  });
}

export function useRemoveJogador() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      timeId,
      jogadorId,
    }: {
      timeId: string | number;
      jogadorId: string | number;
    }) => apiDelete(`/Time/${timeId}/remover-jogador/${jogadorId}`),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["time", vars.timeId] });
      qc.invalidateQueries({ queryKey: ["meus-times"] });
    },
  });
}

// ============ PERFIL ============
export function usePerfil() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ["perfil"],
    enabled: !!token,
    queryFn: () => apiGet<User>("/Auth/Usuario"),
  });
}

export type { ApiResponse };
