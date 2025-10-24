export interface Article {
  pmid: number;
  year: number;
  title: string;
  authors: string[];
  journal: string;
  is_research_article: boolean;
  relative_citation_ratio: number | null;
  nih_percentile: number | null;
  citation_count: number;
  doi: string;
}

export interface ICiteResponse {
  data: Article[];
  // The API also includes 'parameters' and 'properties' fields, but we only need 'data'.
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export type ColumnKey = keyof Article;

export interface ColumnDefinition {
  key: ColumnKey;
  label: string;
}