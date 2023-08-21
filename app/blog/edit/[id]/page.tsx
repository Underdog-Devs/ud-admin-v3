"use client";
import React, { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import { Image as tiptapImage } from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { useEditor } from "@tiptap/react";
import TipTapEdit from "@/components/blog/tiptapEditor/tiptap-edit";
import styles from "./edit.module.scss";
import Nav from "@/components/dashboard/nav";
import { Input } from "@/components/input";
import { redirect } from "next/navigation";
import { useParams } from "next/navigation";
import { PostImage } from "@/components/blog/PostImage";

function EditPost() {
  const { id } = useParams();
  const [firstParagraph, setFirstParagraph] = useState<string>("Loading...");
  const [postTitle, setPostTitle] = useState("Loading...");
  const [didFetch, setDidFetch] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileSizeWarning, setFileSizeWarning] = useState<string | null>("");
  const [updating, setUpdating] = useState<boolean>(false);

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
      setFirstParagraph(tipTapEditor?.getText() || "");
    },
  });

  useEffect(() => {
    getPost();
  }, []);

  useEffect(() => {
    tipTapEditor?.commands.setContent(firstParagraph);
  }, [didFetch]);

  // author, title, image, entry, first_paragraph, created_at
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
      setFirstParagraph(data.entry.content[0].content[0].text);
      setImageUrl(data.image || null);
      setDidFetch(true);
    } catch (error) {
      console.log(error);
    }
  }

  // TODO: use filesize to restrict options
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

  // async function handleImageUpload() {
  //   // TODO: update to only uploading on submit

  //   const datePrefix = Date.now();
  //   const fileName = `media/${datePrefix}-${file!.name}`;
  //   // Get signed key for file name in current directory.
  //   const response = await fetch(`/api/presignedurl?fileName=${fileName}`);

  //   const data = await response.json();
  //   const url = data.signedUrlObject.url;
  //   fetch(url, {
  //     method: "PUT",
  //     body: file,
  //   })
  //     .then((response) => {
  //       if (!response.ok) {
  //         return `Error uploading ${fileName}.`;
  //       }
  //     })
  //     .catch((err) => {
  //       return `Error uploading ${fileName}.`;
  //     });
  //   return `${process.env.NEXT_PUBLIC_S3_URL}${fileName}`;
  // }

  async function postBlog() {
    let image = "";
    if (file) {
      image = await handleImageUpload();
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase.from("posts").upsert({
      id,
      entry: tipTapEditor?.getJSON(),
      author: user?.id,
      title: postTitle,
      first_paragraph: firstParagraph,
      image: imageUrl,
    });
    if (!error) {
      redirect("/blog");
    }
    setUpdating(false);
  }

  function eraseBlog() {
    tipTapEditor?.commands.clearContent();
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
          <button type="submit" disabled={updating}>
            Publish
          </button>
          <button
            className={styles.clearButton}
            onClick={eraseBlog}
            disabled={updating}
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditPost;
