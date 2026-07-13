import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SuccessLoop",
    short_name: "SuccessLoop",
    description: "나의 진정한 목표를 매일 달성한다.",
    start_url: "/today",
    scope: "/",
    display: "standalone",
    background_color: "#f6f4fb",
    theme_color: "#8b5cf6",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
