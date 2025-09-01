"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SavedLeague } from "@/lib/types"
import { Calendar, Crown, Target, TrendingUp, Trophy, Users, Zap } from "lucide-react"

interface GlobalStatsProps {
  leagues: SavedLeague[]
}

export default function GlobalStats({ leagues }: GlobalStatsProps) {
  // Calculate global statistics
  const totalLeagues = leagues.length
  const completedLeagues = leagues.filter(league => league.isCompleted || league.champion).length
  const activeLeagues = totalLeagues - completedLeagues
  
  const totalMatches = leagues.reduce((sum, league) => {
    const regularMatches = league.matches?.length || 0
    const playoffMatches = league.playoffs?.length || 0
    return sum + regularMatches + playoffMatches
  }, 0)
  
  const totalGoals = leagues.reduce((sum, league) => {
    const regularGoals = (league.matches || []).reduce((matchSum, match) => {
      if (match.player1Goals !== null && match.player2Goals !== null) {
        return matchSum + match.player1Goals + match.player2Goals
      }
      return matchSum
    }, 0)
    
    const playoffGoals = (league.playoffs || []).reduce((playoffSum, match) => {
      if (match.player1Goals !== null && match.player2Goals !== null) {
        return playoffSum + match.player1Goals + match.player2Goals
      }
      return playoffSum
    }, 0)
    
    return sum + regularGoals + playoffGoals
  }, 0)

  // Get all unique players across leagues
  const allPlayers = Array.from(new Set(
    leagues.flatMap(league => league.players || [])
  ))
  
  // Find most successful players (by championships)
  const championshipCounts = leagues.reduce((acc, league) => {
    if ((league.isCompleted || league.champion) && league.champion) {
      acc[league.champion] = (acc[league.champion] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)
  
  const topChampions = Object.entries(championshipCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)

  // Calculate average goals per match
  const completedMatches = leagues.reduce((sum, league) => {
    const regularCompleted = (league.matches || []).filter(match => 
      match.player1Goals !== null && match.player2Goals !== null
    ).length
    
    const playoffCompleted = (league.playoffs || []).filter(match => 
      match.player1Goals !== null && match.player2Goals !== null
    ).length
    
    return sum + regularCompleted + playoffCompleted
  }, 0)
  
  const avgGoalsPerMatch = completedMatches > 0 ? (totalGoals / completedMatches).toFixed(1) : "0"

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Estadísticas Globales</h2>
        <p className="text-muted-foreground">Resumen de todas tus ligas</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold">{totalLeagues}</div>
            <p className="text-sm text-muted-foreground">Ligas Totales</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Zap className="h-8 w-8 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-green-600">{activeLeagues}</div>
            <p className="text-sm text-muted-foreground">Ligas Activas</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="h-8 w-8 text-blue-500" />
            </div>
            <div className="text-2xl font-bold">{totalMatches}</div>
            <p className="text-sm text-muted-foreground">Partidos Totales</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
            <div className="text-2xl font-bold">{totalGoals}</div>
            <p className="text-sm text-muted-foreground">Goles Totales</p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Estadísticas Generales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Ligas Completadas</span>
              <Badge variant="secondary">{completedLeagues}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Jugadores Únicos</span>
              <Badge variant="secondary">{allPlayers.length}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Promedio Goles/Partido</span>
              <Badge variant="secondary">{avgGoalsPerMatch}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Partidos Completados</span>
              <Badge variant="secondary">{completedMatches}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Top Champions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Hall of Fame
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topChampions.length > 0 ? (
              <div className="space-y-3">
                {topChampions.map(([player, count], index) => (
                  <div key={player} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        'bg-orange-500 text-white'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="font-medium">{player}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <span className="font-bold">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No hay campeones aún
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      {leagues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Ligas Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {leagues
                .slice(0, 6)
                .map((league) => {
                  const isCompleted = league.isCompleted || !!league.champion
                  return (
                    <div key={league.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium truncate">{league.name}</h4>
                        <Badge variant={isCompleted ? "default" : "secondary"}>
                          {isCompleted ? "Terminada" : "Activa"}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>{league.players?.length || 0} jugadores</p>
                        {league.champion && (
                          <p className="flex items-center gap-1">
                            <Crown className="h-3 w-3" />
                            {league.champion}
                          </p>
                        )}
                        <p>{new Date(league.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
