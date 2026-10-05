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

function safeParsePost(fileContents: string, slug: string) {
  try {
    const matterResult = matter(fileContents);
    let dateString = '';
    const dateVal = matterResult.data.date;
    if (dateVal instanceof Date) {
      dateString = dateVal.toISOString().split('T')[0];
    } else if (typeof dateVal === 'string') {
      dateString = dateVal.trim();
    }

    return {
      slug,
      title: matterResult.data.title || slug,
      date: dateString,
      summary: matterResult.data.summary || '',
      category: matterResult.data.category || '생활정보',
      tags: matterResult.data.tags || [],
      link: matterResult.data.link || '',
      content: matterResult.content || '',
    };
  } catch (e) {
    // YAML 파싱 실패 시 정규식으로 안전하게 추출
    const titleMatch = fileContents.match(/title:\s*"?([^"\n]+)"?/);
    const dateMatch = fileContents.match(/date:\s*"?([^"\n]+)"?/);
    const summaryMatch = fileContents.match(/summary:\s*"?([^"\n]+)"?/);
    const categoryMatch = fileContents.match(/category:\s*"?([^"\n]+)"?/);
    const content = fileContents.replace(/^---[\s\S]*?---\s*/, '');

    const dateMatchFromSlug = slug.match(/^(\d{4}-\d{2}-\d{2})/);

    return {
      slug,
      title: titleMatch ? titleMatch[1].trim() : slug,
      date: dateMatch ? dateMatch[1].trim() : (dateMatchFromSlug ? dateMatchFromSlug[1] : ''),
      summary: summaryMatch ? summaryMatch[1].trim() : '',
      category: categoryMatch ? categoryMatch[1].trim() : '생활정보',
      tags: [],
      content,
    };
  }
}

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
      return safeParsePost(fileContents, slug);
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
  return safeParsePost(fileContents, slug);
}
