"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { isLeagueComplete } from "@/lib/stats-utils"
import { Match, Player } from "@/lib/types"
import confetti from "canvas-confetti"
import { Edit, Play, Trophy } from "lucide-react"
import { useEffect } from "react"

interface PlayoffsProps {
  players: Player[]
  matches: Match[]
  playoffs: Match[]
  tempResults: { [key: string]: { player1Goals: string; player2Goals: string; penaltyWinner?: string } }
  playoffStarted: boolean
  playoffTeams: number
  manuallyFinished?: boolean
  onStartPlayoffs: () => void
  onTempResultChange: (matchId: string, player: "player1" | "player2", goals: string) => void
  onPenaltyWinnerSelect: (matchId: string, winner: "player1" | "player2") => void
  onSavePlayoffResults: () => void
  onEditPlayoffMatch: (matchId: string) => void
  onCancelEditPlayoffMatch: (matchId: string) => void
}

export default function Playoffs({
  players,
  matches,
  playoffs,
  tempResults,
  playoffStarted,
  playoffTeams,
  manuallyFinished = false,
  onStartPlayoffs,
  onTempResultChange,
  onPenaltyWinnerSelect,
  onSavePlayoffResults,
  onEditPlayoffMatch,
  onCancelEditPlayoffMatch,
}: PlayoffsProps) {
  const leagueCompleted = isLeagueComplete(matches) || manuallyFinished
  
  // Confetti effect when final is completed - only trigger when match becomes completed
  useEffect(() => {
    const final = playoffs.filter(match => match.round === "Final")
    const isFinalCompleted = final.length > 0 && final.every(match => match.isCompleted)
    
    // Only trigger if there's a final match and it was just completed (not on initial load)
    if (isFinalCompleted && playoffStarted && final.length > 0) {
      // Check if final has actual results (not just initialized)
      const finalMatch = final[0]
      const hasRealResults = finalMatch.player1Goals !== null && finalMatch.player2Goals !== null
      
      if (hasRealResults) {
        // Trigger confetti celebration
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
      }
    }
  }, [playoffs, playoffStarted])
  
  const getPlayoffMatchesByRound = (round: string) => {
    return playoffs.filter(match => match.round === round)
  }

  // Function to get the winner of a match
  const getMatchWinner = (match: Match): string => {
    if (!match.isCompleted || match.player1Goals === null || match.player2Goals === null || !match.player1 || !match.player2) {
      return ""
    }
    
    // If it's a draw and there's a penalty winner, use that
    if (match.isDraw && match.penaltyWinner) {
      return match.penaltyWinner === "player1" ? match.player1 : match.player2
    }
    
    // Otherwise use regular goal comparison
    return match.player1Goals > match.player2Goals ? match.player1 : match.player2
  }

  // Function to resolve player names with winners
  const resolvePlayerName = (playerName: string | null): string => {
    if (!playerName) return "TBD"
    
    if (playerName.includes("Ganador")) {
      if (playerName === "Ganador Cuarto 1") {
        const quarter1 = playoffs.find(m => m.id === "playoff-quarter1")
        return quarter1 ? getMatchWinner(quarter1) || "Ganador Cuarto 1" : "Ganador Cuarto 1"
      }
      if (playerName === "Ganador Cuarto 2") {
        const quarter2 = playoffs.find(m => m.id === "playoff-quarter2")
        return quarter2 ? getMatchWinner(quarter2) || "Ganador Cuarto 2" : "Ganador Cuarto 2"
      }
      if (playerName === "Ganador Semi 1") {
        const semi1 = playoffs.find(m => m.id === "playoff-semi1")
        return semi1 ? getMatchWinner(semi1) || "Ganador Semi 1" : "Ganador Semi 1"
      }
      if (playerName === "Ganador Semi 2") {
        const semi2 = playoffs.find(m => m.id === "playoff-semi2")
        return semi2 ? getMatchWinner(semi2) || "Ganador Semi 2" : "Ganador Semi 2"
      }
    }
    
    return playerName
  }

  const renderPlayoffMatch = (match: Match, index: number) => {
    const tempResult = tempResults[match.id] || { player1Goals: "", player2Goals: "" }
    
    // Find player data to get team names
    const player1Data = players.find(p => p.name === match.player1)
    const player2Data = players.find(p => p.name === match.player2)
    
    // Check if current result is a draw
    const isDraw = match.player1Goals !== null && match.player2Goals !== null && 
                   match.player1Goals === match.player2Goals
    const tempDraw = tempResult.player1Goals !== "" && tempResult.player2Goals !== "" &&
                     Number(tempResult.player1Goals) === Number(tempResult.player2Goals)

    // Determine if this phase has been surpassed (to hide edit buttons)
    const quarters = getPlayoffMatchesByRound("Cuartos")
    const semis = getPlayoffMatchesByRound("Semifinal")
    const final = getPlayoffMatchesByRound("Final")
    
    const areQuartersCompleted = quarters.length > 0 ? quarters.every(match => match.isCompleted) : true
    const areSemisCompleted = semis.length > 0 ? semis.every(match => match.isCompleted) : true
    
    // Check if this match's phase has been surpassed
    let phaseSurpassed = false
    if (match.round === "Cuartos" && areSemisCompleted) {
      // Quarters are surpassed if semifinals are completed
      phaseSurpassed = true
    } else if (match.round === "Semifinal" && final.length > 0 && final.every(m => m.isCompleted)) {
      // Semifinals are surpassed if final is completed
      phaseSurpassed = true
    }

    return (
      <Card key={match.id} className="p-4 bg-card/50 border border-border/50">
        {/* Match Content */}
        <div className="space-y-4 flex flex-col min-h-full">
          <div className="flex justify-between items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{player1Data?.team || "Sin Equipo"}</div>
              <div className="text-xs font-bold text-primary truncate">{match.player1}</div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {match.player1Goals !== null && match.player2Goals !== null && !match.isEditing ? (
                <div className="text-center">
                  <span className="text-lg font-bold bg-muted px-3 py-2 rounded min-w-[60px] inline-block">
                    {match.player1Goals} - {match.player2Goals}
                  </span>
                </div>
              ) : (
                <>
                  <input
                    type="number"
                    value={tempResult.player1Goals}
                    onChange={(e) => onTempResultChange(match.id, "player1", e.target.value)}
                    className="w-12 h-8 text-center border rounded"
                    min="0"
                    placeholder="0"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    value={tempResult.player2Goals}
                    onChange={(e) => onTempResultChange(match.id, "player2", e.target.value)}
                    className="w-12 h-8 text-center border rounded"
                    min="0"
                    placeholder="0"
                  />
                </>
              )}
            </div>
          </div>
          
          <div className="flex justify-between items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{player2Data?.team || "Sin Equipo"}</div>
              <div className="text-xs font-bold text-primary truncate">{match.player2}</div>
            </div>
            <div className="flex-shrink-0 w-[60px]"></div>
          </div>
          
          {/* Penalty winner indication - shown below both teams */}
          {match.isDraw && match.penaltyWinner && match.isCompleted && !match.isEditing && (
            <div className="text-center">
              <div className="text-xs text-primary bg-primary/10 border border-primary/20 rounded px-2 py-1 inline-block font-medium">
                Pasa {match.penaltyWinner === "player1" 
                  ? (player1Data?.team || match.player1) 
                  : (player2Data?.team || match.player2)} por penales
              </div>
            </div>
          )}
          
          {/* Penalty selection for draws - moved below both teams */}
          {(isDraw || tempDraw) && (!match.isCompleted || match.isEditing) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <p className="text-xs text-yellow-700 mb-2 text-center">
                ¡Empate! Selecciona quién ganó por penales:
              </p>
              <div className="flex gap-2 justify-center">
                <Button 
                  size="sm" 
                  variant={tempResult.penaltyWinner === "player1" ? "default" : "outline"}
                  className="text-xs"
                  onClick={() => onPenaltyWinnerSelect(match.id, "player1")}
                >
                  {player1Data?.team || match.player1}
                </Button>
                <Button 
                  size="sm" 
                  variant={tempResult.penaltyWinner === "player2" ? "default" : "outline"}
                  className="text-xs"
                  onClick={() => onPenaltyWinnerSelect(match.id, "player2")}
                >
                  {player2Data?.team || match.player2}
                </Button>
              </div>
            </div>
          )}
          
          {/* Spacer to push button to bottom */}
          <div className="flex-grow"></div>
          
          {/* Edit/Cancel buttons for matches - always at the bottom */}
          {match.isCompleted && !match.isEditing && !phaseSurpassed ? (
            <div className="flex justify-center mt-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditPlayoffMatch(match.id)}
                className="h-5 w-auto px-2 text-xs"
              >
                <Edit className="h-2 w-2 mr-1" />
                Editar
              </Button>
            </div>
          ) : match.isEditing ? (
            <div className="flex gap-2 justify-center mt-auto">
              <Button
                size="sm"
                variant="outline"
                className="h-5 w-auto px-2 text-xs"
                onClick={() => onCancelEditPlayoffMatch(match.id)}
              >
                Cancelar
              </Button>
            </div>
          ) : null}
        </div>
      </Card>
    )
  }

  const renderPlayoffBracket = () => {
    const quarters = getPlayoffMatchesByRound("Cuartos")
    const semis = getPlayoffMatchesByRound("Semifinal")
    const final = getPlayoffMatchesByRound("Final")

    // Check if current phase is completed
    const areQuartersCompleted = quarters.length > 0 ? quarters.every(match => match.isCompleted) : true
    const areSemisCompleted = semis.length > 0 ? semis.every(match => match.isCompleted) : true
    const isFinalCompleted = final.length > 0 ? final.every(match => match.isCompleted) : true

    return (
      <div className="flex flex-col items-center space-y-8">
        {/* Cuartos de final */}
        {quarters.length > 0 && (
          <div>
            <h4 className="text-center font-semibold mb-4">Cuartos de Final</h4>
            <div className={`grid gap-4 justify-center ${
              quarters.length === 4 
                ? "grid-cols-2 lg:grid-cols-4" 
                : quarters.length === 2 
                  ? "grid-cols-1 lg:grid-cols-2" 
                  : "grid-cols-1"
            }`}>
              {quarters.map(renderPlayoffMatch)}
            </div>
            {!areQuartersCompleted && (
              <div className="mt-4 text-center">
                <Button 
                  onClick={onSavePlayoffResults}
                  disabled={!quarters.filter(match => !match.isCompleted).every(match => {
                    const result = tempResults[match.id]
                    if (!result || result.player1Goals === "" || result.player2Goals === "" ||
                        isNaN(Number(result.player1Goals)) || isNaN(Number(result.player2Goals))) {
                      return false
                    }
                    
                    // If it's a draw, penalty winner must be selected
                    const isDraw = Number(result.player1Goals) === Number(result.player2Goals)
                    if (isDraw && !result.penaltyWinner) {
                      return false
                    }
                    
                    return true
                  }) || quarters.filter(match => !match.isCompleted).length === 0}
                >
                  Confirmar Resultados de Cuartos
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Completa todos los partidos para avanzar a Semifinales
                </p>
              </div>
            )}
          </div>
        )}

        {/* Semifinales */}
        {semis.length > 0 && areQuartersCompleted && (
          <div>
            <h4 className="text-center font-semibold mb-4">Semifinales</h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 justify-center">
              {semis.map(renderPlayoffMatch)}
            </div>
            {!areSemisCompleted && (
              <div className="mt-4 text-center">
                <Button 
                  onClick={onSavePlayoffResults}
                  disabled={!semis.filter(match => !match.isCompleted).every(match => {
                    const result = tempResults[match.id]
                    if (!result || result.player1Goals === "" || result.player2Goals === "" ||
                        isNaN(Number(result.player1Goals)) || isNaN(Number(result.player2Goals))) {
                      return false
                    }
                    
                    // If it's a draw, penalty winner must be selected
                    const isDraw = Number(result.player1Goals) === Number(result.player2Goals)
                    if (isDraw && !result.penaltyWinner) {
                      return false
                    }
                    
                    return true
                  }) || semis.filter(match => !match.isCompleted).length === 0}
                >
                  Confirmar Resultados de Semifinales
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Completa todos los partidos para avanzar a la Final
                </p>
              </div>
            )}
          </div>
        )}

        {/* Final */}
        {final.length > 0 && areSemisCompleted && (
          <div>
            <h4 className="text-center font-semibold mb-4">Final</h4>
            <div className="flex justify-center">
              {final.map(renderPlayoffMatch)}
            </div>
            {!isFinalCompleted && (
              <div className="mt-4 text-center">
                <Button 
                  onClick={onSavePlayoffResults}
                  disabled={!final.filter(match => !match.isCompleted).every(match => {
                    const result = tempResults[match.id]
                    if (!result || result.player1Goals === "" || result.player2Goals === "" ||
                        isNaN(Number(result.player1Goals)) || isNaN(Number(result.player2Goals))) {
                      return false
                    }
                    
                    // If it's a draw, penalty winner must be selected
                    const isDraw = Number(result.player1Goals) === Number(result.player2Goals)
                    if (isDraw && !result.penaltyWinner) {
                      return false
                    }
                    
                    return true
                  }) || final.filter(match => !match.isCompleted).length === 0}
                >
                  Confirmar Resultado Final
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Completa la final para determinar el campeón
                </p>
              </div>
            )}
          </div>
        )}

        {/* Champion */}
        {isFinalCompleted && final.length > 0 && (
          <div className="text-center">
            <div className="border border-border rounded-lg p-6">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h2 className="text-xl font-bold mb-1">¡Campeón!</h2>
              <p className="text-lg font-semibold text-primary">
                {final[0].isCompleted && final[0].player1Goals !== null && final[0].player2Goals !== null && final[0].player1 && final[0].player2
                  ? (() => {
                      // Check if it's a draw and there's a penalty winner
                      if (final[0].isDraw && final[0].penaltyWinner) {
                        return final[0].penaltyWinner === "player1" ? final[0].player1 : final[0].player2
                      }
                      // Otherwise use regular goal comparison
                      return final[0].player1Goals > final[0].player2Goals
                        ? final[0].player1
                        : final[0].player2
                    })()
                  : "Pendiente"}
              </p>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (!leagueCompleted && !playoffStarted) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Playoffs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Los playoffs estarán disponibles cuando se complete la fase regular o cuando decidas finalizar la liga manualmente.
            </p>
            <div className="mb-6">
              <h4 className="font-semibold mb-3">Se clasificarán los mejores {playoffTeams} equipos:</h4>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
                {players
                  .slice(0, playoffTeams)
                  .map((player, index) => (
                    <div key={player.id} className="text-center p-2 border border-border rounded bg-blue-50">
                      <div className="text-xs text-muted-foreground font-medium">{index + 1}°</div>
                      <div className="text-sm font-semibold">{player.name}</div>
                      <div className="text-xs text-blue-600">{player.points} pts</div>
                    </div>
                  ))}
              </div>
              
              {/* Mostrar cruces */}
              <div className="text-sm text-muted-foreground bg-gray-50 p-4 rounded-lg">
                <h5 className="font-semibold mb-2">Cruces de playoffs:</h5>
                {playoffTeams === 8 && (
                  <div className="space-y-1">
                    <p><strong>Cuartos:</strong> 1°vs8°, 2°vs7°, 3°vs6°, 4°vs5°</p>
                    <p><strong>Semifinales:</strong> Ganadores de cuartos se enfrentan</p>
                    <p><strong>Final:</strong> Ganadores de semifinales</p>
                  </div>
                )}
                {playoffTeams === 6 && (
                  <div className="space-y-1">
                    <p><strong>Cuartos:</strong> 3°vs6°, 4°vs5° (1° y 2° pasan directo)</p>
                    <p><strong>Semifinales:</strong> 1°vs ganador(4°vs5°), 2°vs ganador(3°vs6°)</p>
                    <p><strong>Final:</strong> Ganadores de semifinales</p>
                  </div>
                )}
                {playoffTeams === 4 && (
                  <div className="space-y-1">
                    <p><strong>Semifinales:</strong> 1°vs4°, 2°vs3°</p>
                    <p><strong>Final:</strong> Ganadores de semifinales</p>
                  </div>
                )}
                {playoffTeams === 2 && (
                  <div className="space-y-1">
                    <p><strong>Final directa:</strong> 1°vs2°</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Playoffs - {playoffTeams} mejores equipos
        </CardTitle>
        {!playoffStarted && (
          <Button onClick={onStartPlayoffs} className="ml-auto">
            <Play className="h-4 w-4 mr-2" />
            Iniciar Playoffs
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {!playoffStarted ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Los playoffs están listos para comenzar con los mejores {playoffTeams} equipos.
            </p>
            <div className="mb-6">
              <h4 className="font-semibold mb-2">Equipos clasificados:</h4>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {players
                  .slice(0, playoffTeams)
                  .map((player, index) => (
                    <div key={player.id} className="text-center p-2 border border-border rounded">
                      <div className="text-xs text-muted-foreground">{index + 1}°</div>
                      <div className="text-sm font-medium">{player.name}</div>
                      <div className="text-xs text-primary">{player.points} pts</div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ) : (
          <div>
            {renderPlayoffBracket()}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
