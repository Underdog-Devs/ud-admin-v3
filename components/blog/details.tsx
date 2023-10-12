"use client";
import React, { useState } from "react";
import Link from "next/link";
import styles from "./details.module.scss";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { set } from "zod";

interface Props {
  id: string;
  date: string;
  setPostDeleted: React.Dispatch<React.SetStateAction<boolean>>;
  author?: string;
  published: boolean;
}

function Details(props: Props) {
  const { id, date, author, setPostDeleted, published } = props;
  const [deleteMessage, setDeleteMessage] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const router = useRouter();

  const deletePost = async () => {
    const supabase = createClientComponentClient();

    try {
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (error) {
        throw error;
      }
      setPostDeleted(true);
    } catch (error) {
      console.error(error);
    }
  };

  function handleRefresh() {
    router.refresh();
  }

  const toggleDeleteMessage = () => {
    setDeleteMessage(!deleteMessage);
  };

  const fullDate = new Date(date);
  const month = fullDate.getUTCMonth() + 1;
  const day = fullDate.getUTCDate();
  const year = fullDate.getUTCFullYear();
  const parsedDate = `${month}/${day}/${year}`;
  return deleteSuccess ? (
    <div style={{ color: "red", fontSize: 14 }}>Post Deleted</div>
  ) : (
    <div className={styles.container}>
      <ul>
        {deleteMessage ? (
          <div className={styles.deleteContainer}>
            <li>Are you sure?</li>
            <div>
              <li onClick={deletePost}>Yes</li>
              <li onClick={toggleDeleteMessage}>No</li>
            </div>
          </div>
        ) : (
          <li className={styles.deleteButton} onClick={toggleDeleteMessage}>
            Delete
          </li>
        )}
        <li className={styles.editButton}>
          <Link href={`/blog/edit/${id}`}>Edit</Link>
        </li>
        {author && (
          <li>
            <span>
              Written by <span>{author}</span>
            </span>
          </li>
        )}
        <li>
          <span>
            Posted on <span>{parsedDate}</span>
          </span>
        </li>
        <li>
          <span style={{ color: published ? "green" : "orange" }}>
            {published ? "Published" : "Draft"}
          </span>
        </li>
      </ul>
    </div>
  );
}

export default Details;
