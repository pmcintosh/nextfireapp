import MetaTags from "@/components/Metatags";
import PostFeed from "@/components/PostFeed";
import UserProfile from "@/components/UserProfile";
import {
  getRecentUserPostsByUid,
  getUserWithUsername,
  postToJSON,
} from "@/lib/firebase";
import { Post, UserData } from "@/lib/models";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { username } = query;
  let user = null;
  let posts = null;

  if (typeof username == "string") {
    const userDoc = await getUserWithUsername(username);

    if (userDoc) {
      user = userDoc.data();
      posts = await getRecentUserPostsByUid(userDoc.id);
    } else {
      return { notFound: true };
    }
  }

  return {
    props: { user, posts },
  };
};

interface Props {
  user: UserData;
  posts: Post[];
}

export default function UserProfilePage({ user, posts }: Props) {
  return (
    <main>
      <MetaTags
        title={`${user.displayName}'s posts`}
        description={`${user.displayName}'s posts`}
      />
      <UserProfile user={user} />
      <PostFeed posts={posts} />
    </main>
  );
}
