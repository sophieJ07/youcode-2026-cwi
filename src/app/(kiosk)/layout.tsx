import type { CSSProperties } from "react";

/** iPad portrait–style viewport: width × max height typical of 11" class tablets. */
const IPAD_FRAME_MAX_W = 820;
const IPAD_FRAME_MAX_H = 1180;

export default function KioskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-[#3d3535] p-3 sm:p-5">
      <div
        className="kiosk-shell flex w-full flex-col overflow-hidden rounded-[1.75rem] border border-black/20 shadow-[0_28px_64px_-12px_rgba(0,0,0,0.55)] ring-1 ring-white/10 sm:rounded-[2rem]"
        style={
          {
            "--kiosk-bg": "var(--wellness-bg)",
            "--kiosk-ink": "var(--wellness-ink)",
            "--kiosk-button": "var(--wellness-accent)",
            "--kiosk-button-2": "var(--wellness-accent-2)",
            maxWidth: `${IPAD_FRAME_MAX_W}px`,
            height: `min(calc(100dvh - 1.5rem), ${IPAD_FRAME_MAX_H}px)`,
          } as CSSProperties
        }
      >
        {children}
      </div>
    </div>
  );
}
