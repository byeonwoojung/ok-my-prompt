import { create } from 'zustand';
import type { AIProvider, ModelParameters } from '@/types/ai';
import type { SlotDefinition, Permutation, ExecutionResult } from '@/types/prompt';
import { PROVIDERS } from '@/lib/constants';
import { parsePlaceholders } from '@/lib/prompts/parser';
import { generatePermutations, computeStats } from '@/lib/prompts/permutations';

export type RunMode = 'shuffle' | 'batch';

interface PromptStore {
  // 템플릿 편집 상태
  template: string;
  setTemplate: (t: string) => void;

  // 파싱된 플레이스홀더와 옵션
  detectedSlots: string[];
  slots: SlotDefinition[];
  updateSlotOptions: (name: string, options: string[]) => void;

  // 실행 모드: 순서 섞기 vs 배치 (둘 중 하나)
  runMode: RunMode;
  setRunMode: (m: RunMode) => void;

  // 순서 섞기 (runMode === 'shuffle' 일 때만 적용)
  shuffleOrder: boolean;

  // 배치 (runMode === 'batch' 일 때만 적용)
  batchCount: number;
  setBatchCount: (n: number) => void;

  // 모델 설정
  provider: AIProvider;
  model: string;
  parameters: ModelParameters;
  setProvider: (p: AIProvider) => void;
  setModel: (m: string) => void;
  setParameter: (key: string, value: number) => void;

  // 실행 상태
  isRunning: boolean;
  setIsRunning: (v: boolean) => void;
  progress: { completed: number; failed: number; total: number };
  setProgress: (p: { completed: number; failed: number; total: number }) => void;

  // 결과
  results: ExecutionResult[];
  addResult: (r: ExecutionResult) => void;
  clearResults: () => void;
  updateResultRating: (resultId: string, rating: number) => void;

  // 순열 미리보기 (실시간 자동 생성)
  permutations: Permutation[];

  // 결과 뷰 모드
  viewMode: 'table' | 'grid' | 'side-by-side';
  setViewMode: (m: 'table' | 'grid' | 'side-by-side') => void;

  // 리셋
  reset: () => void;
}

const defaultProvider: AIProvider = 'openai';
const defaultModel = PROVIDERS.openai.models[0].id;

function getDefaultParameters(provider: AIProvider, modelId?: string): ModelParameters {
  const params: ModelParameters = {};
  // 1단계: provider의 parameters 정의에서 기본값 적용
  PROVIDERS[provider].parameters.forEach(p => {
    (params as Record<string, number>)[p.key] = p.defaultValue;
  });
  // 2단계: 해당 모델의 defaults로 덮어쓰기 (모델별 권장값 우선)
  if (modelId) {
    const modelInfo = PROVIDERS[provider].models.find(m => m.id === modelId);
    if (modelInfo?.defaults) {
      Object.assign(params, modelInfo.defaults);
    }
  }
  return params;
}

/** 유효한 옵션이 있는 슬롯으로 순열 자동 생성 */
function autoGeneratePermutations(
  template: string,
  slots: SlotDefinition[],
  runMode: RunMode
): Permutation[] {
  const validSlots = slots.filter(s => s.options.some(o => o.trim()));
  // 빈 문자열 옵션 필터링
  const cleanedSlots = validSlots.map(s => ({
    ...s,
    options: s.options.filter(o => o.trim()),
  }));
  if (cleanedSlots.length === 0) return [];

  const stats = computeStats(cleanedSlots, runMode === 'shuffle');
  if (stats.exceedsCap) return []; // 너무 많으면 생성하지 않음

  return generatePermutations(template, cleanedSlots, runMode === 'shuffle');
}

export const usePromptStore = create<PromptStore>((set, get) => ({
  template: '',
  setTemplate: (rawT: string) => {
    // macOS 등에서 한글 NFD(자모 분리) 입력 시 정규화. 표시는 동일.
    const t = rawT.normalize('NFC');
    const detected = parsePlaceholders(t);
    const currentSlots = get().slots;

    // 기존 슬롯의 옵션 유지, 새 슬롯에는 빈 옵션 1개 기본 추가
    const newSlots: SlotDefinition[] = detected.map(name => {
      const existing = currentSlots.find(s => s.name === name);
      return existing ?? { name, position: { start: 0, end: 0 }, options: [''] };
    });

    const perms = autoGeneratePermutations(t, newSlots, get().runMode);
    set({ template: t, detectedSlots: detected, slots: newSlots, permutations: perms });
  },

  detectedSlots: [],
  slots: [],
  updateSlotOptions: (name: string, options: string[]) => {
    const state = get();
    const newSlots = state.slots.map(s =>
      s.name === name ? { ...s, options } : s
    );
    const perms = autoGeneratePermutations(state.template, newSlots, state.runMode);
    set({ slots: newSlots, permutations: perms });
  },

  runMode: 'batch',
  setRunMode: (m) => {
    const state = get();
    const perms = autoGeneratePermutations(state.template, state.slots, m);
    set({ runMode: m, permutations: perms });
  },

  shuffleOrder: true,

  batchCount: 1,
  setBatchCount: (n) => set({ batchCount: Math.max(1, Math.min(50, n)) }),

  provider: defaultProvider,
  model: defaultModel,
  parameters: getDefaultParameters(defaultProvider, defaultModel),
  setProvider: (p) => {
    const firstModel = PROVIDERS[p].models[0].id;
    set({
      provider: p,
      model: firstModel,
      parameters: getDefaultParameters(p, firstModel),
    });
  },
  setModel: (m) => {
    // 모델 변경 시 해당 모델의 defaults로 파라미터 리셋
    set(state => ({
      model: m,
      parameters: getDefaultParameters(state.provider, m),
    }));
  },
  setParameter: (key, value) => {
    set(state => ({
      parameters: { ...state.parameters, [key]: value },
    }));
  },

  isRunning: false,
  setIsRunning: (v) => set({ isRunning: v }),
  progress: { completed: 0, failed: 0, total: 0 },
  setProgress: (p) => set({ progress: p }),

  results: [],
  addResult: (r) => set(state => ({ results: [...state.results, r] })),
  clearResults: () => set({ results: [], progress: { completed: 0, failed: 0, total: 0 } }),
  updateResultRating: (resultId, rating) => {
    set(state => ({
      results: state.results.map(r =>
        r.id === resultId ? { ...r, rating } : r
      ),
    }));
  },

  permutations: [],

  viewMode: 'grid',
  setViewMode: (m) => set({ viewMode: m }),

  reset: () => set({
    template: '',
    detectedSlots: [],
    slots: [],
    runMode: 'batch',
    shuffleOrder: true,
    batchCount: 1,
    provider: defaultProvider,
    model: defaultModel,
    parameters: getDefaultParameters(defaultProvider, defaultModel),
    isRunning: false,
    progress: { completed: 0, failed: 0, total: 0 },
    results: [],
    permutations: [],
    viewMode: 'grid',
  }),
}));
