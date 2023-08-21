"use client";
import React, { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";
import styles from "./PostImage.module.scss";

export function PostImage({
  uid,
  url,
  size,
  onUpload,
}: {
  uid: string;
  url: string | null;
  size: number;
  onUpload: (url: string) => void;
}) {
  const supabase = createClientComponentClient();
  const [imageUrl, setImageUrl] = useState<string | null>(url);
  const [uploading, setUploading] = useState(false);

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
        console.log("Error downloading image: ", error);
      }
    }

    if (url) downloadImage(url);
  }, [url, supabase]);

  async function uploadImage(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${uid}-${Math.random()}.${fileExt}`;

      let { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      onUpload(filePath);
    } catch (error) {
      alert("Error uploading image!");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={styles.container}>
      {imageUrl ? (
        <Image
          width={size}
          height={size}
          src={imageUrl}
          alt="Post Image"
          className={`${styles.post} ${styles.image}`}
          style={{ height: size, width: size }}
        />
      ) : (
        <div
          className={`${styles.post} ${styles["no-image"]}`}
          style={{ height: size, width: size }}
        />
      )}
      <div style={{ width: size }}>
        <label
          className={`${styles.button} ${styles.primary} ${styles.block}`}
          htmlFor="single"
        >
          {uploading ? "Uploading ..." : "Upload"}
        </label>
        <input
          style={{
            visibility: "hidden",
            position: "absolute",
          }}
          type="file"
          id="single"
          accept="image/*"
          onChange={uploadImage}
          disabled={uploading}
        />
      </div>
    </div>
  );
}
