import Link from "next/link";

type BrandLockupProps = {
  size?: "sm" | "lg";
  showTagline?: boolean;
  href?: string;
  className?: string;
};

export function BrandLockup({
  size = "sm",
  showTagline = false,
  href = "/app",
  className = "",
}: BrandLockupProps) {
  const content = (
    <span className={`inline-flex flex-col ${size === "lg" ? "gap-0.5" : "gap-0"}`}>
      <span
        className={`font-bold leading-none tracking-tight text-foreground ${
          size === "lg" ? "text-2xl sm:text-3xl" : "text-base"
        }`}
      >
        Album NFC
      </span>
      {showTagline && (
        <span className="text-xs text-muted-foreground">Tus viajes, en una pegatina.</span>
      )}
    </span>
  );

  return href ? (
    <Link href={href} className={`inline-flex items-center ${className}`}>
      {content}
    </Link>
  ) : (
    <span className={`inline-flex items-center ${className}`}>{content}</span>
  );
}
