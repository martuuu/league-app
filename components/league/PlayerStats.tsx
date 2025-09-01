"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LeagueStats } from "@/lib/types"

interface PlayerStatsProps {
  stats: LeagueStats
  className?: string
}

export default function PlayerStats({ stats, className = "" }: PlayerStatsProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">📊 Estadísticas de la Liga</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-primary">{stats.matchesPlayed}</div>
            <div className="text-xs text-muted-foreground">Partidos Jugados</div>
          </div>

          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-orange-500">{stats.matchesToPlay}</div>
            <div className="text-xs text-muted-foreground">Por Jugarse</div>
          </div>

          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-sm font-bold text-primary truncate">{stats.mostWinner?.name || "-"}</div>
            <div className="text-xs text-muted-foreground">Más Ganador</div>
            <div className="text-xs text-green-600">{stats.mostWinner?.won || 0} victorias</div>
          </div>

          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-sm font-bold text-primary truncate">{stats.mostLoser?.name || "-"}</div>
            <div className="text-xs text-muted-foreground">Más Perdedor</div>
            <div className="text-xs text-red-600">{stats.mostLoser?.lost || 0} derrotas</div>
          </div>

          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-sm font-bold text-primary truncate">{stats.topScorer?.name || "-"}</div>
            <div className="text-xs text-muted-foreground">Más Goleador</div>
            <div className="text-xs text-green-600">{stats.topScorer?.goalsFor || 0} goles</div>
          </div>

          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-sm font-bold text-primary truncate">
              {stats.mostConceded?.name || "-"}
            </div>
            <div className="text-xs text-muted-foreground">Más Goleado</div>
            <div className="text-xs text-red-600">{stats.mostConceded?.goalsAgainst || 0} goles</div>
          </div>

          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-sm font-bold text-primary truncate">
              {stats.bestPositiveStreak.player || "-"}
            </div>
            <div className="text-xs text-muted-foreground">Mejor Racha</div>
            <div className="text-xs text-green-600">{stats.bestPositiveStreak.streak} partidos</div>
          </div>

          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-sm font-bold text-primary truncate">
              {stats.worstNegativeStreak.player || "-"}
            </div>
            <div className="text-xs text-muted-foreground">Peor Racha</div>
            <div className="text-xs text-red-600">{stats.worstNegativeStreak.streak} partidos</div>
          </div>

          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-primary">
              {stats.matchesPlayed + stats.matchesToPlay > 0 
                ? Math.round((stats.matchesPlayed / (stats.matchesPlayed + stats.matchesToPlay)) * 100)
                : 0}%
            </div>
            <div className="text-xs text-muted-foreground">Liga Completada</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
