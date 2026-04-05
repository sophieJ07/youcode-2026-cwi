import type { CSSProperties } from "react";

export default function StaffSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="staff-laptop-shell flex min-h-dvh flex-col bg-[var(--wellness-bg)] font-sans antialiased"
      style={
        {
          "--staff-bg": "var(--wellness-bg)",
          "--staff-ink": "var(--wellness-ink)",
          "--staff-accent": "var(--wellness-accent)",
          "--staff-input-bg": "var(--wellness-input-fill)",
          "--staff-card": "var(--wellness-surface)",
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}
