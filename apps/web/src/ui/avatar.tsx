import Image from "next/image";

export interface AvatarProps {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return Array.from(name.trim()).slice(0, 2).join("");
}

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  const pixelSize = size === "sm" ? 24 : size === "lg" ? 40 : 32;
  return (
    <span
      className={["ui-avatar", className].filter(Boolean).join(" ")}
      data-size={size}
      role="img"
      aria-label={name}
    >
      {src ? (
        <Image src={src} alt="" width={pixelSize} height={pixelSize} unoptimized />
      ) : (
        <span aria-hidden="true">{initials(name)}</span>
      )}
    </span>
  );
}
