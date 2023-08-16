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
    const getPosts = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(`*, author ( name )`)
        .eq("id", id);
      if (data && editor) {
        setPosts(data);
        editor!.commands.setContent(data[0].entry);
      }
    };

    getPosts();
  }, [supabase, setPosts, editor]);

  if (post) {
    const {
      id: postId,
      entry,
      author: { name },
      title: postTitle,
      created_at,
      image,
    } = post[0];
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
      <div className={styles.container}>
        <Head>
          <title>{postTitle}</title>
          <meta property="og:title" content={postTitle} />
          <meta
            property="og:image"
            content={
              image || "https://www.underdogdevs.org/images/fallback.png"
            }
          />
          <meta
            property="og:description"
            content="UnderdogDevs is a group of software engineers supporting formerly incarcerated and disadvantaged aspiring developers"
          />
          <meta
            property="og:url"
            content={`http://www.underdogdevs.org${postLink}`}
          />
          <meta property="og:type" content="article" />
          <meta property="og:site_name" content="UnderdogDevs" />
          <meta property="article:published_time" content={created_at} />
          <meta property="article:author" content={name} />
          <meta property="article:section" content="Technology" />
          <meta property="article:tag" content="Technology" />
          <meta property="article:tag" content="Software Engineering" />
          <meta property="article:tag" content="Software Development" />
          <meta property="article:tag" content="Software" />
          <meta property="article:tag" content="Programming" />
          <meta property="article:tag" content="Programming Languages" />
          <meta property="article:tag" content="Web Development" />
          <meta property="article:tag" content="Web Developer" />
        </Head>
        <header className={styles.header}>
          <Link passHref href="/blog">
            Back
          </Link>

          <h3>{postTitle}</h3>

          <ul className={styles.socialContainer}>
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
        {image ? (
          <img
            className={styles.img}
            src={image}
            style={{ maxHeight: "600px", maxWidth: "600px" }}
            alt="Featured"
            loading="lazy"
          />
        ) : (
          <Image
            src="/images/fallback.png"
            height="230"
            width="320"
            priority={true}
            alt={""}
          />
        )}
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
