import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";

/* ----------------------------- palette + type ---------------------------- */
const C = {
  bg: "#0b1220",
  panel: "#131c2e",
  border: "#1e293b",
  indigo: "#6366f1",
  indigoSoft: "#818cf8",
  cyan: "#06b6d4",
  cyanSoft: "#22d3ee",
  emerald: "#10b981",
  amber: "#fbbf24",
  ink: "#e2e8f0",
  muted: "#94a3b8",
  faint: "#64748b",
};
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const SANS =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const EASE = Easing.bezier(0.16, 1, 0.3, 1);

const clampInterp = (
  f: number,
  range: [number, number],
  out: [number, number],
  easing?: (n: number) => number,
) =>
  interpolate(f, range, out, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

/* -------------------------------- building blocks ------------------------- */
const Background: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundColor: C.bg,
      backgroundImage:
        "radial-gradient(620px 440px at 28% 22%, rgba(99,102,241,0.20), transparent 70%)," +
        "radial-gradient(620px 460px at 76% 82%, rgba(6,182,212,0.16), transparent 72%)",
    }}
  />
);

const LogoMark: React.FC<{ progress: number; size: number }> = ({
  progress,
  size,
}) => {
  const arc = clampInterp(progress, [0, 0.6], [0, 1]);
  const check = clampInterp(progress, [0.5, 1], [0, 1]);
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <defs>
        <linearGradient
          id="lk-mark"
          x1="6"
          y1="6"
          x2="42"
          y2="42"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor={C.indigo} />
          <stop offset="1" stopColor={C.cyan} />
        </linearGradient>
      </defs>
      <path
        d="M30.34 10.41 A 15 15 0 1 1 17.66 10.41"
        fill="none"
        stroke="url(#lk-mark)"
        strokeWidth={4}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - arc}
      />
      <path
        d="M16.5 24.5 L21.5 29.5 L31 18"
        fill="none"
        stroke={C.emerald}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - check}
      />
    </svg>
  );
};

const Wordmark: React.FC<{ size: number }> = ({ size }) => (
  <div
    style={{
      fontFamily: MONO,
      fontWeight: 700,
      fontSize: size,
      letterSpacing: -size * 0.03,
      lineHeight: 1,
    }}
  >
    <span style={{ color: C.ink }}>loop</span>
    <span style={{ color: C.cyanSoft }}>smith</span>
  </div>
);

/* --------------------------------- scene 1 -------------------------------- */
const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const op = clampInterp(frame, [0, 12], [0, 1]) * clampInterp(frame, [88, 100], [1, 0]);
  const markProgress = clampInterp(frame, [6, 48], [0, 1], EASE);
  const wOp = clampInterp(frame, [40, 56], [0, 1]);
  const wY = clampInterp(frame, [40, 56], [18, 0], EASE);
  const tOp = clampInterp(frame, [56, 72], [0, 1]);
  const tY = clampInterp(frame, [56, 72], [16, 0], EASE);
  return (
    <AbsoluteFill
      style={{
        opacity: op,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 30,
      }}
    >
      <LogoMark progress={markProgress} size={210} />
      <div style={{ opacity: wOp, transform: `translateY(${wY}px)` }}>
        <Wordmark size={96} />
      </div>
      <div
        style={{
          opacity: tOp,
          transform: `translateY(${tY}px)`,
          fontFamily: SANS,
          fontSize: 36,
          fontWeight: 600,
          color: C.muted,
          letterSpacing: -0.5,
        }}
      >
        stop prompting. <span style={{ color: C.ink }}>start looping.</span>
      </div>
    </AbsoluteFill>
  );
};

/* --------------------------------- scene 2 -------------------------------- */
const TermLine: React.FC<{
  frame: number;
  at: number;
  color: string;
  children: React.ReactNode;
}> = ({ frame, at, color, children }) => {
  const op = clampInterp(frame, [at, at + 12], [0, 1]);
  const x = clampInterp(frame, [at, at + 12], [-12, 0], EASE);
  return (
    <div
      style={{
        opacity: op,
        transform: `translateX(${x}px)`,
        color,
        marginTop: 10,
      }}
    >
      {children}
    </div>
  );
};

