"use client";
import React, { useEffect, useState } from "react";
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
import styles from "./create.module.scss";
import Nav from "@/components/dashboard/nav";
import { Input } from "@/components/input";
import { redirect } from "next/navigation";

function CreatePost() {
  const [entry, setEntry] = useState<JSONContent | null>(null);
  const [firstParagraph, setFirstParagraph] = useState<string | null>(null);
  const [postTitle, setPostTitle] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileSizeWarning, setFileSizeWarning] = useState<string | null>(null);
  const [postCreationError, setPostCreationError] = useState<Error | null>(
    null
  );
  const [submitting, setSubmitting] = useState<boolean>(false);

  const supabase = createClientComponentClient();

  useEffect(() => {
    getUser();
  }, [supabase]);

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
        setEntry(tipTapEditor.getJSON());
        setFirstParagraph(tipTapEditor.getText());
      }
    },
  });

  // image filepath, user id, editor and editor entry, first paragraph, post title
  async function postBlog() {
    try {
      let imagePath: string | null = null;
      // check if user is null, throws error
      if (!user?.id) throw new Error("Unable to find user id or id is invalid");
      // check for editor, throws error
      if (!tipTapEditor) throw new Error("Editor failed to load");
      // attempt to upload image and get url, throws error
      if (file) {
        const fileExt = file.name.split(".").pop();
        imagePath = `${user.id}-${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("images")
          .upload(imagePath, file);

        if (uploadError) {
          throw uploadError;
        }
      }
      // attempt to add post to DB, throws error
      const { error: postInsertError } = await supabase.from("posts").insert({
        entry,
        author: user?.id,
        title: postTitle,
        first_paragraph: firstParagraph,
        image: imagePath, // will get this after uploading image
      });

      if (postInsertError) {
        throw postInsertError;
      }
      redirect("/blog");
    } catch (error: any) {
      setPostCreationError(error);
      setSubmitting(false);
    }
  }

  function eraseBlog() {
    tipTapEditor?.commands.clearContent();
    setEntry(null);
    setFirstParagraph(null);
  }

  function onTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPostTitle(e.target.value);
  }

  return (
    <div className={styles.container}>
      <div>
        <Nav />
      </div>
      <form className={styles.main} action={postBlog}>
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
        {(!firstParagraph || firstParagraph.length < 120) && (
          <p style={{ color: "red" }}>
            Post must contain at least 120 characters.
          </p>
        )}
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
      </form>
    </div>
  );
}

export default CreatePost;
