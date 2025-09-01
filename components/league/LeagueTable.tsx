"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Player } from "@/lib/types"
import { Trophy } from "lucide-react"

interface LeagueTableProps {
  players: Player[]
}

export default function LeagueTable({ players }: LeagueTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Tabla de Posiciones
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-2">#</th>
                <th className="text-left p-2">Jugador</th>
                <th className="text-center p-2">PJ</th>
                <th className="text-center p-2">GF</th>
                <th className="text-center p-2">GC</th>
                <th className="text-center p-2">DG</th>
                <th className="text-center p-2">Pts</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, index) => (
                <tr key={player.id} className="border-b border-border hover:bg-muted/50">
                  <td className="p-2 font-medium">{index + 1}</td>
                  <td className="p-2">
                    <div className="font-medium text-sm">{player.team}</div>
                    <div className="text-xs font-bold text-primary">{player.name}</div>
                  </td>
                  <td className="p-2 text-center">{player.played}</td>
                  <td className="p-2 text-center">{player.goalsFor}</td>
                  <td className="p-2 text-center">{player.goalsAgainst}</td>
                  <td className="p-2 text-center">
                    <span
                      className={
                        player.goalDifference > 0
                          ? "text-green-600"
                          : player.goalDifference < 0
                            ? "text-red-600"
                            : ""
                      }
                    >
                      {player.goalDifference > 0 ? "+" : ""}
                      {player.goalDifference}
                    </span>
                  </td>
                  <td className="p-2 text-center font-bold text-primary">{player.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
