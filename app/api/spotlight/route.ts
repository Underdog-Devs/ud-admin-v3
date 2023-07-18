import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import { cookies } from 'next/headers'

export async function GET(request: Request) {
      const { searchParams } = new URL(request.url);
      const supabase = createRouteHandlerClient({ cookies })
      const from = Number(searchParams.get("page"));

      const { data: spotlight } = await supabase
            .from('spotlight')
            .select(`
                  *
            `)
            .range(from, from + 6)
      return NextResponse.json({
            spotlight
      });
}
