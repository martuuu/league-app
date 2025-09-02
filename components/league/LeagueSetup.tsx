"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { PREDEFINED_PLAYERS } from "@/lib/types"
import { Plus, Trash2, Users } from "lucide-react"
import { useState } from "react"

interface LeagueSetupProps {
  playerCount: number
  setPlayerCount: (count: number) => void
  selectedPlayers: string[]
  setSelectedPlayers: (players: string[]) => void
  availablePlayers: string[]
  setAvailablePlayers: (players: string[]) => void
  isRoundTrip: boolean
  setIsRoundTrip: (isRoundTrip: boolean) => void
  hasPlayoffs: boolean
  setHasPlayoffs: (hasPlayoffs: boolean) => void
  playoffTeams: number
  setPlayoffTeams: (teams: number) => void
  onProceedToTeams: () => void
}

export default function LeagueSetup({
  playerCount,
  setPlayerCount,
  selectedPlayers,
  setSelectedPlayers,
  availablePlayers,
  setAvailablePlayers,
  isRoundTrip,
  setIsRoundTrip,
  hasPlayoffs,
  setHasPlayoffs,
  playoffTeams,
  setPlayoffTeams,
  onProceedToTeams,
}: LeagueSetupProps) {
  const [newPlayerName, setNewPlayerName] = useState("")

  const addCustomPlayer = () => {
    if (newPlayerName.trim() && !availablePlayers.includes(newPlayerName.trim())) {
      setAvailablePlayers([...availablePlayers, newPlayerName.trim()])
      setNewPlayerName("")
    }
  }

  const togglePlayerSelection = (playerName: string) => {
    if (selectedPlayers.includes(playerName)) {
      setSelectedPlayers(selectedPlayers.filter((p) => p !== playerName))
    } else if (selectedPlayers.length < playerCount) {
      setSelectedPlayers([...selectedPlayers, playerName])
    }
  }

  const removeCustomPlayer = (playerName: string) => {
    if (!PREDEFINED_PLAYERS.includes(playerName)) {
      setAvailablePlayers(availablePlayers.filter((p) => p !== playerName))
      setSelectedPlayers(selectedPlayers.filter((p) => p !== playerName))
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary flex items-center justify-center gap-2">
            Nuevo Torneo
          </CardTitle>
          <p className="text-muted-foreground">Configura tu liga personalizada</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Cantidad de jugadores</label>
            <Input
              type="number"
              min="2"
              max="20"
              value={playerCount}
              onChange={(e) => setPlayerCount(Number.parseInt(e.target.value) || 2)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {(() => {
                const regularMatches = ((playerCount * (playerCount - 1)) / 2) * (isRoundTrip ? 2 : 1)
                let playoffMatches = 0
                
                if (hasPlayoffs) {
                  if (playoffTeams === 2) {
                    playoffMatches = 1 // Solo final
                  } else if (playoffTeams === 4) {
                    playoffMatches = 3 // 2 semifinales + 1 final
                  } else if (playoffTeams === 6) {
                    playoffMatches = 5 // 2 cuartos (4° vs 5°, 3° vs 6°) + 2 semifinales + 1 final
                  } else if (playoffTeams === 8) {
                    playoffMatches = 7 // 4 cuartos + 2 semifinales + 1 final
                  }
                }
                
                const totalMatches = regularMatches + playoffMatches
                const totalHours = Math.round((totalMatches * 20) / 60)
                
                return (
                  <>
                    Tiempo estimado total: {totalHours} horas ({totalMatches} partidos × 20 min c/u)
                    {hasPlayoffs && playoffMatches > 0 && (
                      <span className="block text-xs text-blue-600 mt-1">
                        Incluye {playoffMatches} partido{playoffMatches > 1 ? 's' : ''} de playoffs
                      </span>
                    )}
                  </>
                )
              })()}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="roundTrip"
              checked={isRoundTrip}
              onCheckedChange={(checked: boolean) => setIsRoundTrip(checked)}
              className="border-2 border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
            />
            <label htmlFor="roundTrip" className="text-sm font-medium">
              Liga de Ida y Vuelta (doble fixture)
            </label>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="playoffs"
                checked={hasPlayoffs}
                onCheckedChange={(checked: boolean) => setHasPlayoffs(checked)}
                className="border-2 border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
              />
              <label htmlFor="playoffs" className="text-sm font-medium">
                Incluir fase de Playoffs
              </label>
            </div>

            {hasPlayoffs && (
              <div>
                <label className="text-sm font-medium mb-2 block">Equipos clasificados a Playoffs</label>
                <select
                  value={playoffTeams}
                  onChange={(e) => setPlayoffTeams(Number(e.target.value))}
                  className="w-full p-2 border border-input rounded-md bg-background"
                >
                  <option value={2}>2 equipos (Final directa)</option>
                  <option value={4}>4 equipos (Semifinales + Final)</option>
                  <option value={6}>6 equipos (1° y 2° pasan directo)</option>
                  <option value={8}>8 equipos (Cuartos + Semis + Final)</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Los mejores equipos de la tabla regular clasifican a playoffs
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Seleccionar jugadores ({selectedPlayers.length}/{playerCount})
            </label>

            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mb-4">
              {availablePlayers.map((playerName) => (
                <div key={playerName} className="relative">
                  <Button
                    variant={selectedPlayers.includes(playerName) ? "default" : "outline"}
                    size="sm"
                    onClick={() => togglePlayerSelection(playerName)}
                    className="w-full justify-center text-xs px-2 py-1 h-8"
                    disabled={!selectedPlayers.includes(playerName) && selectedPlayers.length >= playerCount}
                  >
                    {playerName}
                  </Button>
                  {!PREDEFINED_PLAYERS.includes(playerName) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCustomPlayer(playerName)}
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2 max-w-sm">
              <Input
                placeholder="Agregar jugador personalizado"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addCustomPlayer()}
                className="text-sm"
              />
              <Button onClick={addCustomPlayer} variant="outline" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={onProceedToTeams}>
              Continuar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
