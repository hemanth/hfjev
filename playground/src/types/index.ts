export type QuestionType = 'choice' | 'noul' | 'score';

export type PastelColor = 'lavender' | 'mint' | 'peach' | 'sky' | 'rose' | 'butter' | 'lilac';

export interface Dimension {
  id: string;
  name: string;
  type: QuestionType;
  instructions: string;
  criteria: any; // Record<string, string|null> for choice, { true: string, false: string } for noul, string[] for score
  color: PastelColor;
  enabled: boolean;
  description?: string;
}

export interface ChoiceAnswer {
  type: 'choice';
  choice: string;
  probabilities: Record<string, number>;
  confidence: number;
}

export interface NoulAnswer {
  type: 'noul';
  noul: number; // probability between 0 and 1
}

export interface ScoreAnswer {
  type: 'score';
  score: number;
  legend: Record<string, string>;
  probabilities: Record<string, number>;
  confidence: number;
}

export type Answer = ChoiceAnswer | NoulAnswer | ScoreAnswer;

export interface RowEvaluation {
  model?: string;
  answers: Record<string, Answer>;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
  latencyMs?: number;
  isSimulated?: boolean;
  timestamp?: string;
}

export interface DatasetRow {
  row_idx: number;
  row: Record<string, any>;
  evaluation?: RowEvaluation;
  status?: 'idle' | 'evaluating' | 'completed' | 'error';
  error?: string;
}

export interface HFDatasetMeta {
  id: string;
  author: string;
  description: string;
  likes: number;
  downloads: number;
  tags: string[];
  gated?: boolean;
}

export interface DimensionPack {
  id: string;
  name: string;
  description: string;
  badge: string;
  color: PastelColor;
  dimensions: Dimension[];
}
