export interface EmbeddingProvider {
  embed(texts: string[]): Promise<number[][]>;
}
export const EmbeddingProvider = Symbol('EmbeddingProvider');
