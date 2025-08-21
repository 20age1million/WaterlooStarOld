export interface Comment {
  id: number;
  created_at: string;
  updated_at: string;
  post_id: number;
  content: string;
  author: string;
  author_id?: number;
  likes: number;
}

export interface Post {
  id: number;
  created_at: string;
  updated_at: string;
  section: string;
  title: string;
  content: string;
  author: string;
  author_id: number;
  tags?: string;
  views: number;
  likes: number;
  is_liked?: boolean;
  comments?: Comment[];
}
