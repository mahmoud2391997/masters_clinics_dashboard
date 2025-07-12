export interface Blog {
  id?: number;
  slug: string;
  title2: string;
  author: string;
  content?: string;
  tags?: string[];
  categories?: string[];
  image?: string;
  create_at?: string;
}
