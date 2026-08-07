import { Button, Container, Typography } from '@mui/material'
import { keyframes, styled } from '@mui/system'

const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
`

const fadeSlideIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`

const winGlow = keyframes`
  0%, 100% { filter: brightness(1) drop-shadow(0 0 8px rgba(255,200,50,0.3)); }
  50%      { filter: brightness(1.15) drop-shadow(0 0 20px rgba(255,200,50,0.6)); }
`

const moveChange = keyframes`
  from { opacity: 0; transform: translateY(3px); }
  to { opacity: 1; transform: translateY(0); }
`

export const Page = styled('div')({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#0a0e1a',
  position: 'relative',
  overflow: 'hidden',
  padding: '32px 16px',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    background:
      'radial-gradient(ellipse 900px 600px at 15% 20%, rgba(88,28,135,0.15), transparent),' +
      'radial-gradient(ellipse 700px 500px at 85% 70%, rgba(30,58,138,0.12), transparent),' +
      'radial-gradient(ellipse 500px 400px at 50% 50%, rgba(120,40,40,0.08), transparent)',
    pointerEvents: 'none',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    backgroundImage:
      `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`,
    pointerEvents: 'none',
    opacity: 0.5,
  },
})

export const StyledContainer = styled(Container)({
  display: 'grid',
  gap: '28px',
  justifyItems: 'center',
  position: 'relative',
  zIndex: 1,
  animation: `${fadeSlideIn} 0.6s ease-out`,
})

export const Header = styled('div')({
  textAlign: 'center',
  maxWidth: '680px',
})

export const Title = styled(Typography)({
  fontFamily: "'Shippori Mincho B1', 'Noto Serif JP', serif",
  fontWeight: 800,
  letterSpacing: '0.08em',
  color: 'transparent',
  backgroundImage:
    'linear-gradient(135deg, #f5e6c8 0%, #e8c77b 40%, #d4a853 60%, #f5e6c8 100%)',
  backgroundSize: '200% auto',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  animation: `${shimmer} 4s ease-in-out infinite`,
  textShadow: 'none',
  position: 'relative',
  '&::after': {
    content: '""',
    display: 'block',
    width: '60px',
    height: '2px',
    background: 'linear-gradient(90deg, transparent, #d4a853, transparent)',
    margin: '12px auto 0',
  },
})

export const Subtitle = styled(Typography)({
  fontFamily: "'Zen Kaku Gothic New', 'Noto Sans JP', sans-serif",
  color: '#8891a8',
  letterSpacing: '0.04em',
  lineHeight: 1.8,
  fontSize: '0.95rem',
})

export const StatusRow = styled('div')({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '14px',
  alignItems: 'center',
  justifyContent: 'center',
})

export const MatchSettings = styled('section')({
  width: 'min(800px, 100%)',
  display: 'grid',
  gap: '12px',
  padding: '16px 20px',
  borderRadius: '16px',
  background: 'rgba(255,255,255,0.025)',
  border: '1px solid rgba(255,255,255,0.05)',
})

export const SettingRow = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexWrap: 'wrap',
  gap: '8px',
})

export const SettingLabel = styled('span')({
  color: '#707a92',
  fontFamily: "'Zen Kaku Gothic New', 'Noto Sans JP', sans-serif",
  fontSize: '0.78rem',
  letterSpacing: '0.06em',
  marginRight: '4px',
})

export const SettingButton = styled(Button)<{ selected?: boolean }>(
  ({ selected }) => ({
    minWidth: 0,
    padding: '7px 14px',
    borderRadius: '10px',
    textTransform: 'none',
    fontFamily: "'Zen Kaku Gothic New', 'Noto Sans JP', sans-serif",
    fontSize: '0.8rem',
    fontWeight: 600,
    color: selected ? '#f1d28c' : '#8d96ab',
    background: selected
      ? 'rgba(212,168,83,0.12)'
      : 'rgba(255,255,255,0.025)',
    border: selected
      ? '1px solid rgba(212,168,83,0.3)'
      : '1px solid rgba(255,255,255,0.05)',
    boxShadow: selected ? '0 0 18px rgba(212,168,83,0.06)' : 'none',
    '&:hover': {
      color: selected ? '#f5dda6' : '#c5cde0',
      background: selected
        ? 'rgba(212,168,83,0.16)'
        : 'rgba(255,255,255,0.06)',
      borderColor: selected
        ? 'rgba(212,168,83,0.4)'
        : 'rgba(255,255,255,0.1)',
    },
  })
)

