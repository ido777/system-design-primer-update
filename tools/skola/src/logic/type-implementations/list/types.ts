export type ListCardContent = {
  order: "unordered" | "ordered";
  grading?: {
    orderedMode?: "strict-position" | "lcs";
    normalize?: "basic" | "aggressive";
  };
};

export interface ListNoteContent {
  promptHtml: string;
  items: Array<{
    text: string;
    aliases?: string[];
  }>;
}
