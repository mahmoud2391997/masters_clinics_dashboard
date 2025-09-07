export interface Blog {
    created_at: string | number | Date;
    id: number;
    slug: string;
    title2: string;
    author: string;
    content?: string;
    tags?: string[];
    categories?: string[];
    image?: string;
    create_at?: string;
    date?: string;
    is_active: number;
    priority: number;
}
