import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/data/site";
import { ogSize, palette } from "@/lib/seo/constants";

/**
 * WOFF copies of public/fonts/instrument-serif-latin-400*.woff2.
 * next/og parses WOFF and TTF; it rejects WOFF2.
 */
const FONT_DIR = join(process.cwd(), "src/lib/seo/fonts");

type OgFonts = NonNullable<
  NonNullable<ConstructorParameters<typeof ImageResponse>[1]>["fonts"]
>;

let fontsPromise: Promise<OgFonts> | undefined;

function loadFonts(): Promise<OgFonts> {
  fontsPromise ??= (async () => {
    const [regular, italic] = await Promise.all([
      readFile(join(FONT_DIR, "instrument-serif-latin-400.woff")),
      readFile(join(FONT_DIR, "instrument-serif-latin-400-italic.woff")),
    ]);
    return [
      {
        name: "Instrument Serif",
        data: regular,
        weight: 400,
        style: "normal",
      },
      {
        name: "Instrument Serif",
        data: italic,
        weight: 400,
        style: "italic",
      },
    ];
  })();
  return fontsPromise;
}

export interface OgCardContent {
  kicker: string;
  title: string;
  subtitle: string;
}

/** Dark paper card used by every opengraph-image route. */
export async function createOgImage({
  kicker,
  title,
  subtitle,
}: OgCardContent): Promise<ImageResponse> {
  const fonts = await loadFonts();
  const titleSize = title.length > 32 ? 58 : title.length > 20 ? 72 : 88;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: palette.ink,
        color: palette.paper,
        fontFamily: "Instrument Serif",
        padding: "68px 76px",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 56,
          right: 88,
          width: 250,
          height: 330,
          background: palette.paper,
          opacity: 0.08,
          transform: "rotate(8deg)",
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 92,
          right: 140,
          width: 250,
          height: 330,
          background: palette.paper,
          opacity: 0.16,
          transform: "rotate(-4deg)",
          display: "flex",
        }}
      />
      <div
        style={{
          display: "flex",
          fontSize: 22,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: palette.ember,
        }}
      >
        {kicker}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          maxWidth: 860,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: titleSize,
            lineHeight: 0.95,
            letterSpacing: "-0.03em",
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 22,
            fontSize: 34,
            lineHeight: 1.25,
            fontStyle: "italic",
            color: palette.paperDim,
          }}
        >
          {subtitle}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: `1px solid rgba(237, 232, 223, 0.22)`,
          paddingTop: 22,
          fontSize: 22,
          color: palette.paperFaint,
        }}
      >
        <div style={{ display: "flex" }}>{site.name}</div>
        <div style={{ display: "flex", fontStyle: "italic" }}>{site.title}</div>
      </div>
    </div>,
    {
      ...ogSize,
      fonts,
    },
  );
}

/** Square mark for icon.tsx and apple-icon.tsx. Uses the default OG font. */
export function createIcon(size: number): ImageResponse {
  const fontSize = Math.round(size * 0.38);
  const bar = Math.max(2, Math.round(size * 0.06));
  const gap = Math.max(3, Math.round(size * 0.07));
  const barWidth = Math.round(fontSize * 1.45);
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: palette.ink,
        color: palette.paper,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize,
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}
        >
          MK
        </div>
        <div
          style={{
            display: "flex",
            marginTop: gap,
            width: barWidth,
            height: bar,
            background: palette.ember,
          }}
        />
      </div>
    </div>,
    { width: size, height: size },
  );
}
