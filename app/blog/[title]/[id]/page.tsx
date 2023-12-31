"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BsTwitter, BsFacebook } from "react-icons/bs";
import styles from "./post.module.scss";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useParams } from "next/navigation";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import { Image as TipTapImage } from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";

const PostPage = () => {
  const { id } = useParams();
  const supabase = createClientComponentClient();
  const [post, setPosts] = useState<any>();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const twitterText = (postTitle: string, link: string) => {
    return `${postTitle} \n
		http://www.underdogdevs.org${link}
		`;
  };

  const editor = useEditor({
    editable: false,
    content: "",
    extensions: [
      StarterKit,
      Highlight,
      Typography,
      TipTapImage,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
  });

  useEffect(() => {
    getPosts();
  }, [supabase, editor]);

  // useEffect(() => {
  //   if (post?.image) getImage(post.image);
  // }, [supabase, post]);

  async function getPosts() {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(`*, author ( name )`)
        .eq("id", id)
        .single();

      if (error) {
        throw error;
      }

      console.log(data.entry);
      if (data && editor) {
        setPosts(data);
        getImage(data.image);
        editor.commands.setContent(data.entry);
      }
    } catch (error) {
      // if in dev mode, log error
      if (process.env.NODE_ENV === "development") {
        console.log("Error fetching post in /blog/[title]\n", "Error: ", error);
      }
    }
  }

  async function getImage(path: string) {
    try {
      const { data, error } = await supabase.storage
        .from("images")
        .download(path);

      if (error) {
        throw error;
      }

      const url = URL.createObjectURL(data);
      setImageUrl(url);
    } catch (error) {
      console.log("Problem fetching image in /blog/[title]");
    }
  }

  if (post) {
    const {
      id: postId,
      entry,
      author: { name },
      title: postTitle,
      created_at,
      image,
    } = post;
    const displayDate = created_at.substring(0, 10);
    const postLink = `/blog/${postTitle
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9\s-]/g, "")}/${postId}`;

    return (
      <div
        className={styles.container}
        style={{
          display: "flex",
          flexDirection: "column",
          maxWidth: 1200,
          margin: "auto",
          gap: "1rem",
        }}
      >
        <header style={{ display: "flex", gap: "2rem" }}>
          <Link passHref href="/blog" className={styles.backButton}>
            Back
          </Link>

          <h3>{postTitle}</h3>

          <ul className={styles.socialContainer}>
            <p>Share</p>
            <li>
              <a
                target="_blank"
                href={`https://twitter.com/intent/tweet?text=${twitterText(
                  postTitle,
                  postLink
                )}`}
              >
                <BsTwitter style={{ color: "#1D9BF0", cursor: "pointer" }} />
              </a>
            </li>
            <li>
              <a
                target="_blank"
                href={`https://www.facebook.com/sharer/sharer.php?u=http://www.underdogdevs.org${postLink}`}
              >
                <BsFacebook style={{ color: "#1B74E4", cursor: "pointer" }} />
              </a>
            </li>
          </ul>
        </header>
        <div className={styles.blogImageContainer}>
          <Image
            fill
            src={imageUrl ?? "/images/fallback.png"}
            alt={imageUrl ? "Post image" : "Post image not found"}
            style={{ objectFit: "contain" }}
            loading="lazy"
          />
        </div>

        <EditorContent className={styles.blogText} editor={editor} />

        <div className={styles.blogMain}>
          <section className={styles.blogInfo}>
            <div className={styles.blogAuthor}>
              <p className={styles.blogAuthorName}>Written by {name}</p>
            </div>
            <p>PUBLISHED ON {displayDate}</p>
          </section>
        </div>
      </div>
    );
  }
};

export default PostPage;
