import { ImageResponse } from "next/og";

export const ENTRY_OG_SIZE = { width: 1200, height: 630 };
export const ENTRY_OG_CONTENT_TYPE = "image/png";

const PRINTABLE_ASCII = /^[\x20-\x7e]+$/;

export function pickOgHeadline(title: string, label: string): string {
  return PRINTABLE_ASCII.test(title) ? title : label;
}

export function renderEntryOgImage(title: string, label: string) {
  const headline = pickOgHeadline(title, label);
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        background: "#ffffff",
        color: "#000000",
        padding: 80,
      }}
    >
      <div style={{ fontSize: 28, letterSpacing: "0.1em", color: "#555555" }}>
        {label.toUpperCase()}
      </div>
      <div style={{ fontSize: 84, fontWeight: 700, textAlign: "center", letterSpacing: "-0.02em" }}>
        {headline}
      </div>
      <div style={{ fontSize: 32, color: "#555555" }}>NAOKI KANEKO</div>
    </div>,
    { ...ENTRY_OG_SIZE },
  );
}
