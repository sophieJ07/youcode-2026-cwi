export default function KioskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full bg-amber-50 text-slate-900 selection:bg-amber-200">
      {children}
    </div>
  );
}
