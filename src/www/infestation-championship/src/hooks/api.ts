import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import type {
  CampeonatoDetalhes,
  CampeonatoRequestDto,
  CampeonatoResponseDto,
  InscricaoListDto,
  InscricaoRequestDto,
  LoginDto,
  RegistroDto,
  RegistroResponseDto,
  TimeRequestDto,
  TimeResponseDto,
  TokenResponseDto,
  User,
} from "@/types/api";

// ============ AUTH ============
export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  return useMutation({
    mutationFn: async (data: LoginDto) => {
      const res = await api.post<TokenResponseDto>("/Auth/Login", data);
      return res.data;
    },
    onSuccess: (data) =>
      setAuth(data.token, {
        id: data.userId,
        email: data.email,
        nickName: data.nickname,
        isAdmin: data.isAdmin,
        dataRegistro: new Date().toISOString(),
      }),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: async (data: RegistroDto) => {
      const res = await api.post<RegistroResponseDto>("/Auth/Registro", data);
      return res.data;
    },
  });
}

// ============ CAMPEONATOS ============
export function useCampeonatos(status?: string) {
  return useQuery({
    queryKey: ["campeonatos", status ?? "all"],
    queryFn: async () => {
      const path = status === "ativos" ? "/Campeonato/Ativos" : "/Campeonato";
      const res = await api.get<CampeonatoResponseDto[]>(path);
      return res.data;
    },
  });
}

export function useCampeonato(id: string | number | undefined) {
  return useQuery({
    queryKey: ["campeonato", id],
    enabled: id !== undefined,
    queryFn: async () => {
      const [campeonatoRes, inscricoesRes] = await Promise.all([
        api.get<CampeonatoResponseDto>(`/Campeonato/${id}`),
        api.get<InscricaoListDto[]>(`/Inscricao/campeonato/${id}`),
      ]);
      return {
        ...campeonatoRes.data,
        inscricoes: inscricoesRes.data,
      } satisfies CampeonatoDetalhes;
    },
  });
}

export type CampeonatoFormData = CampeonatoRequestDto;

export function useCreateCampeonato() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CampeonatoFormData) => {
      const res = await api.post("/Campeonato/Criar", data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campeonatos"] }),
  });
}

export function useUpdateCampeonato() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string | number;
      data: CampeonatoFormData;
    }) => {
      const res = await api.put(`/Campeonato/${id}`, data);
      return res.data;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["campeonatos"] });
      qc.invalidateQueries({ queryKey: ["campeonato", vars.id] });
    },
  });
}

export function useDeleteCampeonato() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string | number) => {
      await api.delete(`/Campeonato/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campeonatos"] }),
  });
}

export function useToggleCampeonatoStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string | number) => {
      await api.patch(`/Campeonato/${id}/alternar-status`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campeonatos"] }),
  });
}

export function useInscreverCampeonato() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: InscricaoRequestDto) => {
      const res = await api.post("/Inscricao", payload);
      return res.data;
    },
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
    queryFn: async () => {
      const res = await api.get<InscricaoListDto[]>("/Inscricao");
      return res.data;
    },
  });
}

function makeInscricaoMutation(action: "aprovar" | "rejeitar" | "eliminar" | "campeao") {
  return function useInscricaoAction() {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: async (inscricaoId: string | number) => {
        const res = await api.post(`/Inscricao/${inscricaoId}/${action}`);
        return res.data;
      },
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["inscricoes"] });
        qc.invalidateQueries({ queryKey: ["campeonatos"] });
        qc.invalidateQueries({ queryKey: ["campeonato"] });
      },
    });
  };
}
export const useAprovarInscricao = makeInscricaoMutation("aprovar");
export const useReprovarInscricao = makeInscricaoMutation("rejeitar");
export const useEliminarInscricao = makeInscricaoMutation("eliminar");
export const useDefinirCampeao = makeInscricaoMutation("campeao");

// ============ TIMES ============
export function useMeusTimes() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ["meus-times"],
    enabled: !!token,
    queryFn: async () => {
      const res = await api.get<TimeResponseDto[]>("/Time/meus-times");
      return res.data;
    },
  });
}

export function useTime(id: string | number | undefined) {
  return useQuery({
    queryKey: ["time", id],
    enabled: id !== undefined,
    queryFn: async () => {
      const res = await api.get<TimeResponseDto>(`/Time/${id}`);
      return res.data;
    },
  });
}

export type TimeFormData = TimeRequestDto;

export function useCreateTime() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: TimeFormData) => {
      const res = await api.post("/Time", data);
      return res.data;
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
    mutationFn: async (id: string | number) => {
      await api.delete(`/Time/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["meus-times"] });
    },
  });
}

export function useAddJogador() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      timeId,
      usuarioId,
    }: {
      timeId: string | number;
      usuarioId: string;
    }) => {
      const res = await api.post("/Time/adicionar-jogador", {
        timeId: Number(timeId),
        usuarioId,
      });
      return res.data;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["time", vars.timeId] });
      qc.invalidateQueries({ queryKey: ["meus-times"] });
    },
  });
}

export function useRemoveJogador() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      timeId,
      jogadorId,
    }: {
      timeId: string | number;
      jogadorId: string | number;
    }) => {
      await api.delete(`/Time/${timeId}/remover-jogador/${jogadorId}`);
    },
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
    queryFn: async () => {
      const res = await api.get<User>("/Auth/Usuario");
      return res.data;
    },
  });
}
