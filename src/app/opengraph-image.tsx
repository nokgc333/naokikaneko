import { ImageResponse } from "next/og";

export const alt = "naokikaneko.com";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          color: "#000000",
          fontSize: 72,
          fontWeight: 700,
          letterSpacing: "-0.02em",
        }}
      >
        NAOKI KANEKO
      </div>
    ),
    { ...size }
  );
}
