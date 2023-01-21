import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { Inter } from "@next/font/google";
import toast from "react-hot-toast";
import styles from "@/styles/Home.module.css";
import { GetServerSideProps } from "next";
import { fromMillis, getRecentPosts, postToJSON } from "@/lib/firebase";
import { Post } from "@/lib/models";
import { useState } from "react";
import PostFeed from "@/components/PostFeed";
import Loader from "@/components/Loader";
import MetaTags from "@/components/Metatags";

const inter = Inter({ subsets: ["latin"] });
const LIMIT = 5;

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const posts = await getRecentPosts(LIMIT);
  return { props: { posts, loading: false, postsEnd: false } };
};

interface Props {
  posts: Post[];
  loading: boolean;
  postsEnd: boolean;
}

export default function Home(props: Props) {
  const [posts, setPosts] = useState<Post[]>(props.posts);
  const [loading, setLoading] = useState(props.loading);
  const [postsEnd, setPostsEnd] = useState(props.postsEnd);

  const getMorePosts = async () => {
    setLoading(true);
    const last = posts[posts.length - 1];
    const cursor =
      typeof last.createdAt === "number"
        ? fromMillis(last.createdAt)
        : last.createdAt;

    const response = await getRecentPosts(LIMIT, cursor);
    setPosts(posts.concat(response));
    setLoading(false);
    if (response.length < LIMIT) {
      setPostsEnd(true);
    }
  };

  return (
    <main>
      <MetaTags title="Main Feed" description="Recent Posts" />
      <PostFeed posts={posts} />
      {!loading && !postsEnd && (
        <button onClick={getMorePosts}>Load more</button>
      )}

      <Loader show={loading} />
      {postsEnd && "You have reached the end!"}
    </main>
  );
}
