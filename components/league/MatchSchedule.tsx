"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Match } from "@/lib/types"
import { Calendar, ChevronLeft, ChevronRight, Edit } from "lucide-react"

interface MatchScheduleProps {
  currentRound: number
  totalRounds: number
  matches: Match[]
  tempResults: { [key: string]: { player1Goals: string; player2Goals: string } }
  leagueFinished?: boolean
  onRoundChange: (round: number) => void
  onTempResultChange: (matchId: string, player: "player1" | "player2", goals: string) => void
  onSaveResults: () => void
  onEditMatch: (matchId: string) => void
}

export default function MatchSchedule({
  currentRound,
  totalRounds,
  matches,
  tempResults,
  leagueFinished = false,
  onRoundChange,
  onTempResultChange,
  onSaveResults,
  onEditMatch,
}: MatchScheduleProps) {
  const getCurrentRoundMatches = () => {
    return matches.filter((match) => match.round === `Round ${currentRound}`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <span className="text-lg">
              Fecha {currentRound} de {totalRounds}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRoundChange(Math.max(1, currentRound - 1))}
              disabled={currentRound === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRoundChange(Math.min(totalRounds, currentRound + 1))}
              disabled={currentRound === totalRounds}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {getCurrentRoundMatches().map((match) => (
              <div key={match.id} className="border border-border rounded-lg p-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-medium truncate text-center w-full">
                    {match.player1} vs {match.player2 || "Libre"}
                  </div>
                  {match.isCompleted && !match.isEditing && match.player2 && !leagueFinished && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditMatch(match.id)}
                      className="h-5 w-5 p-0 ml-1 flex-shrink-0"
                    >
                      <Edit className="h-2 w-2" />
                    </Button>
                  )}
                </div>

                {!match.player2 ? (
                  <div className="text-center">
                    <Badge variant="secondary" className="text-xs px-1 py-0.5">
                      Libre
                    </Badge>
                  </div>
                ) : match.isCompleted && !match.isEditing ? (
                  <div className="text-center">
                    <Badge variant="secondary" className="text-xs px-1 py-0.5">
                      {match.player1Goals} - {match.player2Goals}
                    </Badge>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-1">
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={tempResults[match.id]?.player1Goals || ""}
                      onChange={(e) => onTempResultChange(match.id, "player1", e.target.value)}
                      className="w-10 h-6 text-center text-xs border-2 border-primary/20 focus:border-primary px-1 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:opacity-100 [&::-webkit-inner-spin-button]:opacity-100 md:[&::-webkit-outer-spin-button]:hover:opacity-100 md:[&::-webkit-inner-spin-button]:hover:opacity-100 [&::-webkit-outer-spin-button]:md:opacity-0 [&::-webkit-inner-spin-button]:md:opacity-0"
                      disabled={match.isCompleted && !match.isEditing || leagueFinished}
                    />
                    <span className="text-muted-foreground text-xs">-</span>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={tempResults[match.id]?.player2Goals || ""}
                      onChange={(e) => onTempResultChange(match.id, "player2", e.target.value)}
                      className="w-10 h-6 text-center text-xs border-2 border-primary/20 focus:border-primary px-1 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:opacity-100 [&::-webkit-inner-spin-button]:opacity-100 md:[&::-webkit-outer-spin-button]:hover:opacity-100 md:[&::-webkit-inner-spin-button]:hover:opacity-100 [&::-webkit-outer-spin-button]:md:opacity-0 [&::-webkit-inner-spin-button]:md:opacity-0"
                      disabled={match.isCompleted && !match.isEditing || leagueFinished}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button onClick={onSaveResults} disabled={leagueFinished}>
            Guardar Resultados
          </Button>
        </div>
        
        {leagueFinished && (
          <div className="mt-2 text-center">
            <p className="text-xs text-muted-foreground">
              Los resultados de la fase regular están bloqueados - Liga finalizada
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
