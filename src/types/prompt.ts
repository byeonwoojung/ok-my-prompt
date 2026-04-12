export interface SlotDefinition {
  name: string;
  position: { start: number; end: number };
  options: string[];
}

export interface ParsedTemplate {
  raw: string;
  slots: SlotDefinition[];
  segments: string[];
}

export interface Permutation {
  id: string;
  index: number;
  ordering: string[];
  assignment: Record<string, string>;
  resolvedPrompt: string;
}

export interface PermutationStats {
  totalPositionOrders: number;
  totalValueCombinations: number;
  totalPermutations: number;
  exceedsWarningThreshold: boolean;
  exceedsCap: boolean;
}

export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface ExecutionResult {
  id: string;
  permutationId: string;
  permutation: Permutation;
  status: ExecutionStatus;
  response: string | null;
  model: string;
  provider: string;
  latencyMs: number | null;
  usage: { promptTokens: number; completionTokens: number } | null;
  rating: number | null;
  error: string | null;
  createdAt: Date;
}

export interface SavedPrompt {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  prompt_type: 'text' | 'image';
  template: string;
  placeholders: SlotDefinition[];
  model_config: {
    provider: string;
    model: string;
    parameters: Record<string, number>;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface SessionPrompt {
  id: string;
  template: string;
  placeholders: SlotDefinition[];
  model_config: {
    provider: string;
    model: string;
    parameters: Record<string, number>;
  } | null;
  created_at: string;
}
