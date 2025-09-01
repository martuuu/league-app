"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Shuffle, Trophy } from "lucide-react"

interface TeamAssignmentProps {
  selectedPlayers: string[]
  playerTeams: { [key: string]: string }
  onTeamChange: (playerName: string, teamName: string) => void
  lockedPlayers: string[]
  onTogglePlayerLock: (playerName: string) => void
  onShuffleTeams: () => void
  onBackToSetup: () => void
  onCreateLeague: () => void
}

export default function TeamAssignment({
  selectedPlayers,
  playerTeams,
  onTeamChange,
  lockedPlayers,
  onTogglePlayerLock,
  onShuffleTeams,
  onBackToSetup,
  onCreateLeague,
}: TeamAssignmentProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary flex items-center justify-center gap-2">
            <Trophy className="h-8 w-8" />
            Asignar Equipos
          </CardTitle>
          <p className="text-muted-foreground">Asigna un equipo a cada jugador</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedPlayers.map((player) => (
            <div key={player} className="flex items-center gap-4 p-3 border border-border rounded-lg">
              <div className="font-medium min-w-[120px]">{player}</div>
              <Input
                placeholder="Nombre del equipo"
                value={playerTeams[player] || ""}
                onChange={(e) => onTeamChange(player, e.target.value)}
                className="flex-1"
              />
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`lock-${player}`}
                  checked={lockedPlayers.includes(player)}
                  onCheckedChange={() => onTogglePlayerLock(player)}
                  className="border-2 border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                />
                <label htmlFor={`lock-${player}`} className="text-xs text-muted-foreground">
                  Bloquear
                </label>
              </div>
            </div>
          ))}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onBackToSetup}>
              Volver
            </Button>
            <Button variant="outline" onClick={onShuffleTeams} className="bg-transparent">
              <Shuffle className="h-4 w-4 mr-2" />
              Sortear equipos
            </Button>
            <Button onClick={onCreateLeague}>
              Crear Liga
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
