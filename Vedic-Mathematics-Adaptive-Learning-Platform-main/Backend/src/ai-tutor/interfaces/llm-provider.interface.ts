export interface LlmRequest {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LlmResponse {
  content: string;
  providerName: string;
  modelName: string;
  latencyMs: number;
  tokenCount?: number;
}

export interface LlmProvider {
  readonly providerName: string;
  isAvailable(): boolean;
  generate(request: LlmRequest): Promise<LlmResponse>;
}
