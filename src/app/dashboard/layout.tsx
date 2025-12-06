import { Flame } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
       <header className="flex h-16 items-center gap-4 border-b bg-background/95 px-6 sticky top-0 z-40">
          <Flame className="h-7 w-7 text-primary" />
      </header>
      <div className="p-4 md:p-8">{children}</div>
    </div>
  );
}
