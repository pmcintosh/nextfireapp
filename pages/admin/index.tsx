import AuthCheck from "@/components/AuthCheck";
import MetaTags from "@/components/Metatags";
import PostFeed from "@/components/PostFeed";
import { UserContext } from "@/lib/context";
import { auth, firestore, firestorePostToType } from "@/lib/firebase";
import {
  collection,
  doc,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { useRouter } from "next/router";
import { useContext, useState } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import kebabCase from "lodash.kebabcase";
import { toast } from "react-hot-toast";

function CreateNewPost() {
  const router = useRouter();
  const { username } = useContext(UserContext);
  const [title, setTitle] = useState("");
  const slug = encodeURI(kebabCase(title));
  const isValid = title.length > 3 && title.length < 100;

  const createPost = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const uid = auth.currentUser?.uid;
    const ref = doc(firestore, `users/${uid}/posts/${slug}`);

    const data = {
      title,
      slug,
      uid,
      username,
      published: false,
      content: "# hello world!",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      heardCount: 0,
    };

    await setDoc(ref, data);
    toast.success("Post created!");
    router.push(`/admin/${slug}`);
  };

  return (
    <form onSubmit={createPost}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="My Awesome Article!"
      />
      <p>
        <strong>Slug: </strong>
        {slug}
      </p>
      <button type="submit" disabled={!isValid} className="btn-green">
        Create New Post
      </button>
    </form>
  );
}

function PostList() {
  const ref = collection(firestore, `users/${auth.currentUser?.uid}/posts`);
  const postsQuery = query(ref, orderBy("createdAt"));
  const [querySnapshot] = useCollection(postsQuery);
  const posts = querySnapshot?.docs.map(firestorePostToType);
  return <PostFeed posts={posts ?? []} admin />;
}

export default function AdminPostsPage() {
  return (
    <main>
      <MetaTags title="Admin Posts Page" />
      <AuthCheck>
        <h1>Manage your Posts</h1>
        <CreateNewPost />
        <PostList />
      </AuthCheck>
    </main>
  );
}
