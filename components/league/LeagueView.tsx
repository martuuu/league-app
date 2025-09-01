"use client"

import { Button } from "@/components/ui/button"
import { calculateLeagueStats, isLeagueComplete } from "@/lib/stats-utils"
import { Match, Player } from "@/lib/types"
import confetti from "canvas-confetti"
import { Flag, Trophy } from "lucide-react"
import { useEffect } from "react"
import LeagueTable from "./LeagueTable"
import MatchSchedule from "./MatchSchedule"
import PlayerStats from "./PlayerStats"
import Playoffs from "./Playoffs"

interface LeagueViewProps {
  players: Player[]
  matches: Match[]
  playoffs: Match[]
  currentRound: number
  totalRounds: number
  tempResults: { [key: string]: { player1Goals: string; player2Goals: string; penaltyWinner?: string } }
  playoffStarted: boolean
  playoffTeams: number
  hasPlayoffs?: boolean
  manuallyFinished?: boolean
  onRoundChange: (round: number) => void
  onTempResultChange: (matchId: string, player: "player1" | "player2", goals: string) => void
  onPenaltyWinnerSelect: (matchId: string, winner: "player1" | "player2") => void
  onSaveResults: () => void
  onEditMatch: (matchId: string) => void
  onStartPlayoffs: () => void
  onSavePlayoffResults: () => void
  onEditPlayoffMatch: (matchId: string) => void
  onCancelEditPlayoffMatch: (matchId: string) => void
  onFinishLeague: () => void
}

export default function LeagueView({
  players,
  matches,
  playoffs,
  currentRound,
  totalRounds,
  tempResults,
  playoffStarted,
  playoffTeams,
  hasPlayoffs = false,
  manuallyFinished = false,
  onRoundChange,
  onTempResultChange,
  onPenaltyWinnerSelect,
  onSaveResults,
  onEditMatch,
  onStartPlayoffs,
  onSavePlayoffResults,
  onEditPlayoffMatch,
  onCancelEditPlayoffMatch,
  onFinishLeague,
}: LeagueViewProps) {
  const stats = calculateLeagueStats(players, matches)
  const leagueCompleted = isLeagueComplete(matches)

  // Confetti effect when league completes without playoffs - only when actually completed
  useEffect(() => {
    // Only trigger confetti if no playoffs and league is actually completed with results
    if (!hasPlayoffs && (leagueCompleted || manuallyFinished)) {
      // Check if there are actual match results (not just empty league)
      const hasMatchResults = matches.some(match => match.isCompleted && 
        match.player1Goals !== null && match.player2Goals !== null)
      
      if (hasMatchResults && players.length > 0) {
        // Small delay to ensure this runs after the league finishes
        const timer = setTimeout(() => {
          const duration = 3000
          const end = Date.now() + duration

          const frame = () => {
            confetti({
              particleCount: 7,
              angle: 60,
              spread: 55,
              origin: { x: 0 }
            })
            confetti({
              particleCount: 7,
              angle: 120,
              spread: 55,
              origin: { x: 1 }
            })

            if (Date.now() < end) {
              requestAnimationFrame(frame)
            }
          }
          frame()
        }, 500) // Small delay to avoid triggering on page load

        return () => clearTimeout(timer)
      }
    }
  }, [hasPlayoffs, leagueCompleted, manuallyFinished, matches, players])

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Fixture Section - Left side on desktop, first on mobile */}
        <div className="flex-1 lg:max-w-3xl space-y-6 order-1 lg:order-1">
          <MatchSchedule
            currentRound={currentRound}
            totalRounds={totalRounds}
            matches={matches}
            tempResults={tempResults}
            leagueFinished={!hasPlayoffs ? leagueCompleted : manuallyFinished}
            onRoundChange={onRoundChange}
            onTempResultChange={onTempResultChange}
            onSaveResults={onSaveResults}
            onEditMatch={onEditMatch}
          />

          <PlayerStats stats={stats} className="hidden lg:block" />
        </div>

        <div className="flex-1 order-2 lg:order-2 space-y-6">
          <LeagueTable players={players} />
          
          {/* Botón para finalizar liga manualmente */}
          {!playoffStarted && !leagueCompleted && (
            <div className="text-center">
              <Button onClick={onFinishLeague} variant="outline">
                <Flag className="h-4 w-4 mr-2" />
                {hasPlayoffs && playoffTeams > 0 
                  ? "Finalizar Liga e Iniciar Playoffs" 
                  : "Finalizar Liga"
                }
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                {hasPlayoffs && playoffTeams > 0
                  ? "Puedes finalizar la liga en cualquier momento para comenzar los playoffs"
                  : "Puedes finalizar la liga en cualquier momento para declarar al campeón"
                }
              </p>
            </div>
          )}
        </div>
      </div>

      <PlayerStats stats={stats} className="lg:hidden mt-6" />

      {/* Sección de Campeón (cuando no hay playoffs) */}
      {!hasPlayoffs && (leagueCompleted || manuallyFinished) && (
        <div className="mt-6">
          <div className="max-w-md mx-auto">
            <div className="text-center border border-border rounded-lg p-6">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
              <h2 className="text-2xl font-bold mb-2">¡Campeón de la Liga!</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="text-lg font-bold text-yellow-800">
                  {players[0]?.team || "Equipo"}
                </div>
                <div className="text-sm text-yellow-600 mb-2">
                  {players[0]?.name || "Jugador"}
                </div>
                <div className="text-sm text-yellow-700">
                  <strong>{players[0]?.points || 0}</strong> puntos
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sección de Playoffs */}
      {hasPlayoffs && (
        <Playoffs
          players={players}
          matches={matches}
          playoffs={playoffs}
          tempResults={tempResults}
          playoffStarted={playoffStarted}
          playoffTeams={playoffTeams}
          manuallyFinished={manuallyFinished}
          onStartPlayoffs={onStartPlayoffs}
          onTempResultChange={onTempResultChange}
          onPenaltyWinnerSelect={onPenaltyWinnerSelect}
          onSavePlayoffResults={onSavePlayoffResults}
          onEditPlayoffMatch={onEditPlayoffMatch}
          onCancelEditPlayoffMatch={onCancelEditPlayoffMatch}
        />
      )}
    </div>
  )
}
