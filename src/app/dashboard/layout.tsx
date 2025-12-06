import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Home, Package, Users, HandCoins, Fingerprint, Settings, LogOut, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';

// NOTE: This layout component is a work in progress.
// In a real app, this would be a client component to handle state,
// active links, etc. For this UI-only build, it's a server component.

const navItems = [
    { href: "/dashboard", icon: Home, label: "Dashboard" },
    { href: "/dashboard#my-campaigns", icon: Package, label: "My Campaigns" },
    { href: "/dashboard#my-contributions", icon: HandCoins, label: "My Contributions" },
    { href: "/dashboard#identity", icon: Fingerprint, label: "Identity (FDC)" },
    { href: "/dashboard#smart-account", icon: Users, label: "Smart Account" },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userAvatar = PlaceHolderImages.find(img => img.id === 'user-avatar-1');

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Flame className="h-7 w-7 text-primary" />
            <span className="font-headline text-xl font-bold tracking-tight">Flarestarter</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map(item => (
                <SidebarMenuItem key={item.label}>
                    <Link href={item.href} className='w-full'>
                        <SidebarMenuButton tooltip={item.label}>
                            <item.icon />
                            <span>{item.label}</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Settings">
                <Settings />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <Link href="/" className='w-full'>
                    <SidebarMenuButton tooltip="Logout">
                        <LogOut />
                        <span>Logout</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-background/95 px-6">
            <SidebarTrigger className='md:hidden' />
            <h1 className="text-lg font-semibold md:text-xl font-headline">Dashboard</h1>
        </header>
        <div className="p-4 md:p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
