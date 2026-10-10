import { hallThemes } from "@/data/eras";

// A code-native fallback when the matching img/hall{1..4}.jpg is unavailable.
export function HallBackdrop({ stage = 1 }: { stage?: number }) {
  const theme =
    hallThemes[Math.min(Math.max(stage - 1, 0), hallThemes.length - 1)];
  return (
    <svg className="hall-backdrop" viewBox="0 0 896 1200" aria-hidden="true">
      <defs>
        <linearGradient id="hall-wall" x2="0.9" y2="1">
          <stop stopColor={theme.wall[0]} />
          <stop offset="1" stopColor={theme.wall[1]} />
        </linearGradient>
        <linearGradient id="hall-floor" x2="0.3" y2="1">
          <stop stopColor={theme.floor[0]} />
          <stop offset="1" stopColor={theme.floor[1]} />
        </linearGradient>
        <linearGradient id="hall-door" x2="1" y2="0">
          <stop stopColor={theme.door[0]} />
          <stop offset=".5" stopColor={theme.door[1]} />
          <stop offset="1" stopColor={theme.door[2]} />
        </linearGradient>
        <radialGradient id="hall-light">
          <stop stopColor="#fff4d7" stopOpacity=".3" />
          <stop offset="1" stopColor="#fff4d7" stopOpacity="0" />
        </radialGradient>
        <filter id="hall-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency=".48"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope=".1" />
          </feComponentTransfer>
          <feBlend in="SourceGraphic" mode="multiply" />
        </filter>
        <g id="wooden-door">
          <path
            d="M0 0 L180 0 L180 350 L0 350Z"
            fill="#403529"
            stroke="#30281f"
            strokeWidth="4"
          />
          <path
            d="M9 10 L171 10 L171 340 L9 340Z"
            fill="url(#hall-door)"
            stroke="#30281f"
            strokeWidth="3"
          />
          <path
            d="M22 24H158V327H22Z"
            fill="none"
            stroke="#c1a177"
            strokeWidth="4"
          />
          <g fill="none" stroke="#362b21" strokeWidth="2" opacity=".72">
            <path d="M55 24V327M88 24V327M120 24V327M152 24V327" />
            <path d="M30 46q12 30 0 55t0 65M65 130q13 17 0 42t0 49M98 44q-9 28 0 61t0 54M134 210q-8 25 0 66" />
            <path d="M23 95H156M23 264H156" strokeWidth="7" />
          </g>
          <g fill="#a78d66" stroke="#30281f" strokeWidth="2">
            <circle cx="32" cy="95" r="3" />
            <circle cx="148" cy="95" r="3" />
            <circle cx="32" cy="264" r="3" />
            <circle cx="148" cy="264" r="3" />
            <path d="M136 178h23v6h-23z" />
            <circle cx="140" cy="181" r="5" />
          </g>
          <path d="M0 350H180" stroke="#d0b88d" strokeWidth="6" />
        </g>
      </defs>
      <g filter="url(#hall-grain)">
        <path d="M0 0H896V1200H0Z" fill="url(#hall-wall)" />
        <path
          d="M0 0L300 210H596L896 0Z"
          fill={theme.ceiling}
          stroke="#3f352a"
          strokeWidth="4"
        />
        <path d="M300 210V750M596 210V750" stroke="#5b4c37" strokeWidth="4" />
        <path
          d="M0 150L300 272M896 150L596 272"
          stroke="#b7a689"
          strokeWidth="12"
        />
        <path
          d="M0 176L300 292M896 176L596 292"
          stroke="#453c2d"
          strokeWidth="3"
        />
        <path d="M300 210H596V750H300Z" fill={theme.rear} opacity=".45" />
        <path
          d="M0 850L300 750H596L896 850V1200H0Z"
          fill="url(#hall-floor)"
          stroke="#3f3428"
          strokeWidth="3"
        />
        <g stroke="#473928" strokeWidth="2.5" opacity=".7">
          <path d="M300 750L-500 1200M350 750L-180 1200M400 750L150 1200M448 750V1200M495 750L750 1200M545 750L1070 1200M596 750L1400 1200" />
          <path d="M0 874H896M0 977H896M0 1110H896" />
        </g>
        <path
          d="M0 844L300 742H596L896 844"
          fill="none"
          stroke="#9f8b69"
          strokeWidth="17"
        />
        <path
          d="M0 857L300 755H596L896 857"
          fill="none"
          stroke="#3d3427"
          strokeWidth="3"
        />
        <use
          href="#wooden-door"
          transform="translate(70 456) scale(1.055 1.16)"
        />
        <use
          href="#wooden-door"
          transform="translate(287 396) scale(.75 .96)"
        />
        <use
          href="#wooden-door"
          transform="translate(475 396) scale(.75 .96)"
        />
        <use
          href="#wooden-door"
          transform="translate(637 456) scale(1.055 1.16)"
        />
        <g stroke="#46382a" strokeWidth="3" fill="none">
          <path d="M190 0L340 210M705 0L556 210M0 75L896 75" />
          <path d="M325 245H570M328 720H566" opacity=".35" />
        </g>
        <ellipse cx="448" cy="510" rx="490" ry="520" fill="url(#hall-light)" />
      </g>
    </svg>
  );
}
