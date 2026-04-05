"use client";

import Image from "next/image";
import { useState } from "react";
import { WELLNESS_LOGO_PATH } from "@/lib/wellness-theme";

type Props = {
  className?: string;
};

/**
 * Same logo treatment as the kiosk: CWI image in a round white frame, or “CWI” fallback.
 */
export function WellnessBrandLogo({ className }: Props) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={
        className ??
        "relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-xs font-bold ring-2 ring-[var(--wellness-ink)]/10"
      }
    >
      {!failed ? (
        <Image
          src={WELLNESS_LOGO_PATH}
          alt="CWI"
          width={44}
          height={44}
          className="object-cover"
          unoptimized
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="text-[var(--wellness-ink)]" aria-hidden>
          CWI
        </span>
      )}
    </div>
  );
}
