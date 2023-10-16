"use client";
import React, { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";
import styles from "./PostImage.module.scss";

export function PostImage({ url, size }: { url: string | null; size: number }) {
  const supabase = createClientComponentClient();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
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
        // if in dev mode, log error
        if (process.env.NODE_ENV === "development") {
          console.log("Error downloading image: ", error);
        }
      }
    }

    if (url) {
      downloadImage(url);
    } else {
      setImageUrl(null);
    }
  }, [url, supabase]);

  // async function uploadImage(event: React.ChangeEvent<HTMLInputElement>) {
  //   try {
  //     setUploading(true);

  //     if (!event.target.files || event.target.files.length === 0) {
  //       throw new Error("You must select an image to upload.");
  //     }

  //     const file = event.target.files[0];
  //     const fileExt = file.name.split(".").pop();
  //     const filePath = `${uid}-${Math.random()}.${fileExt}`;

  //     let { error: uploadError } = await supabase.storage
  //       .from("images")
  //       .upload(filePath, file);

  //     if (uploadError) {
  //       throw uploadError;
  //     }

  //     onUpload(filePath);
  //   } catch (error) {
  //     alert("Error uploading image!");
  //   } finally {
  //     setUploading(false);
  //   }
  // }

  return (
    <div className={styles.container}>
      <Image
        width={size}
        height={size}
        src={imageUrl ?? "/images/fallback.png"}
        alt="Post Image"
        className={`${styles.post} ${styles.image}`}
        style={{ height: size, width: size, objectFit: "contain" }}
      />
    </div>
  );
}
