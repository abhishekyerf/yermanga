"use client";
import Link from "next/link";
// On touch devices, request fullscreen during the tap that opens a chapter (browsers require a user gesture).
export default function ChapterLink(props: React.ComponentProps<typeof Link>) {
  return <Link {...props} onClick={() => { try { if (matchMedia("(pointer: coarse), (max-width: 640px)").matches && !document.fullscreenElement && localStorage.getItem("ym-mode") !== "scroll") document.documentElement.requestFullscreen?.().catch(() => {}); } catch {} }} />;
}
