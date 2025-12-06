
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <div className="p-4 md:p-8">{children}</div>
    </div>
  );
}
