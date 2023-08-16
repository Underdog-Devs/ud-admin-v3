"use client";
import React, { useEffect, useState } from "react";
import type { Post } from "@/app/types/blog";
import InfiniteScroll from "react-infinite-scroller";
import styles from "./posts.module.scss";
import { default as PostComponent } from "./post";

interface PostsProps {
  userId: string;
  initialPosts: Post[];
}

export const BlogPosts = ({ initialPosts, userId }: PostsProps) => {
  const [screenWidth, setScreenWidth] = useState<number>(0);
  const fetching = React.useRef(false);
  const [pages, setPages] = React.useState(initialPosts);
  const posts = pages.flatMap((page) => page);
  const [pageNumber, setPageNumber] = React.useState(6);
  const [hasMore, setHasMore] = React.useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleResize = () => {
        setScreenWidth(window.innerWidth);
      };

      window.addEventListener("resize", handleResize);

      // Initial screen width
      setScreenWidth(window.innerWidth);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, []);

  const loadMore = async () => {
    if (!fetching.current) {
      try {
        fetching.current = true;
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_HOSTNAME}/api/posts?page=${pageNumber}&id=${userId}`
        );
        const data = await response.json();

        setPageNumber(pages.length + data.posts.length);
        setPages((prev) => [...prev, ...data.posts]);
        if (data.posts.length === 0) {
          setHasMore(false);
        }
      } finally {
        fetching.current = false;
      }
    }
  };

  return (
    <InfiniteScroll
      hasMore={hasMore}
      pageStart={0}
      loadMore={loadMore}
      loader={
        <span key={0} className="loader">
          Loading ...
        </span>
      }
      element="div"
      className={styles.items}
    >
      {posts.map((post) => (
        <PostComponent post={post} key={post.id} />
      ))}
    </InfiniteScroll>
  );
};
