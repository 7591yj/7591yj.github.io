export interface PostLike {
  url: string | null;
  frontmatter: {
    title: string;
    date: string;
    description?: string;
    tags?: string[];
  };
}
