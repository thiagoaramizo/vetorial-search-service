export class Document {
  constructor(
    public readonly id: string,
    public readonly projectId: string,
    public readonly contentId: string,
    public readonly content: string,
    public readonly embedding: number[],
  ) {}
}
