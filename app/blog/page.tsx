import { BlogPosts } from "@/components/blog/posts";
import type { Post } from "@/app/types/blog";
import styles from "./index.module.scss";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Nav from "@/components/dashboard/nav";

async function fetchPosts(id: string): Promise<Post[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_HOSTNAME}/api/posts?id=${id}`,
    { cache: "no-cache" }
  );
  const data = await response.json();
  return data.posts;
}


export default async function PostsPage() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const posts = await fetchPosts(user.id);

  return (
    <div className={styles.container}>
      <div>
        <Nav />
      </div>
      <div className={styles.main}>
        <BlogPosts initialPosts={posts} userId={user.id} />
      </div>
    </div>
  );
}
