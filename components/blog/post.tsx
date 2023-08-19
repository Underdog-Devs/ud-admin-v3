"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import Details from "./details";
import styles from "./post.module.scss";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

function Post({ post }: { post: any }) {
  const { id, title, image, first_paragraph, created_at } = post;
  const supabase = createClientComponentClient();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (image) downloadImage(image);
  }, [image, supabase]);

  async function downloadImage(path: string) {
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
      console.log("Error fetching image in post.tsx!");
    }
  }

  function truncateString(postTitle: string) {
    if (postTitle.length > 70) {
      postTitle = `${postTitle.slice(0, 70)}...`;
    }
    return postTitle;
  }

  return (
    <div className={styles.container}>
      <div className={styles["image-container"]}>
        {imageUrl ? (
          <Image
            fill
            className={styles.img}
            src={imageUrl}
            alt="Post featured image"
            loading="lazy"
            style={{ objectFit: "contain" }}
          />
        ) : (
          <Image
            src="/images/fallback.png"
            fill
            style={{ objectFit: "contain" }}
            alt={"Post image missing"}
          />
        )}
      </div>
      <div>
        <h3>
          <Link
            href={`/blog/${title
              .replace(/\s+/g, "-")
              .replace(/[^a-zA-Z0-9\s-]/g, "")}/${id}`}
          >
            {truncateString(title)}
          </Link>
        </h3>
        {first_paragraph}
        <Details id={id} date={created_at} />
      </div>
    </div>
  );
}

export default Post;
