"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Midhun's illustrated avatar at native size (200×200) so it stays sharp.
 * A quiet float and a slight pointer tilt; green and orange light stay in the
 * frame, not on a 3D scene, so the About mouse behaviour is unchanged.
 */
export function AvatarPortrait({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      className={cn("relative mx-auto w-[200px]", className)}
      onPointerMove={(event) => {
        const el = ref.current;
        if (!el) return;
        const box = el.getBoundingClientRect();
        const x = (event.clientX - box.left) / box.width - 0.5;
        const y = (event.clientY - box.top) / box.height - 0.5;
        el.style.setProperty("--tilt-x", `${(-y * 8).toFixed(2)}deg`);
        el.style.setProperty("--tilt-y", `${(x * 10).toFixed(2)}deg`);
      }}
      onPointerLeave={(event) => {
        const el = event.currentTarget;
        el.style.setProperty("--tilt-x", "0deg");
        el.style.setProperty("--tilt-y", "0deg");
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-8 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(80,160,90,0.28),transparent_55%),radial-gradient(circle_at_80%_70%,rgba(255,122,69,0.22),transparent_50%)]"
      />
      <div
        className="avatar-float relative overflow-hidden rounded-full shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
        style={{
          width: 200,
          height: 200,
          transform:
            "rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg))",
          transformStyle: "preserve-3d",
          transition: "transform 0.5s cubic-bezier(0.77, 0, 0.18, 1)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/avatar.png"
          alt="Illustrated portrait of Midhun Krishnan"
          width={200}
          height={200}
          decoding="async"
          className="h-[200px] w-[200px] object-cover"
        />
      </div>
    </div>
  );
}
