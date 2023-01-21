import firebase, { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  serverTimestamp as getServerTimestamp,
  increment as getIncrement,
  Timestamp,
  collection,
  limit,
  query,
  where,
  getDocs,
  onSnapshot,
  getDoc,
  doc,
  writeBatch,
  documentId,
  DocumentData,
  DocumentReference,
  orderBy,
  collectionGroup,
  startAfter,
} from "firebase/firestore";
import { getStorage, TaskEvent } from "firebase/storage";
import { UserInfo } from "firebase/auth";
import { Post } from "./models";

const firebaseConfig = {
  apiKey: "AIzaSyDrZ0pTDTvaWzlr0jfrbL4raLeBFpP0_7g",
  authDomain: "nextfire-6283c.firebaseapp.com",
  projectId: "nextfire-6283c",
  storageBucket: "nextfire-6283c.appspot.com",
  messagingSenderId: "547836451934",
  appId: "1:547836451934:web:e7d76e3dd3249ccccbe8cf",
};

const firebaseApp = initializeApp(firebaseConfig);

// Auth exports
export const auth = getAuth(firebaseApp);
export const googleAuthProvider = new GoogleAuthProvider();

// Firestore exports
export const firestore = getFirestore(firebaseApp);
export const serverTimestamp = getServerTimestamp();
export const fromMillis = Timestamp.fromMillis;
export const increment = getIncrement;

// Storage exports
export const storage = getStorage(firebaseApp);
// export const STATE_CHANGED = ;

/// Helper functions

export const googleSignIn = async () => {
  return await signInWithPopup(auth, googleAuthProvider);
};

export const signOutUser = async () => {
  return await signOut(auth);
};

/**`
 * Gets a users/{uid} document with username
 * @param  {string} username
 */
export async function getUserWithUsername(username: string) {
  const usersRef = collection(firestore, "users");
  const userQuery = query(
    usersRef,
    where("username", "==", username),
    limit(1)
  );

  const results = await getDocs(userQuery);
  if (results.docs.length > 0) return results.docs[0];
  return null;
}

export async function getRecentUserPostsByUid(uid: string) {
  const postsRef = collection(firestore, `users/${uid}/posts`);
  const postsQuery = query(
    postsRef,
    where("published", "==", true),
    orderBy("createdAt", "desc"),
    limit(5)
  );

  return (await getDocs(postsQuery)).docs.map(firestorePostToType);
}

export async function getRecentPosts(
  take: number,
  after: Date | Timestamp | null = null
) {
  const ref = collectionGroup(firestore, "posts");
  let docs = null;
  if (after) {
    let postsQuery = query(
      ref,
      where("published", "==", true),
      orderBy("createdAt", "desc"),
      startAfter(after),
      limit(take)
    );

    docs = (await getDocs(postsQuery)).docs;
  } else {
    let postsQuery = query(
      ref,
      where("published", "==", true),
      orderBy("createdAt", "desc"),
      limit(take)
    );

    docs = (await getDocs(postsQuery)).docs;
  }

  return docs.map(firestorePostToType);
}

export async function getPost(user: DocumentData, slug: string) {
  const ref = doc(firestore, `users/${user.id}/posts/${slug}`);
  return await getDoc(ref);
}

export async function getPostPaths() {
  const ref = collectionGroup(firestore, "posts");
  const snapshot = await getDocs(ref);
  const paths = snapshot.docs.map((doc) => {
    const { slug, username } = doc.data();
    return { params: { username, slug } };
  });

  return paths;
}

export async function subscribeToUsernameWithUid(
  uid: string,
  update: (username: string | null) => void
) {
  const usersRef = collection(firestore, "users");
  const userQuery = query(usersRef, where(documentId(), "==", uid), limit(1));
  return await onSnapshot(userQuery, (querySnapshot) => {
    console.log("docs", querySnapshot.docs);
    if (querySnapshot.docs.length > 0)
      update(querySnapshot.docs[0].data().username);
    else update(null);
  });
}

export async function usernameExists(username: string) {
  const ref = collection(firestore, "usernames");
  const docRef = doc(firestore, `usernames/${username}`);
  return (await getDoc(docRef)).exists();
}

export async function updateUsername(user: UserInfo, username: string) {
  const userRef = doc(firestore, `users/${user.uid}`);
  const usernameRef = doc(firestore, `usernames/${username}`);
  const batch = writeBatch(firestore);

  batch.set(userRef, {
    username: username,
    photoURL: user.photoURL,
    displayName: user.displayName,
  });

  batch.set(usernameRef, { uid: user.uid });
  return batch.commit();
}

/**`
 * Converts a firestore document to JSON
 * @param  {DocumentSnapshot} doc
 */
export function postToJSON(doc: any) {
  const data = doc.data();
  return {
    ...data,
    // Gotcha! firestore timestamp NOT serializable to JSON. Must convert to milliseconds
    createdAt: data?.createdAt.toMillis() || 0,
    updatedAt: data?.updatedAt.toMillis() || 0,
  };
}

export function firestorePostToType(doc: DocumentData): Post {
  const data = "data" in doc ? doc.data() : doc;
  return {
    title: data?.title,
    content: data?.content,
    createdAt: data?.createdAt?.toMillis() || 0,
    heartCount: data?.heartCount,
    published: data?.published,
    slug: data?.slug,
    uid: data?.uid,
    updatedAt: data?.updatedAt?.toMillis() || 0,
    username: data?.username,
  };
}
