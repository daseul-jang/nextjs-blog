import path from 'path';
import { promises as fs } from 'fs';
import { cache } from 'react';

export type Post = {
  title: string;
  description: string;
  date: Date;
  category: string;
  path: string;
  featured: boolean;
};

export type PostData = Post & {
  content: string;
  next: Post | null;
  prev: Post | null;
};

// 페이지 렌더링 시 cache 적용 (중복된 데이터 요청 제거)
// 한 페이지 내의 여러 컴포넌트에서 같은 함수 호출시 cache 된 값을 이용
// 같은 함수가 중복 호출되는 걸 방지 => 성능 UP
export const getAllPosts = cache(async () => {
  const filePath = path.join(process.cwd(), 'data', 'posts.json');
  const data = await fs.readFile(filePath, 'utf-8');
  const posts: Post[] = await JSON.parse(data);
  return posts.sort((a, b) => (a.date > b.date ? -1 : 1));
});

export async function getFeaturedPosts(): Promise<Post[]> {
  return getAllPosts().then((posts) => posts.filter((post) => post.featured));
}

export async function getNonFeaturedPosts(): Promise<Post[]> {
  return getAllPosts().then((posts) => posts.filter((post) => !post.featured));
}

export async function getPostData(fileName: string): Promise<PostData> {
  const filePath = path.join(process.cwd(), 'data', 'posts', `${fileName}.md`);
  const posts = await getAllPosts();
  const post = posts.find((post) => post.path === fileName);

  if (!post) throw new Error(`${fileName}에 해당하는 포스트가 없습니다.`);

  const content = await fs.readFile(filePath, 'utf-8');
  const index = posts.indexOf(post);
  const next = index > 0 ? posts[index - 1] : null;
  const prev = index < posts.length - 1 ? posts[index + 1] : null;
  return { ...post, content, next, prev };
}
