"use client";

import Image from "next/image";
import { useState } from "react";
import { WELLNESS_LOGO_PATH } from "@/lib/wellness-theme";

type Props = {
  className?: string;
};

/**
 * Flourish mark — circular white backing so transparent PNG edges never pick up the header tint.
 */
export function WellnessBrandLogo({ className }: Props) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={
        className ??
        "relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-1.5 text-xs font-bold shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
      }
    >
      {!failed ? (
        <Image
          src={WELLNESS_LOGO_PATH}
          alt="Flourish"
          width={44}
          height={44}
          className="h-full w-full object-contain"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="text-[0.65rem] font-bold leading-none text-[var(--wellness-ink)]" aria-hidden>
          F
        </span>
      )}
    </div>
  );
}
