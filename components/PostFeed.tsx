import { Post } from "@/lib/models";
import Link from "next/link";

interface PostFeedProps {
  posts: Post[];
  admin?: boolean;
}

interface PostItemProps {
  post: Post;
  admin?: boolean;
}

function PostItem({ post, admin }: PostItemProps) {
  const wordCount = post?.content.trim().split(/\s+/g).length;
  const minutesToRead = (wordCount / 100 + 1).toFixed(0);
  return (
    <div className="card">
      <Link href={admin ? `/admin` : `/${post.username}`}>
        <strong>By @{post.username}</strong>
      </Link>

      <Link
        href={admin ? `/admin/${post.slug}` : `/${post.username}/${post.slug}`}
      >
        <h2>{post.title}</h2>
      </Link>

      <footer>
        <span>
          {wordCount} words. {minutesToRead} min read.
        </span>
        <span>❤️ {post.heartCount} Hearts</span>
      </footer>
    </div>
  );
}

export default function PostFeed({ posts, admin }: PostFeedProps) {
  return posts ? (
    <>
      {posts.map((post) => (
        <PostItem key={post.slug} post={post} admin={admin} />
      ))}
    </>
  ) : null;
}
