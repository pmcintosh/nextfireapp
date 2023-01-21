import { Post } from "@/lib/models";
import Link from "next/link";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";

interface Props {
  post?: Post;
}

export default function PostContent({ post }: Props) {
  const createdAt =
    typeof post?.createdAt === "number"
      ? new Date(post.createdAt)
      : post?.createdAt.toDate();

  return (
    <div className="card">
      <h1>{post?.title}</h1>
      <span className="text-sm">
        Written by{" "}
        <Link href={`/${post?.username}`}>
          <span className="text-info">@{post?.username}</span>
        </Link>{" "}
        on {createdAt?.toISOString()}
      </span>

      <ReactMarkdown>{post?.content ?? ""}</ReactMarkdown>
    </div>
  );
}
