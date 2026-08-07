import { GlobalStyles } from '@mui/material'
import {
  DecoLine,
  DrawText,
  FloatingKanji,
  FooterRow,
  GameCard,
  Header,
  Legend,
  LegendItem,
  MatchSettings,
  MoveNumber,
  Page,
  Pill,
  ResetButton,
  SettingButton,
  SettingLabel,
  SettingRow,
  StatusRow,
  StyledContainer,
  Subtitle,
  Title,
  WinBanner,
  WinText,
} from './App.styles'
import { PlayerDot, AnimatedTurnStatus } from './components/PlayerDot'
import { GameBoard } from './components/board/GameBoard'
import { useGameSession } from './hooks/useGameSession'

function App() {
  const game = useGameSession()

  return (
    <>
      <GlobalStyles
        styles={{
          '*': { boxSizing: 'border-box', margin: 0, padding: 0 },
          body: { margin: 0, background: '#0a0e1a' },
          '@media (prefers-reduced-motion: reduce)': {
            '*, *::before, *::after': {
              animationDuration: '1ms !important',
              animationIterationCount: '1 !important',
              transitionDuration: '1ms !important',
              scrollBehavior: 'auto !important',
            },
            '.is-dropping': {
              transform: 'none !important',
              filter: 'none !important',
            },
          },
        }}
      />
      <Page>
        <StyledContainer maxWidth="md">
          <Header>
            <Title
              variant="h3"
              gutterBottom
              style={{ animation: game.isGameOver ? 'none' : undefined }}
            >
              玉落とし四目並べ
            </Title>
            <Subtitle variant="body1">
              一手ずつ玉を落とし、先に四つ並べた者が勝つ。静かなる攻防を愉しめ。
            </Subtitle>
          </Header>

          <MatchSettings aria-label="対戦設定">
            <SettingRow>
              <SettingLabel>対戦方式</SettingLabel>
              <SettingButton
                selected={game.gameMode === 'local'}
                onClick={() => game.selectGameMode('local')}
                aria-pressed={game.gameMode === 'local'}
              >
                2人で対戦
              </SettingButton>
              <SettingButton
                selected={game.gameMode === 'cpu'}
                onClick={() => game.selectGameMode('cpu')}
                aria-pressed={game.gameMode === 'cpu'}
              >
                CPUと対戦
              </SettingButton>
            </SettingRow>
            {game.gameMode === 'cpu' && (
              <SettingRow aria-label="CPUの強さ">
                <SettingLabel>CPUの強さ</SettingLabel>
                {([
                  [1, 'Lv.1 やさしい'],
                  [2, 'Lv.2 ふつう'],
                  [3, 'Lv.3 むずかしい'],
                  [4, 'Lv.4 さいきょう'],
                ] as const).map(([level, label]) => (
                  <SettingButton
                    key={level}
                    selected={game.cpuDifficulty === level}
                    onClick={() => game.selectCpuDifficulty(level)}
                    aria-pressed={game.cpuDifficulty === level}
                  >
                    {label}
                  </SettingButton>
                ))}
              </SettingRow>
            )}
          </MatchSettings>

          <StatusRow>
            {(!game.winner || game.isAnimating) &&
              (!game.isDraw || game.isAnimating) && (
                <Pill aria-live="polite">
                  <AnimatedTurnStatus
                    player={game.statusPlayer}
                    label={game.statusLabel}
                  />
                </Pill>
              )}
            <Pill style={{ opacity: 0.6 }}>
              <MoveNumber key={game.moveCount}>
                {game.moveCount} 手目
              </MoveNumber>
            </Pill>
          </StatusRow>

          {game.winner && !game.isAnimating && (
            <WinBanner>
              <PlayerDot player={game.winner} size={22} />
              <WinText>
                {game.gameMode === 'cpu'
                  ? game.winner === 'red'
                    ? 'あなたの勝利'
                    : 'CPUの勝利'
                  : `${game.winner === 'red' ? '赤' : '黄'}の勝利`}
              </WinText>
            </WinBanner>
          )}

          {game.isDraw && !game.isAnimating && (
            <WinBanner
              style={{
                borderColor: 'rgba(136,145,168,0.15)',
                background: 'rgba(136,145,168,0.05)',
              }}
            >
              <DrawText>引き分け</DrawText>
            </WinBanner>
          )}

          <GameCard>
            <FloatingKanji
              style={{
                top: '-30px',
                right: '-20px',
                transform: 'rotate(8deg)',
              }}
            >
              勝
            </FloatingKanji>
            <FloatingKanji
              style={{
                bottom: '-20px',
                left: '-15px',
                transform: 'rotate(-12deg)',
                fontSize: '90px',
              }}
            >
              連
            </FloatingKanji>

            <GameBoard
              board={game.board}
              columns={game.columns}
              currentPlayer={game.currentPlayer}
              finishDropAnimation={game.finishDropAnimation}
              handleClick={game.handleClick}
              hoveredColumn={game.hoveredColumn}
              isAnimating={game.isAnimating}
              isBoardLocked={game.isBoardLocked}
              isColumnFull={game.isColumnFull}
              isDraw={game.isDraw}
              lastMove={game.lastMove}
              previewRow={game.previewRow}
              setHoveredColumn={game.setHoveredColumn}
              showWinEmphasis={game.showWinEmphasis}
              winner={game.winner}
              winningCellKeys={game.winningCellKeys}
            />

            <DecoLine />

            <FooterRow>
              <Legend>
                <LegendItem>
                  <PlayerDot player="red" size={12} />
                  {game.gameMode === 'cpu' ? 'あなた' : '赤'}
                </LegendItem>
                <LegendItem>
                  <PlayerDot player="yellow" size={12} />
                  {game.gameMode === 'cpu' ? 'CPU' : '黄'}
                </LegendItem>
              </Legend>
              <ResetButton onClick={game.resetGame}>もう一局</ResetButton>
            </FooterRow>
          </GameCard>
        </StyledContainer>
      </Page>
    </>
  )
}

export default App
