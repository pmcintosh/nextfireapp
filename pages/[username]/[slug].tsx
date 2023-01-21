import AuthCheck from "@/components/AuthCheck";
import HeartButton from "@/components/HeartButton";
import MetaTags from "@/components/Metatags";
import PostContent from "@/components/PostContent";
import {
  firestore,
  firestorePostToType,
  getPost,
  getPostPaths,
  getUserWithUsername,
} from "@/lib/firebase";
import { Post } from "@/lib/models";
import { doc } from "firebase/firestore";
import { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import { ParsedUrlQuery } from "querystring";
import { useDocumentData } from "react-firebase-hooks/firestore";

type StaticProps = ParsedUrlQuery & {
  username: string | undefined;
  slug: string | undefined;
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  if (!params) return { notFound: true };
  const { username, slug } = params;
  let path = null;
  let post = null;

  let result;
  if (
    !username ||
    !slug ||
    typeof username != "string" ||
    typeof slug != "string"
  )
    return { notFound: true };

  const userDoc = username ? await getUserWithUsername(username) : null;
  if (userDoc) {
    const postRef = await getPost(userDoc, slug);
    path = `users/${userDoc.id}/posts/${slug}`;
    post = postRef.exists() ? firestorePostToType(postRef) : null;
    return { props: { post, path }, revalidate: 5000 };
  }

  return { notFound: true };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = await getPostPaths();
  return { paths, fallback: "blocking" };
};

interface PostPageProps {
  post: Post;
  path: string;
}

export default function PostPage(props: PostPageProps) {
  const postRef = doc(firestore, props.path);
  const [realtimePost] = useDocumentData(postRef);
  // const post = props.post;
  const post =
    realtimePost !== undefined ? firestorePostToType(realtimePost) : props.post;

  //  className={styles.container} ?
  return (
    <main>
      <MetaTags title={post.title} description={post.title} />
      <section>
        <PostContent post={post} />
      </section>
      <aside className="card">
        <p>
          <strong>{post.heartCount || 0} ❤️</strong>
        </p>

        <AuthCheck
          fallback={
            <Link href="/enter">
              <button>❤️ Sign Up</button>
            </Link>
          }
        >
          <HeartButton postRef={postRef} />
        </AuthCheck>
      </aside>
    </main>
  );
}
