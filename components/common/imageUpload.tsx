import React, { useEffect, useState } from "react";
import { Input } from "@/components/input";
import styles from "./create.module.scss";

interface ImageUploadProps {
  onImageUpload: (urls: string[]) => void;
}

export default function ImageUpload({ onImageUpload }: ImageUploadProps) {
  const [files, setFiles] = useState<FileList | null>();

  async function handleFiles(
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) {
    const files = (e.target as HTMLInputElement).files;
    setFiles(files);
  }
  useEffect(() => {
    handleImageUpload();
  }, [files]);
  async function handleImageUpload() {
    if (!files || files.length === 0) {
      return;
    }

    const fileUploadPromises = Array.from(files)
      .filter((file) => file instanceof File)
      .map(async (file) => {
        const datePrefix = Date.now();
        const fileName = `media/${datePrefix}-${file.name}`;

        // Get signed key for file name in current directory.
        const response = await fetch(`/api/presignedurl?fileName=${fileName}`);
        const data = await response.json();
        const url = data.signedUrlObject.url;

        const uploadResponse = await fetch(url, {
          method: "PUT",
          body: file,
        });

        if (!uploadResponse.ok) {
          throw new Error(`Error uploading ${fileName}.`);
        }
        return `${process.env.NEXT_PUBLIC_S3_URL}${fileName}`;
      });
    try {
      const urls = await Promise.all(fileUploadPromises);
      onImageUpload(urls);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.topInput}>
        <Input labelFor="name" labelText="Name">
          <input id="name" name="name" type="text" />
        </Input>
        <Input labelFor="featured-image" labelText="Featured Image">
          <input
            onChange={handleFiles}
            id="featured-image"
            type="file"
            accept="image/*"
          />
        </Input>
      </div>
    </div>
  );
}
