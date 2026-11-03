import { keyframes, styled } from '@mui/system'
import { useMemo } from 'react'
import type { CSSProperties } from 'react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { createConfetti, createSeededRandom } from './confetti'
import type { DiscTone } from './discAppearance'

// Timeline (ms after the final disc lands):
//   0     winning discs pop one by one (BoardGrid)
//   260   golden line is drawn through them (WinningLine)
//   450   backdrop dims the board
//   600   seal slams down -> ~900 impact: flash, shockwave, sparks, board shake
//   950   confetti starts falling, caption rises
//   2750  caption and backdrop fade out
//   2900  seal shrinks into the top-right corner and stays there

export type CelebrationOutcome = 'victory' | 'defeat'

export type Celebration = {
  outcome: CelebrationOutcome
  tone: DiscTone
  /** Short result line under the caption, e.g. "赤の勝ち". */
  label: string
  /** Varies the confetti between games. */
  seed: number
}

type CustomCssProperties = CSSProperties & {
  [key: `--${string}`]: string | number | undefined
}

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`

const fadeOut = keyframes`
  from { opacity: 1; }
  to   { opacity: 0; }
`

const sealSlam = keyframes`
  0%   { opacity: 0; transform: translate(-50%, -50%) scale(2.8) rotate(-22deg); }
  55%  { opacity: 1; transform: translate(-50%, -50%) scale(0.9) rotate(-7deg); }
  75%  { transform: translate(-50%, -50%) scale(1.05) rotate(-8deg); }
  100% { opacity: 1; transform: translate(-50%, -50%) scale(1) rotate(-8deg); }
`

const sealSettle = keyframes`
  from {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(1) rotate(-8deg);
  }
  to {
    top: calc(var(--seal-size) * 0.21 + 10px);
    left: calc(100% - var(--seal-size) * 0.21 - 10px);
    transform: translate(-50%, -50%) scale(0.42) rotate(-8deg);
  }
`

const flash = keyframes`
  0%   { opacity: 0; }
  20%  { opacity: 0.85; }
  100% { opacity: 0; }
`

const shockwave = keyframes`
  0%   { opacity: 0.9; transform: translate(-50%, -50%) scale(0.6); }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(3.4); }
`

const sunburst = keyframes`
  0%   { opacity: 0; transform: translate(-50%, -50%) rotate(0deg); }
  25%  { opacity: 1; }
  70%  { opacity: 0.8; }
  100% { opacity: 0; transform: translate(-50%, -50%) rotate(50deg); }
`

const sparkBurst = keyframes`
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0) scaleY(0.3);
  }
  15% { opacity: 1; }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) rotate(var(--angle))
      translateY(calc(var(--seal-size) * -1.5 * var(--reach))) scaleY(1);
  }
`

const confettiFall = keyframes`
  0% {
    opacity: 1;
    transform: translate3d(0, -8cqh, 0) rotate(0deg) rotateY(0deg);
  }
  50% {
    transform: translate3d(calc(var(--sway) * -0.6), 48cqh, 0)
      rotate(calc(var(--spin) * 0.5)) rotateY(360deg);
  }
  90% { opacity: 1; }
  100% {
    opacity: 0;
    transform: translate3d(var(--sway), 108cqh, 0) rotate(var(--spin))
      rotateY(720deg);
  }
`

const captionRise = keyframes`
  from { opacity: 0; transform: translate(-50%, 14px); letter-spacing: 0.6em; }
  to   { opacity: 1; transform: translate(-50%, 0); letter-spacing: 0.24em; }
`

const captionShimmer = keyframes`
  from { background-position: 200% center; }
  to   { background-position: -200% center; }
