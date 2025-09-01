"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SavedLeague } from "@/lib/types"
import { Trash2, Trophy } from "lucide-react"

interface SavedLeaguesProps {
  leagues: SavedLeague[]
  onViewLeague: (league: SavedLeague) => void
  onDeleteLeague: (leagueId: string) => void
}

export default function SavedLeagues({ leagues, onViewLeague, onDeleteLeague }: SavedLeaguesProps) {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Mis Ligas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {leagues.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No hay ligas creadas aún</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {leagues.map((league) => (
                <Card key={league.id} className="border-2">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{league.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {league.players.length} jugadores • {league.isRoundTrip ? "Ida y Vuelta" : "Una Vuelta"}
                      {league.playoffStarted && " • Playoffs iniciados"}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {league.players.slice(0, 3).map((player) => (
                        <Badge key={player} variant="secondary" className="text-xs">
                          {player}
                        </Badge>
                      ))}
                      {league.players.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{league.players.length - 3}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      Creada: {league.createdAt.toLocaleDateString()}
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1" onClick={() => onViewLeague(league)}>
                        Ver Liga
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => onDeleteLeague(league.id)} className="px-3">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
