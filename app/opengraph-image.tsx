import { ImageResponse } from "next/og";
import { site } from "@/lib/data";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${site.name} · the registry`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#fafaf8",
          color: "#1c1c1a",
          padding: 64,
          fontFamily: "monospace",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 8,
              background: "#cb3837",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            s
          </div>
          <div style={{ fontSize: 28, color: "#6e6d66" }}>
            {`registry.${site.name}.is-a.dev`}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "flex",
              fontSize: 110,
              fontWeight: 800,
              letterSpacing: -4,
            }}
          >
            {site.name}
            <span style={{ color: "#cb3837" }}>▌</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 30 }}>
            <span style={{ fontWeight: 700 }}>{`v${site.version}`}</span>
            <span
              style={{
                width: 14,
                height: 14,
                borderRadius: 999,
                background: "#2e7d4f",
              }}
            />
            <span style={{ color: "#6e6d66" }}>
              {`${site.status} · ${site.location.toLowerCase()}`}
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "2px solid #e5e4dd",
            paddingTop: 32,
            fontSize: 28,
          }}
        >
          <div style={{ display: "flex" }}>
            <span style={{ color: "#cb3837", fontWeight: 700 }}>$&nbsp;</span>
            <span>{`pacman -S ${site.name}`}</span>
          </div>
          <div style={{ color: "#6e6d66" }}>ships real products</div>
        </div>
      </div>
    ),
    size
  );
}
