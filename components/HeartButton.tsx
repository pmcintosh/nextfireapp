import { auth, firestore, increment } from "@/lib/firebase";
import {
  doc,
  DocumentData,
  DocumentReference,
  writeBatch,
} from "firebase/firestore";
import { useDocument } from "react-firebase-hooks/firestore";

export default function HeartButton({
  postRef,
}: {
  postRef: DocumentReference<DocumentData>;
}) {
  const heartRef = doc(
    firestore,
    `${postRef.path}/hearts/${auth.currentUser?.uid}`
  );
  const [heartDoc] = useDocument(heartRef);

  // Create a user-to-post relationship
  const addHeart = async () => {
    const uid = auth.currentUser?.uid;
    const batch = writeBatch(firestore);

    batch.update(postRef, { heartCount: increment(1) });
    batch.set(heartRef, { uid });

    await batch.commit();
  };

  // Remove a user-to-post relationship
  const removeHeart = async () => {
    const batch = writeBatch(firestore);
    batch.update(postRef, { heartCount: increment(-1) });
    batch.delete(heartRef);
    await batch.commit();
  };

  return heartDoc?.exists() ? (
    <button onClick={removeHeart}>💔 Unheart</button>
  ) : (
    <button onClick={addHeart}>💗 Heart</button>
  );
}
