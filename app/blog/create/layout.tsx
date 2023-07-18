
import {
  createServerComponentClient,
} from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from "next/navigation";


export default async function BlogLayout({
children,
}: {
children: React.ReactNode;
}) {  
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }
  return (
    <div>
      {children}
    </div>
  );
}