`

const Overlay = styled('div')({
  '--seal-size': 'clamp(104px, 34cqmin, 220px)',
  position: 'absolute',
  inset: 0,
  zIndex: 3,
  overflow: 'hidden',
  borderRadius: 'inherit',
  pointerEvents: 'none',
  containerType: 'size',
})

const Backdrop = styled('div')({
  position: 'absolute',
  inset: 0,
  background:
    'radial-gradient(circle at 50% 50%, rgba(255,200,90,0.2) 0%, rgba(5,8,18,0.74) 68%)',
  animation: `${fadeIn} 450ms ease-out 450ms both, ${fadeOut} 700ms ease-in 2750ms forwards`,
  '[data-outcome="defeat"] &': {
    background:
      'radial-gradient(circle at 50% 50%, rgba(120,135,180,0.16) 0%, rgba(4,6,14,0.8) 68%)',
  },
})

const Flash = styled('div')({
  position: 'absolute',
  inset: 0,
  background:
    'radial-gradient(circle at 50% 50%, rgba(255,250,230,0.95) 0%, rgba(255,210,120,0.4) 30%, transparent 65%)',
  animation: `${flash} 520ms ease-out 900ms both`,
  '[data-outcome="defeat"] &': {
    background:
      'radial-gradient(circle at 50% 50%, rgba(200,210,240,0.5) 0%, transparent 55%)',
  },
})

const Sunburst = styled('div')({
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: '170cqmax',
  height: '170cqmax',
  background:
    'repeating-conic-gradient(from 0deg, rgba(255,215,120,0.26) 0deg 5deg, transparent 5deg 15deg)',
  maskImage: 'radial-gradient(circle, black 8%, transparent 55%)',
  WebkitMaskImage: 'radial-gradient(circle, black 8%, transparent 55%)',
  animation: `${sunburst} 2200ms ease-out 850ms both`,
})

const Shockwave = styled('div')({
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: 'var(--seal-size)',
  height: 'var(--seal-size)',
  borderRadius: '50%',
  border: '3px solid rgba(255,220,140,0.9)',
  boxShadow: '0 0 24px rgba(255,200,90,0.7), inset 0 0 24px rgba(255,200,90,0.5)',
  animation: `${shockwave} 760ms cubic-bezier(0.1, 0.6, 0.3, 1) 900ms both`,
  '[data-outcome="defeat"] &': {
    borderColor: 'rgba(170,185,225,0.6)',
    boxShadow: '0 0 20px rgba(140,160,220,0.4)',
  },
})

const Spark = styled('span')({
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: '4px',
  height: 'calc(var(--seal-size) * 0.28)',
  borderRadius: '4px',
  background:
    'linear-gradient(to top, rgba(255,240,200,0), #ffe7a3 60%, #fffaf0)',
  boxShadow: '0 0 8px rgba(255,210,120,0.9)',
  animation: `${sparkBurst} 820ms cubic-bezier(0.1, 0.7, 0.3, 1) 900ms both`,
})

const Seal = styled('div')({
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: 'var(--seal-size)',
  height: 'var(--seal-size)',
  borderRadius: '18%',
  display: 'grid',
  placeItems: 'center',
  transform: 'translate(-50%, -50%) rotate(-8deg)',
  animation: `${sealSlam} 520ms cubic-bezier(0.5, 0, 0.3, 1) 600ms both, ${sealSettle} 700ms cubic-bezier(0.65, 0, 0.35, 1) 2900ms forwards`,
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: '7%',
    borderRadius: '12%',
    border: 'calc(var(--seal-size) * 0.025) solid currentColor',
    opacity: 0.8,
  },
})

const SealGlyph = styled('span')({
  fontFamily: "'Shippori Mincho B1', 'Noto Serif JP', serif",
  fontWeight: 800,
  fontSize: 'calc(var(--seal-size) * 0.6)',
  lineHeight: 1,
  position: 'relative',
})

const Caption = styled('div')({
  position: 'absolute',
  top: 'calc(50% + var(--seal-size) * 0.68)',
  left: '50%',
  display: 'grid',
  justifyItems: 'center',
  gap: '6px',
  whiteSpace: 'nowrap',
  textAlign: 'center',
  animation: `${captionRise} 500ms cubic-bezier(0.2, 0.8, 0.2, 1) 1050ms both, ${fadeOut} 350ms ease-in 2750ms forwards`,
})

const CaptionMain = styled('span')({
  fontFamily: "'Shippori Mincho B1', 'Noto Serif JP', serif",
  fontWeight: 800,
  fontSize: 'clamp(28px, 9cqmin, 64px)',
  lineHeight: 1.1,
  paddingLeft: '0.24em',
  color: 'transparent',
  backgroundImage:
    'linear-gradient(110deg, #c8963e 0%, #f5e6c8 30%, #fff8e6 45%, #e8c77b 60%, #c8963e 100%)',
  backgroundSize: '200% auto',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  filter: 'drop-shadow(0 2px 10px rgba(255,190,80,0.55))',
  animation: `${captionShimmer} 1800ms linear 1050ms infinite`,
  '[data-outcome="defeat"] &': {
    backgroundImage:
      'linear-gradient(110deg, #7f8aa8 0%, #d7deef 40%, #9aa4c0 100%)',
    filter: 'drop-shadow(0 2px 10px rgba(100,120,180,0.5))',
  },
})

const CaptionSub = styled('span')({
  fontFamily: "'Zen Kaku Gothic New', 'Noto Sans JP', sans-serif",
  fontWeight: 700,
  fontSize: 'clamp(13px, 3.4cqmin, 20px)',
  letterSpacing: '0.3em',
  paddingLeft: '0.3em',
  color: '#f5e6c8',
  textShadow: '0 1px 8px rgba(0,0,0,0.6)',
})

const ConfettiPiece = styled('span')({
  position: 'absolute',
  top: 0,
  willChange: 'transform, opacity',
  animation: `${confettiFall} var(--duration) cubic-bezier(0.35, 0.1, 0.6, 1) var(--delay) both`,
  '&[data-shape="petal"]': {
    borderRadius: '100% 0 100% 0',
  },
  '&[data-shape="leaf"]': {
    borderRadius: '1px',
    boxShadow: '0 0 6px rgba(255,215,120,0.6)',
  },
})

const victorySeal: Record<DiscTone, CSSProperties> = {
  red: {
    color: '#fff3e0',
    background:
      'radial-gradient(circle at 30% 25%, #f2604a 0%, #c42a1c 55%, #8a130c 100%)',
    boxShadow:
      '0 12px 48px rgba(210,45,30,0.6), 0 0 0 2px rgba(255,220,200,0.25) inset',
  },
  yellow: {
    color: '#3d2405',
    background:
      'radial-gradient(circle at 30% 25%, #fff0b8 0%, #e6ad2c 55%, #9c6508 100%)',
    boxShadow:
      '0 12px 48px rgba(240,180,40,0.55), 0 0 0 2px rgba(255,250,220,0.35) inset',
  },
}

const defeatSeal: CSSProperties = {
  color: '#d3d9ea',
  background:
    'radial-gradient(circle at 30% 25%, #5d6683 0%, #353c56 60%, #1c2134 100%)',
  boxShadow:
    '0 12px 40px rgba(20,26,50,0.7), 0 0 0 2px rgba(210,220,240,0.15) inset',
}

const confettiPalettes: Record<DiscTone, readonly string[]> = {
  red: [
    'linear-gradient(135deg, #fff1c1, #e8b84a)',
    'linear-gradient(135deg, #f5d27a, #b8862b)',
    '#ff8a7a',
    '#e2483a',
    '#f7c6d0',
  ],
  yellow: [
    'linear-gradient(135deg, #fff1c1, #e8b84a)',
    'linear-gradient(135deg, #f5d27a, #b8862b)',
    '#ffe88a',
    '#f0b428',
    '#f7c6d0',
  ],
}

const SPARK_COUNT = 14
const CONFETTI_COUNT = 56

const sparks = Array.from({ length: SPARK_COUNT }, (_, index) => ({
  angle: `${(360 / SPARK_COUNT) * index}deg`,
  reach: index % 2 === 0 ? 1 : 0.7,
}))

const copy: Record<CelebrationOutcome, { glyph: string; caption: string }> = {
  victory: { glyph: '勝', caption: '天晴れ' },
  defeat: { glyph: '敗', caption: '無念' },
}

type VictoryOverlayProps = {
  celebration: Celebration
}

export function VictoryOverlay({ celebration }: VictoryOverlayProps) {
  const { outcome, tone, label, seed } = celebration
  const prefersReducedMotion = usePrefersReducedMotion()
  const isFestive = outcome === 'victory' && !prefersReducedMotion
  const confetti = useMemo(
    () =>
      isFestive
        ? createConfetti(
            CONFETTI_COUNT,
            confettiPalettes[tone],
            createSeededRandom(seed)
          )
        : [],
    [isFestive, seed, tone]
  )

  return (
    // The result itself is announced by the status banner; this is visual only.
    <Overlay
      aria-hidden="true"
      data-testid="victory-overlay"
      data-outcome={outcome}
    >
      <Backdrop />
      {isFestive && <Sunburst data-testid="victory-sunburst" />}
      <Flash />
      <Shockwave />
      {isFestive &&
        sparks.map(({ angle, reach }) => (
          <Spark
            key={angle}
            style={{ '--angle': angle, '--reach': reach } as CustomCssProperties}
          />
        ))}
      <Seal
        data-testid="victory-seal"
        style={outcome === 'victory' ? victorySeal[tone] : defeatSeal}
      >
        <SealGlyph>{copy[outcome].glyph}</SealGlyph>
      </Seal>
      <Caption>
        <CaptionMain>{copy[outcome].caption}</CaptionMain>
        <CaptionSub>{label}</CaptionSub>
      </Caption>
      {confetti.map((piece) => (
        <ConfettiPiece
          key={piece.id}
          data-testid="confetti-piece"
          data-shape={piece.shape}
          style={
            {
              left: `${piece.left}%`,
              width: `${piece.width}px`,
              height: `${piece.height}px`,
              background: piece.background,
              '--delay': `${950 + piece.delayMs}ms`,
              '--duration': `${piece.durationMs}ms`,
              '--sway': `${piece.swayPx}px`,
              '--spin': `${piece.spinDeg}deg`,
            } as CustomCssProperties
          }
        />
      ))}
    </Overlay>
  )
}
