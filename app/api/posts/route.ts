import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const supabase = createRouteHandlerClient({ cookies });
  const from = Number(searchParams.get("page"));

  const userId = searchParams.get("id");

  const { data: posts } = await supabase
    .from("posts")
    .select(`*,authors ( name )`)
    .eq("author", userId)
    .order("created_at", { ascending: false })
    .range(from, from + 6);
  return NextResponse.json({
    posts,
  });
}
