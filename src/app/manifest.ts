import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "naokikaneko.com",
    short_name: "NAOKI KANEKO",
    description: "Naoki Kaneko | Portfolio Website",
    start_url: "/",
    display: "browser",
    lang: "ja",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
