export interface Dimension {
  id: string;
  type: 'choice' | 'noul' | 'score';
  instructions: string;
  criteria?: Record<string, any> | string[];
}

export interface DimensionPack {
  pack: string;
  dimensions: Dimension[];
}

export interface EvaluationResult {
  index: number;
  text: string;
  answers: Record<string, any>;
  confidence: number;
  simulated: boolean;
  raw: Record<string, any>;
}

export interface HFJevOptions {
  hfToken?: string;
  apiKey?: string;
  limit?: number;
  split?: string;
  config?: string;
  column?: string;
  dimensions?: Dimension[];
  simulate?: boolean;
}

export class HFDataset {
  id: string;
  rows: Array<{ index: number; data: Record<string, any> }>;
  features: Array<{ name: string; type: string }>;
  textColumn: string;
  dimensions: Dimension[];
  packName: string;

  adapt(newDimensions?: Dimension[]): this;
  classify(overrideDimensions?: Dimension[]): Promise<EvaluationResult[]>;
  stream(onRow: (row: EvaluationResult) => Promise<void> | void, overrideDimensions?: Dimension[]): Promise<void>;
}

export function getDynamicDimensions(datasetId?: string): DimensionPack;

export default function hfjev(
  input: string | Array<Record<string, any> | string>,
  options?: HFJevOptions
): Promise<HFDataset>;
