"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  User,
  createClientComponentClient,
} from "@supabase/auth-helpers-nextjs";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import { Image as tiptapImage } from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { useEditor } from "@tiptap/react";
import TipTapEdit from "@/components/blog/tiptapEditor/tiptap-edit";
import styles from "./create.module.scss";
import Nav from "@/components/dashboard/nav";
import { Input } from "@/components/input";
import { useRouter } from "next/navigation";

function CreatePost() {
  const [postTitle, setPostTitle] = useState<string | null>(null);
  const postTitleRef = useRef<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileSizeWarning, setFileSizeWarning] = useState<string | null>(null);
  const [postCreationError, setPostCreationError] = useState<Error | null>(
    null
  );
  const [saveStatus, setSaveStatus] = useState<
    "Saving..." | "Draft saved." | null
  >(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [id, setId] = useState<string | null>(null);
  const timer = useRef<NodeJS.Timeout | null>(null);

  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    getUser();
  }, [supabase]);

  function debounce() {
    console.log("Change Event");
    if (timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(postBlog, 5000);
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
      setFile(null);
      return;
    }
    const file = event.target.files[0];
    console.log("File: ", file);
    // Check file size and set warning if it's too large
    if (file && file.size > 1572864) {
      setFileSizeWarning(
        "File size exceeds 1.5MB. Please choose a smaller file."
      );
      setFile(null);
    } else {
      setFileSizeWarning(null);
      setFile(file);
    }
  }

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
        debounce();
      }
    },
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    postBlog(true);
  }

  // image filepath, user id, editor and editor entry, first paragraph, post title
  async function postBlog(publish: boolean = false) {
    setSaveStatus("Saving...");
    try {
      let imagePath: string | null = null;
      // check if user is null, throws error
      if (!user?.id) throw new Error("Unable to find user id or id is invalid");
      // check for editor, throws error
      if (!tipTapEditor) throw new Error("Editor failed to load");
      // attempt to upload image and get url, throws error
      if (file && publish) {
        const fileExt = file.name.split(".").pop();
        imagePath = `${user.id}-${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("images")
          .upload(imagePath, file);
        if (uploadError) {
          throw uploadError;
        }
        console.log(uploadError);
      }
      // attempt to insert or upsert post to DB, throws error
      if (id) {
        await updatePost(imagePath);
      } else {
        await initialPost(imagePath);
      }

      setSaveStatus("Draft saved.");

      if (publish) {
        router.refresh();
        router.push("/blog");
      }
    } catch (error: any) {
      setPostCreationError(error);
      setSubmitting(false);
      setSaveStatus(null);
    }
  }

  async function initialPost(imagePath: string | null) {
    const entry = tipTapEditor?.getJSON();
    const firstParagraph = tipTapEditor?.getText() || "";
    const { data, error: postInsertError } = await supabase
      .from("posts")
      .insert({
        entry,
        author: user?.id,
        title: postTitleRef.current,
        first_paragraph:
          firstParagraph?.length > 300
            ? firstParagraph?.substring(0, 300) + "..."
            : firstParagraph,
        image: imagePath, // will get this after uploading image
        published: false,
      })
      .select();

    if (postInsertError) {
      console.log("Error inserting post: ", postInsertError);
      throw postInsertError;
    }

    setId(data[0].id);
    console.log("Initial post data: ", data);
  }

  async function updatePost(
    imagePath: string | null,
    publish: boolean = false
  ) {
    const entry = tipTapEditor?.getJSON() ?? {};
    const firstParagraph = tipTapEditor?.getText() ?? "";
    const { error: postInsertError } = await supabase.from("posts").upsert({
      id,
      entry,
      author: user?.id,
      title: postTitleRef.current,
      first_paragraph:
        firstParagraph.length > 300
          ? firstParagraph.substring(0, 300) + "..."
          : firstParagraph,
      image: imagePath, // will get this after uploading image
      published: publish,
    });

    if (postInsertError) {
      throw postInsertError;
    }
  }

  function eraseBlog() {
    tipTapEditor?.commands.clearContent();
    debounce();
  }

  function onTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPostTitle(e.target.value);
    postTitleRef.current = e.target.value;
    debounce();
  }

  return (
    <div className={styles.container}>
      <div>
        <Nav />
      </div>
      <form className={styles.main} onSubmit={handleSubmit}>
        <div className={styles.topContainer}>
          <div>
            <Input labelFor="title" labelText="Title" required>
              <input
                id="title"
                type="text"
                className={styles.titleInput}
                onChange={onTitleChange}
                value={postTitle || ""}
                required
              />
            </Input>
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
        <div className={styles.buttons}>
          <button type="submit" disabled={submitting}>
            Publish
          </button>
          <button
            className={styles.clearButton}
            onClick={eraseBlog}
            disabled={submitting}
          >
            Clear
          </button>
        </div>
        {postCreationError && (
          <p style={{ color: "red" }}>{postCreationError.message}</p>
        )}
        {saveStatus && (
          <p style={{ color: saveStatus === "Saving..." ? "orange" : "green" }}>
            {saveStatus}
          </p>
        )}
      </form>
    </div>
  );
}

export default CreatePost;
