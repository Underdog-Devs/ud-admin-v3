"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  User,
  createClientComponentClient,
} from "@supabase/auth-helpers-nextjs";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import { Image as tiptapImage } from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { JSONContent, useEditor } from "@tiptap/react";
import TipTapEdit from "@/components/blog/tiptapEditor/tiptap-edit";
import styles from "./edit.module.scss";
import Nav from "@/components/dashboard/nav";
import { Input } from "@/components/input";
import { useParams } from "next/navigation";
import { PostImage } from "@/components/blog/PostImage";
import { PostBlogSchema } from "@/lib/schema";
import { useRouter } from "next/navigation";

function EditPost() {
  const { id } = useParams();
  const [postTitle, setPostTitle] = useState("Loading...");
  const postTitleRef = useRef<string | null>(null);
  const [didFetch, setDidFetch] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const file = useRef<File | null>(null);
  const [fileSizeWarning, setFileSizeWarning] = useState<string | null>("");
  const [user, setUser] = useState<User | null>(null);
  const [entry, setEntry] = useState<JSONContent | null>(null);
  const [postUpdateError, setPostUpdateError] = useState<Error | null>(null);
  const [validationError, setValidationError] = useState<any>(null);
  const [timer, setTimer] = useState<any>(null);
  const [saveStatus, setSaveStatus] = useState<"Saving..." | "Saved" | null>(
    null
  );
  const [published, setPublished] = useState<boolean>(false);
  const publishedRef = useRef<boolean>(false);
  const [updating, setUpdating] = useState<boolean>(false);
  const [updated, setUpdated] = useState<boolean>(false);
  const fileChanged = useRef<boolean>(false);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const supabase = createClientComponentClient();

  const tipTapEditor = useEditor({
    extensions: [
      StarterKit,
      Highlight,
      Typography,
      tiptapImage,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    onUpdate() {
      if (tipTapEditor) {
        setUpdated(false);
        setSaveStatus(null);
        debounce(timer);
      }
    },
  });

  useEffect(() => {
    getPost();
    getUser();
  }, [supabase]);

  useEffect(() => {
    tipTapEditor?.commands.setContent(entry);
  }, [didFetch]);

  function debounce(timer: NodeJS.Timeout | null) {
    if (published) {
      return;
    }

    if (timer) {
      clearTimeout(timer);
    }

    setTimer(setTimeout(updateBlogPost, 5000));
  }

  async function getPost() {
    try {
      let { data, error: fetchError } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      setPostTitle(data.title);
      postTitleRef.current = data.title;
      setEntry(data.entry);
      setImageUrl(data.image || null);
      setPublished(data.published);
      publishedRef.current = data.published;
      setDidFetch(true);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.log(
          "Error fetching post in /blog/edit/[id]\n",
          "Error: ",
          error
        );
      }
    }
  }

  async function getUser() {
    try {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        throw error;
      }

      setUser(data.user);
    } catch (error) {
      console.log("There was an error fetching User.\n", "Error: ", error);
    }
  }

  function handleFiles(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.files || event.target.files.length === 0) {
      setFileSizeWarning(null);
      file.current = null;
      fileChanged.current = true;
      updateBlogPost();
      return;
    }
    const newFile = event.target.files[0];
    // Check file size and set warning if it's too large
    if (newFile && newFile.size > 1572864) {
      setFileSizeWarning(
        "File size exceeds 1.5MB. Please choose a smaller file."
      );
      file.current = null;
    } else {
      setFileSizeWarning(null);
      file.current = newFile;
      fileChanged.current = true;
      updateBlogPost();
    }
  }

  async function updateBlogPost() {
    setSaveStatus("Saving...");
    try {
      const validationResult = PostBlogSchema.safeParse({
        title: postTitleRef.current,
        entry: tipTapEditor?.getJSON()?.content?.[0]?.content?.[0]?.text,
      });

      if (validationResult.success) {
        if (formRef.current) {
          formRef.current.reset();
          setValidationError(null);
        }
      } else {
        setValidationError(validationResult.error.format());
        throw new Error("Validation failed");
      }

      let imagePath: string | null = null;
      // check if user is null, throws error
      if (!user?.id) throw new Error("Unable to find user id or id is invalid");
      // check for editor, throws error
      if (!tipTapEditor) throw new Error("Editor failed to load");
      // if file exists, user used the picker to set it
      // attempt to upload image and get url, throws error
      console.log("file is: ", file.current);
      if (file.current && fileChanged.current) {
        imagePath = imageUrl
          ? await replaceCurrentImage(imageUrl, file.current)
          : await uploadNewImage(file.current);
      } else {
        imagePath = imageUrl;
      }

      // attempt to update post
      const { error: updatePostError } = await supabase.from("posts").upsert({
        id,
        entry: tipTapEditor?.getJSON() ?? {},
        author: user?.id,
        title: postTitleRef.current,
        first_paragraph: tipTapEditor?.getText() ?? "",
        image: imagePath,
        published: publishedRef.current,
      });

      if (updatePostError) {
        throw updatePostError;
      }

      router.refresh();
      if (published) {
        setUpdated(true);
        setSaveStatus(null);
      } else {
        setSaveStatus("Saved");
      }
    } catch (error: any) {
      setPostUpdateError(error);
      console.log("There was an error updating post.\n", "Error: ", error);
      setUpdating(false);
      setSaveStatus(null);
    }
  }

  async function uploadNewImage(file: File) {
    try {
      if (file) {
        const fileExt = file.name.split(".").pop();
        const imagePath = `${user?.id}-${Math.random()}.${fileExt}`;
        const { data, error } = await supabase.storage
          .from("images")
          .upload(imagePath, file);

        if (error) {
          throw error;
        }

        setImageUrl(data.path);
        return data.path;
      }
    } catch (error) {
      console.log("Error placing image in storage: ", error);
      return null;
    }
    return null;
  }

  async function replaceCurrentImage(filePath: string, file: File) {
    try {
      // Remove old image
      const { error } = await supabase.storage
        .from("images")
        .remove([filePath]);

      if (error) {
        throw error;
      }

      // Upload new image
      const newImagePath = await uploadNewImage(file);

      // Render new image
      setImageUrl(newImagePath);

      // Return new image path to be saved in post table
      return newImagePath;
    } catch (error) {
      console.log("Error replacing image in storage: ", error);
      return null;
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUpdating(true);
    clearTimeout(timer);
    setTimer(null);
    updateBlogPost();
  }

  function eraseBlog() {
    tipTapEditor?.commands.clearContent();
    debounce(timer);
  }

  function onTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPostTitle(e.target.value);
    postTitleRef.current = e.target.value;
    debounce(timer);
  }

  function unPublish() {
    setPublished(false);
    publishedRef.current = false;
    setUpdated(false);
    setSaveStatus(null);
    updateBlogPost();
  }

  function publish() {
    setPublished(true);
    publishedRef.current = true;
    setUpdated(false);
    setSaveStatus(null);
    updateBlogPost();
  }

  return (
    <div className={styles.container}>
      <div>
        <Nav />
      </div>
      <form className={styles.main} onSubmit={handleSubmit}>
        <div className={styles.topContainer}>
          <div>
            <Input labelFor="title" labelText="Title">
              <input
                id="title"
                type="text"
                className={styles.titleInput}
                onChange={onTitleChange}
                value={postTitle || ""}
              />
            </Input>
            <PostImage url={imageUrl} size={150} />
            {validationError?.title && (
              <div className={styles.inputWarning}>
                {validationError?.title &&
                  validationError.title._errors.map(
                    (error: string, index: number) => (
                      <p key={index} className={styles.inputWarning}>
                        {error}
                      </p>
                    )
                  )}
              </div>
            )}
            <Input labelFor="featured-image" labelText="Featured Image">
              <input
                onChange={handleFiles}
                id="featured-image"
                type="file"
                accept="image/*"
              />
            </Input>
            {fileSizeWarning && (
              <p style={{ color: "red" }}>{fileSizeWarning}</p>
            )}
          </div>
        </div>

        <TipTapEdit editor={tipTapEditor} />

        {validationError?.entry && (
          <div className={styles.inputWarning}>
            {validationError?.entry &&
              validationError.entry._errors.map(
                (error: string, index: number) => (
                  <p key={index} className={styles.inputWarning}>
                    {error}
                  </p>
                )
              )}
          </div>
        )}

        <div className={styles.buttons}>
          <button type="submit" disabled={updating}>
            Update
          </button>
          <button
            type="button"
            disabled={updating}
            onClick={published ? unPublish : publish}
          >
            {published ? "Unpublish" : "Publish"}
          </button>
          <button
            className={styles.clearButton}
            onClick={eraseBlog}
            disabled={updating}
          >
            Clear
          </button>
        </div>
        {postUpdateError && (
          <p style={{ color: "red" }}>{postUpdateError.message}</p>
        )}
        {updated && (
          <p style={{ color: "green" }}>Post updated successfully!</p>
        )}
        {!published && saveStatus && (
          <p style={{ color: saveStatus === "Saving..." ? "orange" : "green" }}>
            {saveStatus}
          </p>
        )}
        {published && (
          <p style={{ color: "grey" }}>Unpublish to enable auto-saving.</p>
        )}
      </form>
    </div>
  );
}

export default EditPost;
