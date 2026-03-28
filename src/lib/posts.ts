import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'src', 'content', 'posts');

export type PostData = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  category: string;
  tags: string[];
  link?: string;
  content: string;
};

export function getSortedPostsData(): PostData[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }
  
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const matterResult = matter(fileContents);

      let dateString = '';
      const dateVal = matterResult.data.date;
      if (dateVal instanceof Date) {
        dateString = dateVal.toISOString().split('T')[0];
      } else if (typeof dateVal === 'string') {
        dateString = dateVal;
      }

      return {
        slug,
        title: matterResult.data.title || slug,
        date: dateString,
        summary: matterResult.data.summary || '',
        category: matterResult.data.category || '',
        tags: matterResult.data.tags || [],
        link: matterResult.data.link || '',
        content: matterResult.content,
      };
    });

  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getAllPostSlugs() {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      return {
        slug: fileName.replace(/\.md$/, ''),
      };
    });
}

export function getPostData(slug: string): PostData | null {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  const matterResult = matter(fileContents);
  
  let dateString = '';
  const dateVal = matterResult.data.date;
  if (dateVal instanceof Date) {
    dateString = dateVal.toISOString().split('T')[0];
  } else if (typeof dateVal === 'string') {
    dateString = dateVal;
  }

  return {
    slug,
    title: matterResult.data.title || slug,
    date: dateString,
    summary: matterResult.data.summary || '',
    category: matterResult.data.category || '',
    tags: matterResult.data.tags || [],
    content: matterResult.content,
  };
}
