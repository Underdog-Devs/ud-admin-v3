"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Head from "next/head";
import { EditorContent, useEditor } from "@tiptap/react";
import Image from "next/image";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import { Image as TipTapImage } from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { BsTwitter, BsFacebook } from "react-icons/bs";
import styles from "./post.module.scss";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useParams } from "next/navigation";

const PostPage = () => {
  const { id } = useParams();
  const supabase = createClientComponentClient();
  const [post, setPosts] = useState<any>();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const twitterText = (postTitle: string, postId: string) => {
    return `${postTitle} \n
		http://www.underdogdevs.org/blog/${postId}
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

      if (data && editor) {
        setPosts(data);
        getImage(data.image);
        editor!.commands.setContent(data.entry);
      }
    } catch (error) {
      console.log("Error fetching post in /blog/[title]");
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

    if (!editor) {
      return null;
    }

    //	return (
    //		<div><EditorContent className={styles.blogText} editor={editor} /></div>
    //	)
    //}

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          maxWidth: 1200,
          margin: "auto",
          gap: "1rem",
        }}
      >
        <header style={{ display: "flex", gap: "2rem" }}>
          <Link passHref href="/blog">
            Back
          </Link>

          <h3>{postTitle}</h3>

          <ul style={{ display: "flex", gap: "1rem" }}>
            <p>Share</p>
            <li>
              <a
                href={`https://twitter.com/intent/tweet?text=${twitterText(
                  postTitle,
                  postId
                )}`}
              >
                <BsTwitter style={{ color: "#1D9BF0", cursor: "pointer" }} />
              </a>
            </li>
            <li>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=http://www.underdogdevs.org/blog/${postId}`}
              >
                <BsFacebook style={{ color: "#1B74E4", cursor: "pointer" }} />
              </a>
            </li>
          </ul>
        </header>

        <Image
          width={600}
          height={600}
          className={styles.img}
          src={imageUrl ?? "/images/fallback.png"}
          alt={imageUrl ? "Post image" : "Post image not found"}
          style={{ objectFit: "contain" }}
          loading="lazy"
        />

        <p>{post.first_paragraph}</p>

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
