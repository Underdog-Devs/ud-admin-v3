import "./styles/index.scss";
import NavBar from "../components/navbar";
import { RootContextProvider } from "./context/RootContext";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { LoggedOutNav } from "@/components/navbar/LoggedOutNav";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body>
        <main className="min-h-screen bg-background flex flex-col items-center">
          <RootContextProvider>
            {user ? <NavBar user={user} /> : <LoggedOutNav />}
            {children}
          </RootContextProvider>
        </main>
      </body>
    </html>
  );
}
