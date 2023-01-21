import styles from "../../styles/Admin.module.css";
import AuthCheck from "@/components/AuthCheck";
import MetaTags from "@/components/Metatags";
import ImageUploader from "../../components/ImageUploader";
import { auth, firestore } from "@/lib/firebase";
import {
  deleteDoc,
  doc,
  DocumentData,
  DocumentReference,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useRouter } from "next/router";
import { useState } from "react";
import { useDocumentDataOnce } from "react-firebase-hooks/firestore";
import { useForm } from "react-hook-form";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import toast from "react-hot-toast";
import { ErrorMessage } from "@hookform/error-message";
import Link from "next/link";

interface PostFormProps {
  defaultValues: any;
  postRef: DocumentReference<DocumentData>;
  preview: boolean;
}

function DeletePostButton({
  postRef,
}: {
  postRef: DocumentReference<DocumentData>;
}) {
  const router = useRouter();

  const deletePost = async () => {
    const doIt = confirm("are you sure!");
    if (doIt) {
      await deleteDoc(postRef);
      router.push("/admin");
      toast("post annihilated ", { icon: "🗑️" });
    }
  };

  return (
    <button className="btn-red" onClick={deletePost}>
      Delete
    </button>
  );
}

function PostForm({ defaultValues, postRef, preview }: PostFormProps) {
  const { register, handleSubmit, reset, watch, formState } = useForm({
    defaultValues,
    mode: "onChange",
  });

  const { isDirty, isValid, errors } = formState;

  const updatePost = async (values: any) => {
    await updateDoc(postRef, {
      content: values.content,
      published: values.published,
      updatedAt: serverTimestamp(),
    });

    reset({ content: values.content, published: values.published });
    toast.success("Post updated successfully!");
  };

  return (
    <form onSubmit={handleSubmit(updatePost)}>
      {preview && (
        <div className="card">
          <ReactMarkdown>{watch("content")}</ReactMarkdown>
        </div>
      )}

      <div className={preview ? styles.hidden : styles.controls}>
        <ImageUploader />
        <textarea
          {...register("content", {
            maxLength: { value: 20000, message: "content is too long" },
            minLength: { value: 10, message: "content is too short" },
            required: { value: true, message: "content is required" },
          })}
        ></textarea>
        <ErrorMessage
          errors={errors}
          name="content"
          render={({ message }) => <p className="text-danger">{message}</p>}
        />

        <fieldset>
          <input
            className={styles.checkbox}
            type="checkbox"
            {...register("published")}
          />
          <label>Published</label>
        </fieldset>

        <button
          type="submit"
          className="btn-green"
          disabled={!isDirty || !isValid}
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}

function PostManager() {
  const [preview, setPreview] = useState(false);
  const router = useRouter();
  const { slug } = router.query;
  const postRef = doc(
    firestore,
    `users/${auth.currentUser?.uid}/posts/${slug}`
  );
  const [post] = useDocumentDataOnce(postRef);

  return (
    <main className={styles.container}>
      {post && (
        <>
          <section>
            <h1>{post.title}</h1>
            <p>ID: {post.slug}</p>

            <PostForm
              postRef={postRef}
              defaultValues={post}
              preview={preview}
            />
          </section>

          <aside>
            <h3>Tools</h3>
            <button onClick={() => setPreview(!preview)}>
              {preview ? "Edit" : "Preview"}
            </button>
            <Link href={`/${post.username}/${post.slug}`}>
              <button className="btn-blue">Live view</button>
            </Link>
            <DeletePostButton postRef={postRef} />
          </aside>
        </>
      )}
    </main>
  );
}

export default function AdminPostEdit() {
  return (
    <main>
      <MetaTags title="admin page" />
      <AuthCheck>
        <PostManager />
      </AuthCheck>
    </main>
  );
}
