import { cn } from "@/lib/utils";

interface ImotionLogoProps {
  variant?: "full" | "wordmark" | "icon";
  showTagline?: boolean;
  className?: string;
  /** Force colors: "auto" inherits, "light" for dark backgrounds, "dark" for light backgrounds */
  tone?: "auto" | "light" | "dark";
}

/**
 * IMOTION wordmark — flame-coral arrow on the "i" + bold wordmark.
 * Inspired by Stripe / Resend / Ramp typographic signatures.
 */
export const ImotionLogo = ({
  variant = "full",
  showTagline = false,
  className,
  tone = "dark",
}: ImotionLogoProps) => {
  const wordColor =
    tone === "light"
      ? "hsl(var(--ink-50))"
      : tone === "dark"
      ? "hsl(var(--ink-900))"
      : "currentColor";
  const taglineColor =
    tone === "light" ? "hsl(var(--ink-300))" : "hsl(var(--ink-500))";

  // Coral→amber arrow used on the "i"
  const Arrow = (
    <svg
      viewBox="0 0 24 64"
      className="h-full w-auto"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="imotion-flame" x1="0" y1="64" x2="0" y2="0">
          <stop offset="0%" stopColor="hsl(var(--coral-600))" />
          <stop offset="60%" stopColor="hsl(var(--coral-500))" />
          <stop offset="100%" stopColor="hsl(var(--amber-400))" />
        </linearGradient>
      </defs>
      {/* shaft */}
      <rect x="9" y="18" width="6" height="40" rx="2" fill="url(#imotion-flame)" />
      {/* arrow head */}
      <path d="M12 4 L22 18 L14 18 L14 22 L10 22 L10 18 L2 18 Z" fill="url(#imotion-flame)" />
    </svg>
  );

  if (variant === "icon") {
    return (
      <span className={cn("inline-flex h-8 w-3", className)} aria-label="IMOTION">
        {Arrow}
      </span>
    );
  }

  return (
    <span
      className={cn("inline-flex items-center gap-2 leading-none", className)}
      aria-label="IMOTION Creator Studio"
    >
      <span className="inline-flex h-[1.4em] items-end">
        {Arrow}
      </span>
      <span
        className="font-bold tracking-tight"
        style={{
          fontFamily: "'General Sans', Inter, system-ui, sans-serif",
          color: wordColor,
          fontSize: "1em",
          letterSpacing: "-0.04em",
        }}
      >
        motion
      </span>
      {showTagline && variant === "full" && (
        <span
          className="ml-2 hidden border-l pl-2 text-[0.45em] font-semibold uppercase tracking-[0.2em] sm:inline-block"
          style={{ color: taglineColor, borderColor: "hsl(var(--ink-200))" }}
        >
          Creator
          <br />
          Studio
        </span>
      )}
    </span>
  );
};

export default ImotionLogo;
