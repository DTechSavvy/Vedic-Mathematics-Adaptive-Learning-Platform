export interface KnowledgeResult {
  id: number;
  title: string;
  topicId?: number | null;
  sutra?: string | null;
  technique?: string | null;
  content: string;
  contentType: string;
  source?: string | null;
  tags: string[];
}
