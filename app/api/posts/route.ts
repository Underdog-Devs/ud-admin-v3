import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const supabase = createRouteHandlerClient({ cookies });
  const from = Number(searchParams.get("page"));
  //   const {
  //     data: { user },
  //   } = await supabase.auth.getUser();

  console.log("Search Params: ", searchParams);
  console.log("User ID is: ", searchParams.get("id"));

  const userId = searchParams.get("id");

  const { data: posts } = await supabase
    .from("posts")
    .select(
      `
                  *,
                  authors ( name )
            `
    )
    .eq("author", userId)
    .range(from, from + 6);
  return NextResponse.json({
    posts,
  });
}
