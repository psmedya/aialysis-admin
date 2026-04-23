import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import type { ReactNode } from "react";

export default async function PanelLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // admin check (proxy da kontrol ediyor ama savunma katmani)
  const { data: adminRow } = await supabase
    .from("admin_emails")
    .select("email")
    .eq("email", user.email)
    .maybeSingle();
  if (!adminRow) redirect("/denied");

  return (
    <SidebarProvider>
      <AppSidebar userEmail={user.email ?? undefined} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background/60 backdrop-blur px-4 sticky top-0 z-20">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-sm font-medium text-muted-foreground">
            AIALYSIS Yonetim Paneli
          </h1>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
