"use client";
import React, { useEffect, useRef, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import StarterKit from "@tiptap/starter-kit";
import { useRouter } from "next/navigation";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import { Image as tiptapImage } from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { EditorContent, useEditor } from "@tiptap/react";
import TipTapEdit from "@/components/blog/tiptapEditor/tiptap-edit";
import styles from "./edit.module.scss";
import Nav from "@/components/dashboard/nav";
import { Input } from "@/components/input";
import { redirect } from "next/navigation";
import { useParams } from "next/navigation";
import { PostBlogSchema } from "@/lib/schema";

function EditPost() {
  const { id } = useParams();
  const [firstParagraph, setFirstParagraph] = useState<string>("Loading...");
  const [postTitle, setPostTitle] = useState("Loading...");
  const [didFetch, setDidFetch] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<any>(null);
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
      setFirstParagraph(tipTapEditor?.getText() || "");
    },
  });

  useEffect(() => {
    getPost();
  }, []);

  useEffect(() => {
    tipTapEditor?.commands.setContent(firstParagraph);
  }, [didFetch]);

  async function getPost() {
    const { data } = await supabase.from("posts").select("*").eq("id", id);
    if (data) {
      setPostTitle(data[0].title);
      setFirstParagraph(data[0].entry.content[0].content[0].text);
      setDidFetch(true);
    }
  }


  async function postBlog() {
    const result = PostBlogSchema.safeParse({
      title: postTitle, entry: tipTapEditor?.getJSON()?.content?.[0]?.content?.[0]?.text
    })

    if (result.success === false) {
      return { error: result.error.format() }
    }

    let image = "";

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase.from("posts").upsert({
      id,
      entry: tipTapEditor?.getJSON(),
      author: user?.id,
      title: postTitle,
      first_paragraph: firstParagraph,
      image,
    });

    router.refresh();
    if (!error) {
      redirect("/blog");
    }
  }

  function eraseBlog() {
    tipTapEditor?.commands.clearContent();
  }

  function onTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPostTitle(e.target.value);
  }


  async function action() {
    const result = await postBlog()
    if (result?.error) {
      setValidationError(result?.error)
    } else {
      if (formRef.current) {
        formRef.current.reset()
        setValidationError(null)
      }
    }
  }


  return (
    <div className={styles.container}>
      <div>
        <Nav />
      </div>
      <form className={styles.main} action={action}>
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
            {validationError?.title && (
              <div className={styles.inputWarning}>
                {
                  validationError?.title &&
                  validationError.title._errors.map((error: string, index: number) => (
                    <p key={index} className={styles.inputWarning}>
                      {error}
                    </p>
                  ))
                }
              </div>
            )}
            <Input labelFor="featured-image" labelText="Featured Image">
              <input
                id="featured-image"
                type="file"
                accept="image/*"
              />
            </Input>
          </div>
        </div>

        <TipTapEdit editor={tipTapEditor} />

        <EditorContent editor={tipTapEditor} content={"Test"} />
        {validationError?.entry && (
          <div className={styles.inputWarning}>
            {
              validationError?.entry &&
              validationError.entry._errors.map((error: string, index: number) => (
                <p key={index} className={styles.inputWarning}>
                  {error}
                </p>
              ))
            }
          </div>
        )}

        <div className={styles.buttons}>
          <button type="submit">Publish</button>
          <button className={styles.clearButton} onClick={eraseBlog}>
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditPost;
