import { WellnessBrandLogo } from "@/components/wellness-brand-logo";

type Props = {
  showProfileSlot?: boolean;
  profileSlot?: React.ReactNode;
};

/** Laptop staff shell header — same logo and title treatment as the kiosk. */
export function StaffShellHeader({
  showProfileSlot = false,
  profileSlot,
}: Props) {
  return (
    <header className="flex shrink-0 items-center justify-between border-b border-[var(--staff-ink)]/10 bg-[var(--wellness-surface)]/85 px-6 py-4 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <WellnessBrandLogo />
        <span className="text-lg font-bold tracking-tight text-[var(--staff-ink)]">
          Wellness Check-In
        </span>
      </div>
      {showProfileSlot ? (
        profileSlot ?? (
          <button
            type="button"
            className="h-10 w-10 shrink-0 rounded-full bg-[var(--staff-accent)] opacity-90 shadow-md transition hover:opacity-100"
            aria-label="Menu (not wired yet)"
          />
        )
      ) : (
        <div className="h-10 w-10 shrink-0" aria-hidden />
      )}
    </header>
  );
}
