"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Settings2,
  Users,
  MessageSquare,
  Trophy,
  CalendarClock,
  Clock,
  Zap,
  BookOpen,
  BarChart3,
  Cog,
  Sparkles,
  LogOut,
  Moon,
  Sun,
  Database,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";

type NavItem = { href: string; label: string; icon: React.ElementType };

const mainNav: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/veri-kapsam", label: "Veri Kapsam", icon: Database },
  { href: "/config", label: "Remote Config", icon: Settings2 },
  { href: "/users", label: "Kullanicilar", icon: Users },
  { href: "/matches", label: "Maclar", icon: CalendarClock },
  { href: "/predictions", label: "Tahminler", icon: Trophy },
];

const opsNav: NavItem[] = [
  { href: "/crons", label: "Cron Monitor", icon: Clock },
  { href: "/functions", label: "Edge Functions", icon: Zap },
];

const contentNav: NavItem[] = [
  { href: "/forum", label: "Forum", icon: MessageSquare },
  { href: "/blog", label: "Blog", icon: BookOpen },
];

const insightNav: NavItem[] = [
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Ayarlar", icon: Cog },
];

export function AppSidebar({ userEmail }: { userEmail?: string }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const renderGroup = (label: string, items: NavItem[]) => (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={isActive(item.href)}>
                  <Link href={item.href}>
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate font-semibold">AIALYSIS</span>
            <span className="truncate text-xs text-muted-foreground">
              Admin Panel
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {renderGroup("Genel", mainNav)}
        {renderGroup("Operasyon", opsNav)}
        {renderGroup("Icerik", contentNav)}
        {renderGroup("Analiz", insightNav)}
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center justify-between gap-2 px-2 py-1 group-data-[collapsible=icon]:hidden">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-muted-foreground">Oturum</p>
            <p className="truncate text-sm font-medium">
              {userEmail ?? "admin"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() =>
              setTheme(theme === "dark" ? "light" : "dark")
            }
            title="Tema"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleSignOut}
            title="Cikis"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
