import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "LaVo",
    short_name: "LaVo",
    description: "Agende seu lava-jato online",
    start_url: "/",
    scope: "/",
    lang: "pt-BR",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0F172A",
    theme_color: "#06B6D4",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