const Terminal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 16, mass: 0.7 } });
  const scale = interpolate(enter, [0, 1], [0.92, 1]);
  const op = clampInterp(frame, [0, 12], [0, 1]) * clampInterp(frame, [94, 104], [1, 0]);

  const cmd = "npx loopsmith";
  const typed = cmd.slice(0, Math.floor(clampInterp(frame, [14, 40], [0, cmd.length])));
  const cursorOn = frame < 42 ? Math.floor(frame / 8) % 2 === 0 : false;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          opacity: op,
          transform: `scale(${scale})`,
          width: 860,
          background: "#0a101e",
          border: `1px solid ${C.border}`,
          borderRadius: 18,
          boxShadow: "0 40px 80px -40px rgba(2,6,23,0.9)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            padding: "16px 20px",
            borderBottom: `1px solid ${C.border}`,
            background: "rgba(15,23,42,0.5)",
          }}
        >
          <Dot c="#ef4444" />
          <Dot c="#eab308" />
          <Dot c="#22c55e" />
          <span
            style={{
              marginLeft: 8,
              fontFamily: MONO,
              fontSize: 18,
              color: C.faint,
            }}
          >
            terminal
          </span>
        </div>
        <div
          style={{
            padding: "30px 32px 36px",
            fontFamily: MONO,
            fontSize: 30,
            lineHeight: 1.5,
          }}
        >
          <div>
            <span style={{ color: C.cyanSoft }}>$</span>{" "}
            <span style={{ color: C.ink }}>{typed}</span>
            <span style={{ color: C.ink, opacity: cursorOn ? 1 : 0 }}>▋</span>
          </div>
          <TermLine frame={frame} at={46} color={C.emerald}>
            <span style={{ color: C.faint }}>added</span>{"  "}verify-loop
          </TermLine>
          <TermLine frame={frame} at={56} color={C.emerald}>
            <span style={{ color: C.faint }}>added</span>{"  "}grade
          </TermLine>
          <TermLine frame={frame} at={66} color={C.emerald}>
            <span style={{ color: C.faint }}>added</span>{"  "}loop-cost
          </TermLine>
          <TermLine frame={frame} at={82} color={C.emerald}>
            ✓ 3 skills ready{" "}
            <span style={{ color: C.faint }}>in ~/.claude/skills</span>
          </TermLine>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Dot: React.FC<{ c: string }> = ({ c }) => (
  <span
    style={{ width: 13, height: 13, borderRadius: "50%", background: c }}
  />
);

/* --------------------------------- scene 3 -------------------------------- */
const NodeBox: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  accent: string;
  tag: string;
  title: string;
  delay: number;
  frame: number;
  fps: number;
}> = ({ x, y, w, h, accent, tag, title, delay, frame, fps }) => {
  const p = spring({ frame: frame - delay, fps, config: { damping: 15 } });
  const op = clampInterp(frame, [delay, delay + 10], [0, 1]);
  const ty = interpolate(p, [0, 1], [18, 0]);
  return (
    <g opacity={op} transform={`translate(0 ${ty})`}>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={20}
        fill={C.panel}
        stroke={accent}
        strokeWidth={2}
      />
      <text
        x={x + 26}
        y={y + 46}
        fontFamily={MONO}
        fontSize={21}
        fontWeight={700}
        fill={accent}
      >
        {tag}
      </text>
      <text
        x={x + 26}
        y={y + 92}
        fontFamily={SANS}
        fontSize={32}
        fontWeight={600}
        fill={C.ink}
      >
        {title}
      </text>
    </g>
  );
};

const Arrow: React.FC<{
  d: string;
  color: string;
  marker: string;
  at: number;
  frame: number;
  flow?: boolean;
}> = ({ d, color, marker, at, frame, flow }) => {
  const op = clampInterp(frame, [at, at + 10], [0, 1]);
  const dashProps = flow
    ? {
        strokeDasharray: "11 9",
        strokeDashoffset: -((frame * 0.7) % 20),
      }
    : {};
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={3}
      opacity={op}
      markerEnd={`url(#${marker})`}
      {...dashProps}
    />
  );
};

const LoopScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const op = clampInterp(frame, [0, 12], [0, 1]) * clampInterp(frame, [170, 180], [1, 0]);

  // verdict flips FAIL (amber) -> PASS (emerald) around frame 122
  const failOp = clampInterp(frame, [78, 88], [0, 1]) * clampInterp(frame, [116, 124], [1, 0]);
  const passOp = clampInterp(frame, [122, 132], [0, 1]);
  const passPulse =
    1 + 0.06 * Math.sin(clampInterp(frame, [122, 150], [0, Math.PI]));

  return (
    <AbsoluteFill style={{ opacity: op }}>
      <div
        style={{
          position: "absolute",
          top: 70,
          width: "100%",
          textAlign: "center",
          fontFamily: MONO,
          fontSize: 24,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: C.faint,
        }}
      >
        make → check → retry
      </div>
      <svg width={1080} height={1080} viewBox="0 0 1080 1080">
        <defs>
          <marker
            id="m-fwd"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M0 0 L10 5 L0 10 z" fill={C.faint} />
          </marker>
          <marker
            id="m-amber"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M0 0 L10 5 L0 10 z" fill={C.amber} />
          </marker>
        </defs>

        {/* arrows */}
        <Arrow d="M486 388 L592 388" color={C.faint} marker="m-fwd" at={26} frame={frame} />
        <Arrow
          d="M748 452 C 772 552, 742 612, 694 656"
          color={C.faint}
          marker="m-fwd"
          at={50}
          frame={frame}
        />
        <Arrow
          d="M388 706 C 150 700, 150 478, 322 452"
          color={C.amber}
          marker="m-amber"
          at={86}
          frame={frame}
          flow
        />

        {/* retry label on the fail arc */}
        <g opacity={clampInterp(frame, [92, 102], [0, 1])}>
          <rect x={86} y={556} width={150} height={44} rx={12} fill={C.amber} fillOpacity={0.1} stroke={C.amber} strokeOpacity={0.5} />
          <text x={161} y={584} textAnchor="middle" fontFamily={MONO} fontSize={22} fontWeight={700} fill={C.amber}>FAIL: retry</text>
        </g>

        {/* nodes */}
        <NodeBox x={186} y={324} w={300} h={128} accent={C.indigoSoft} tag="01 · maker" title="Write the change" delay={8} frame={frame} fps={fps} />
        <NodeBox x={594} y={324} w={300} h={128} accent={C.cyanSoft} tag="02 · checker" title="Run + review" delay={34} frame={frame} fps={fps} />
        <NodeBox x={390} y={648} w={300} h={128} accent={C.amber} tag="03 · verdict" title="Pass or fail?" delay={60} frame={frame} fps={fps} />

        {/* verdict badges */}
        <g opacity={failOp}>
          <rect x={444} y={804} width={192} height={56} rx={14} fill={C.amber} fillOpacity={0.1} stroke={C.amber} strokeOpacity={0.55} />
          <text x={540} y={841} textAnchor="middle" fontFamily={MONO} fontSize={26} fontWeight={700} fill={C.amber}>FAIL</text>
        </g>
        <g opacity={passOp} transform={`translate(540 832) scale(${passPulse}) translate(-540 -832)`}>
          <rect x={420} y={804} width={240} height={56} rx={14} fill={C.emerald} fillOpacity={0.12} stroke={C.emerald} strokeOpacity={0.6} />
          <path d="M461 832 l12 12 l20 -24" fill="none" stroke={C.emerald} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
          <text x={556} y={841} textAnchor="middle" fontFamily={MONO} fontSize={26} fontWeight={700} fill={C.emerald}>PASS</text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/* --------------------------------- scene 4 -------------------------------- */
const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 18, mass: 0.8 } });
  const scale = interpolate(enter, [0, 1], [0.94, 1]);
  const op = clampInterp(frame, [0, 12], [0, 1]);
  return (
    <AbsoluteFill
      style={{
        opacity: op,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 28,
        transform: `scale(${scale})`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <LogoMark progress={1} size={92} />
        <Wordmark size={68} />
      </div>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 40,
          color: C.ink,
          background: "#0a101e",
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          padding: "16px 30px",
        }}
      >
        <span style={{ color: C.cyanSoft }}>$</span> npx loopsmith
      </div>
      <div style={{ fontFamily: MONO, fontSize: 24, color: C.faint }}>
        github.com/FahreddinHepdonduran/loopsmith
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------- composition ------------------------------ */
export const LaunchLoop: React.FC = () => {
  return (
    <AbsoluteFill>
      <Background />
      <Sequence durationInFrames={100}>
        <Intro />
      </Sequence>
      <Sequence from={100} durationInFrames={104}>
        <Terminal />
      </Sequence>
      <Sequence from={204} durationInFrames={180}>
        <LoopScene />
      </Sequence>
      <Sequence from={384} durationInFrames={66}>
        <Outro />
      </Sequence>
    </AbsoluteFill>
  );
};
