"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { PREDEFINED_PLAYERS } from "@/lib/types"
import { Plus, Trash2, Trophy, Users } from "lucide-react"
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
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary flex items-center justify-center gap-2">
            <Trophy className="h-8 w-8" />
            Nueva Liga
          </CardTitle>
          <p className="text-muted-foreground">Configura tu liga con amigos</p>
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
              Tiempo estimado total:{" "}
              {Math.round((((playerCount * (playerCount - 1)) / 2) * (isRoundTrip ? 2 : 1) * 20) / 60)} horas (
              {((playerCount * (playerCount - 1)) / 2) * (isRoundTrip ? 2 : 1)} partidos × 20 min c/u)
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

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
              {availablePlayers.map((playerName) => (
                <div key={playerName} className="relative">
                  <Button
                    variant={selectedPlayers.includes(playerName) ? "default" : "outline"}
                    size="sm"
                    onClick={() => togglePlayerSelection(playerName)}
                    className="w-full justify-start"
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

            <div className="flex gap-2">
              <Input
                placeholder="Agregar jugador personalizado"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addCustomPlayer()}
              />
              <Button onClick={addCustomPlayer} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Button onClick={onProceedToTeams} className="w-full" size="lg">
            Continuar
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
