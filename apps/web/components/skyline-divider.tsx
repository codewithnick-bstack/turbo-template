import { DrawIn } from "@/components/draw-in";

/**
 * A city elevation drawn as one continuous line, stroke by stroke, as the
 * section scrolls in.
 *
 * This is the site's one piece of owned artwork — everything else is
 * photography and type, both of which any competitor can buy. It is drawn as
 * an elevation rather than a picture: a datum line, a run of towers, a bridge
 * span, and the water beneath, in the order they would be surveyed.
 *
 * Sized by the parent. The viewBox is wide and short so it stretches into a
 * band without the strokes distorting.
 */

/** The datum the whole drawing sits on — drawn first, like a site line. */
const GROUND = "M0 78h1200";

/** Towers, left to right. Kept as separate paths so they draw in sequence. */
const SKYLINE = [
  "M40 78V44h34v34",
  "M74 60h26v18",
  "M116 78V30h28v48",
  "M144 46h22v32",
  "M186 78V52h30v26",
  "M232 78V22h24v56M232 22l12-10 12 10",
  "M272 78V40h32v38",
  "M320 78V58h24v20",
];

/** A cable-stayed span: deck, towers, and the stays either side. */
const BRIDGE = [
  "M380 62h300",
  "M470 62V18M590 62V18",
  "M470 22 400 62M470 22l68 40M590 22l-68 40M590 22l70 40",
  "M400 62v16M660 62v16",
];

/** Towers again on the far side, so the band reads as one continuous city. */
const SKYLINE_RIGHT = [
  "M700 78V50h26v28",
  "M742 78V34h30v44",
  "M772 48h20v30",
  "M812 78V26h26v52M812 26l13-11 13 11",
  "M856 78V56h28v22",
  "M900 78V38h30v40",
  "M948 78V60h22v18",
  "M990 78V44h32v34",
  "M1040 78V54h26v24",
  "M1084 78V32h30v46",
  "M1132 78V62h28v16",
];

/** Water: broken horizontals suggesting reflection, drawn last. */
const WATER = ["M60 88h180", "M300 88h240", "M600 88h150", "M800 88h220", "M1060 88h100"];

export function SkylineDivider({ className = "" }: { className?: string }) {
  // One flat list so the draw order is explicit and each path gets a stagger
  // index: ground, then city, then bridge, then the far side, then water.
  const paths = [GROUND, ...SKYLINE, ...BRIDGE, ...SKYLINE_RIGHT, ...WATER];

  return (
    <svg
      viewBox="0 0 1200 96"
      className={className}
      preserveAspectRatio="xMidYMax meet"
      aria-hidden="true"
      focusable="false"
    >
      {paths.map((d, index) => (
        <DrawIn
          key={`${index}-${d}`}
          d={d}
          index={index}
          strokeWidth={1.5}
          duration={0.7}
          // 30-odd paths, so the stagger has to be tight: at the default this
          // band would still be drawing several seconds after it arrived.
          stagger={0.035}
        />
      ))}
    </svg>
  );
}