export const Pill = styled('div')<{ isWinner?: boolean }>(({ isWinner }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '10px',
  padding: '10px 20px',
  borderRadius: '14px',
  background: isWinner
    ? 'linear-gradient(135deg, rgba(255,200,50,0.12), rgba(255,140,50,0.08))'
    : 'rgba(255,255,255,0.04)',
  border: isWinner
    ? '1px solid rgba(255,200,50,0.3)'
    : '1px solid rgba(255,255,255,0.06)',
  backdropFilter: 'blur(12px)',
  color: isWinner ? '#ffd866' : '#c5cde0',
  fontFamily: "'Zen Kaku Gothic New', 'Noto Sans JP', sans-serif",
  fontWeight: 600,
  fontSize: '0.9rem',
  letterSpacing: '0.03em',
  transition: 'all 0.3s ease',
  ...(isWinner && { animation: `${winGlow} 2s ease-in-out infinite` }),
}))

export const MoveNumber = styled('span')({
  display: 'inline-block',
  fontSize: '0.8rem',
  animation: `${moveChange} 160ms ease-out`,
})

export const GameCard = styled('div')({
  width: 'min(800px, 100%)',
  padding: '28px',
  borderRadius: '24px',
  background:
    'linear-gradient(165deg, rgba(20,24,40,0.95) 0%, rgba(12,15,28,0.98) 100%)',
  border: '1px solid rgba(255,255,255,0.05)',
  boxShadow:
    '0 40px 80px rgba(0,0,0,0.5),' +
    '0 0 0 1px rgba(255,255,255,0.03) inset,' +
    '0 1px 0 rgba(255,255,255,0.05) inset',
  display: 'grid',
  gap: '22px',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '200px',
    height: '1px',
    background:
      'linear-gradient(90deg, transparent, rgba(212,168,83,0.4), transparent)',
  },
})

export const FooterRow = styled('div')({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '14px',
  alignItems: 'center',
  justifyContent: 'space-between',
})

export const Legend = styled('div')({
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
  alignItems: 'center',
})

export const LegendItem = styled('div')({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '7px 14px',
  borderRadius: '10px',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.05)',
  color: '#8891a8',
  fontSize: '0.82rem',
  fontFamily: "'Zen Kaku Gothic New', 'Noto Sans JP', sans-serif",
  letterSpacing: '0.02em',
})

export const ResetButton = styled(Button)({
  borderRadius: '12px',
  padding: '10px 28px',
  fontWeight: 700,
  fontFamily: "'Zen Kaku Gothic New', 'Noto Sans JP', sans-serif",
  fontSize: '0.85rem',
  letterSpacing: '0.06em',
  textTransform: 'none',
  background: 'rgba(255,255,255,0.04)',
  color: '#c5cde0',
  border: '1px solid rgba(255,255,255,0.08)',
  transition: 'all 0.25s ease',
  '&:hover': {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    color: '#fff',
  },
})

export const WinBanner = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '16px',
  padding: '20px 32px',
  borderRadius: '16px',
  background:
    'linear-gradient(135deg, rgba(255,200,50,0.08), rgba(255,140,50,0.04))',
  border: '1px solid rgba(255,200,50,0.15)',
  animation: `${fadeSlideIn} 0.5s ease-out`,
  fontFamily: "'Shippori Mincho B1', 'Noto Serif JP', serif",
})

export const WinText = styled(Typography)({
  fontFamily: "'Shippori Mincho B1', 'Noto Serif JP', serif",
  fontWeight: 700,
  color: '#ffd866',
  letterSpacing: '0.1em',
  fontSize: '1.3rem',
})

export const DrawText = styled(Typography)({
  fontFamily: "'Shippori Mincho B1', 'Noto Serif JP', serif",
  fontWeight: 700,
  color: '#8891a8',
  letterSpacing: '0.1em',
  fontSize: '1.1rem',
})

export const DecoLine = styled('div')({
  width: '100%',
  height: '1px',
  background:
    'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 20%, rgba(212,168,83,0.12) 50%, rgba(255,255,255,0.04) 80%, transparent 100%)',
})

export const FloatingKanji = styled('div')({
  position: 'absolute',
  fontFamily: "'Shippori Mincho B1', serif",
  fontSize: '120px',
  fontWeight: 800,
  color: 'rgba(255,255,255,0.012)',
  pointerEvents: 'none',
  userSelect: 'none',
  lineHeight: 1,
})
