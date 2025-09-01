"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Edit, Trophy, Users, Calendar, Plus, Trash2, Home, ChevronLeft, ChevronRight, Shuffle } from "lucide-react"

interface Player {
  id: string
  name: string
  team: string // Added team property
  points: number
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
}

interface Match {
  id: string
  player1: string
  player2: string | null // null when player has a bye
  player1Goals: number | null
  player2Goals: number | null
  isCompleted: boolean
  isEditing: boolean
  round: string // Added round/fecha tracking
}

interface SavedLeague {
  id: string
  name: string
  players: string[]
  playerTeams: { [key: string]: string } // Added team mapping
  createdAt: Date
  isCompleted: boolean
  isRoundTrip: boolean // Added round trip tracking
  matches: Match[]
  playersData: Player[]
  playoffs: Match[] // Added playoffs tracking
}

const PREDEFINED_PLAYERS = [
  "Tincho",
  "Tata",
  "Bicho",
  "Mosca",
  "Facu",
  "Chaquinha",
  "Zevj",
  "Dani",
  "Nico",
  "Arrobatech",
]

const FOOTBALL_TEAMS = [
  "Real Madrid",
  "Arsenal",
  "Atlético de Madrid",
  "Inter de Milan",
  "Liverpool",
  "Manchester City",
  "Manchester United",
  "Bayern Munich",
  "Juventus",
  "Borussia Dortmund",
]

const getTeamForPlayer = (playerName: string, playerTeams: { [key: string]: string }) => {
  return playerTeams[playerName] || "Sin Equipo"
}

export default function FifaLeague() {
  const [currentView, setCurrentView] = useState<"home" | "leagues" | "league">("home") // Added navigation state
  const [step, setStep] = useState<"setup" | "teams" | "league">("setup") // Added teams step
  const [playerCount, setPlayerCount] = useState<number>(10)
  const [playerNames, setPlayerNames] = useState<string[]>([])
  const [availablePlayers, setAvailablePlayers] = useState<string[]>(PREDEFINED_PLAYERS)
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([])
  const [playerTeams, setPlayerTeams] = useState<{ [key: string]: string }>({}) // Added team assignments
  const [lockedPlayers, setLockedPlayers] = useState<string[]>([])
  const [savedLeagues, setSavedLeagues] = useState<SavedLeague[]>([])
  const [newPlayerName, setNewPlayerName] = useState("")
  const [isRoundTrip, setIsRoundTrip] = useState(false) // Added round trip option
  const [players, setPlayers] = useState<Player[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [tempResults, setTempResults] = useState<{ [key: string]: { player1Goals: string; player2Goals: string } }>({})
  const [currentRound, setCurrentRound] = useState(1) // Added current round tracking
  const [totalRounds, setTotalRounds] = useState(1) // Added total rounds tracking
  const [hasPlayoffs, setHasPlayoffs] = useState(false) // Added playoffs state
  const [playoffTeams, setPlayoffTeams] = useState(4) // Added playoff teams state

  const generateRoundRobinSchedule = (playerList: string[], roundTrip = false) => {
    const players = [...playerList]
    const isOdd = players.length % 2 === 1

    if (isOdd) {
      players.push("BYE") // Add bye for odd number of players
    }

    const totalPlayers = players.length
    const roundsPerCycle = totalPlayers - 1
    const totalCycles = roundTrip ? 2 : 1
    const matches: Match[] = []
    let matchId = 0

    for (let cycle = 0; cycle < totalCycles; cycle++) {
      for (let round = 0; round < roundsPerCycle; round++) {
        const roundNumber = cycle * roundsPerCycle + round + 1

        for (let i = 0; i < totalPlayers / 2; i++) {
          const home = (round + i) % (totalPlayers - 1)
          const away = (totalPlayers - 1 - i + round) % (totalPlayers - 1)

          if (i === 0) {
            // Fixed player always plays
            const player1 = players[totalPlayers - 1]
            const player2 = players[home]

            if (player1 !== "BYE" && player2 !== "BYE") {
              matches.push({
                id: `match-${matchId++}`,
                player1: cycle === 0 ? player1 : player2, // Swap for return leg
                player2: cycle === 0 ? player2 : player1,
                player1Goals: null,
                player2Goals: null,
                isCompleted: false,
                isEditing: false,
                round: `Round ${roundNumber}`,
              })
            }
          } else {
            const player1 = players[home]
            const player2 = players[away]

            if (player1 !== "BYE" && player2 !== "BYE") {
              matches.push({
                id: `match-${matchId++}`,
                player1: cycle === 0 ? player1 : player2, // Swap for return leg
                player2: cycle === 0 ? player2 : player1,
                player1Goals: null,
                player2Goals: null,
                isCompleted: false,
                isEditing: false,
                round: `Round ${roundNumber}`,
              })
            }
          }
        }
      }
    }

    return { matches, totalRounds: roundsPerCycle * totalCycles }
  }

  const generatePlayoffBracket = (teams: Player[], numTeams: number) => {
    const sortedTeams = [...teams].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      const goalDiffA = a.goalsFor - a.goalsAgainst
      const goalDiffB = b.goalsFor - b.goalsAgainst
      if (goalDiffB !== goalDiffA) return goalDiffB - goalDiffA
      return b.goalsFor - a.goalsFor
    })

    const qualifiedTeams = sortedTeams.slice(0, numTeams)
    const playoffMatches: Match[] = []

    if (numTeams === 2) {
      // Final directa
      playoffMatches.push({
        id: `playoff-final`,
        player1: qualifiedTeams[0].name,
        player2: qualifiedTeams[1].name,
        player1Goals: null,
        player2Goals: null,
        isCompleted: false,
        isEditing: false,
        round: "Final",
      })
    } else if (numTeams === 4) {
      // Semifinales: 1°vs4°, 2°vs3°
      playoffMatches.push(
        {
          id: `playoff-semi1`,
          player1: qualifiedTeams[0].name,
          player2: qualifiedTeams[3].name,
          player1Goals: null,
          player2Goals: null,
          isCompleted: false,
          isEditing: false,
          round: "Semifinal",
        },
        {
          id: `playoff-semi2`,
          player1: qualifiedTeams[1].name,
          player2: qualifiedTeams[2].name,
          player1Goals: null,
          player2Goals: null,
          isCompleted: false,
          isEditing: false,
          round: "Semifinal",
        },
        {
          id: `playoff-final`,
          player1: "Ganador Semi 1",
          player2: "Ganador Semi 2",
          player1Goals: null,
          player2Goals: null,
          isCompleted: false,
          isEditing: false,
          round: "Final",
        },
      )
    } else if (numTeams === 6) {
      // 1° y 2° pasan directo, 3°vs6°, 4°vs5°
      playoffMatches.push(
        {
          id: `playoff-quarter1`,
          player1: qualifiedTeams[2].name,
          player2: qualifiedTeams[5].name,
          player1Goals: null,
          player2Goals: null,
          isCompleted: false,
          isEditing: false,
          round: "Cuartos",
        },
        {
          id: `playoff-quarter2`,
          player1: qualifiedTeams[3].name,
          player2: qualifiedTeams[4].name,
          player1Goals: null,
          player2Goals: null,
          isCompleted: false,
          isEditing: false,
          round: "Cuartos",
        },
        {
          id: `playoff-semi1`,
          player1: qualifiedTeams[0].name,
          player2: "Ganador Cuarto 1",
          player1Goals: null,
          player2Goals: null,
          isCompleted: false,
          isEditing: false,
          round: "Semifinal",
        },
        {
          id: `playoff-semi2`,
          player1: qualifiedTeams[1].name,
          player2: "Ganador Cuarto 2",
          player1Goals: null,
          player2Goals: null,
          isCompleted: false,
          isEditing: false,
          round: "Semifinal",
        },
        {
          id: `playoff-final`,
          player1: "Ganador Semi 1",
          player2: "Ganador Semi 2",
          player1Goals: null,
          player2Goals: null,
          isCompleted: false,
          isEditing: false,
          round: "Final",
        },
      )
    } else if (numTeams === 8) {
      // Cuartos: 1°vs8°, 2°vs7°, 3°vs6°, 4°vs5°
      playoffMatches.push(
        {
          id: `playoff-quarter1`,
          player1: qualifiedTeams[0].name,
          player2: qualifiedTeams[7].name,
          player1Goals: null,
          player2Goals: null,
          isCompleted: false,
          isEditing: false,
          round: "Cuartos",
        },
        {
          id: `playoff-quarter2`,
          player1: qualifiedTeams[1].name,
          player2: qualifiedTeams[6].name,
          player1Goals: null,
          player2Goals: null,
          isCompleted: false,
          isEditing: false,
          round: "Cuartos",
        },
        {
          id: `playoff-quarter3`,
          player1: qualifiedTeams[2].name,
          player2: qualifiedTeams[5].name,
          player1Goals: null,
          player2Goals: null,
          isCompleted: false,
          isEditing: false,
          round: "Cuartos",
        },
        {
          id: `playoff-quarter4`,
          player1: qualifiedTeams[3].name,
          player2: qualifiedTeams[4].name,
          player1Goals: null,
          player2Goals: null,
          isCompleted: false,
          isEditing: false,
          round: "Cuartos",
        },
        {
          id: `playoff-semi1`,
          player1: "Ganador Cuarto 1",
          player2: "Ganador Cuarto 2",
          player1Goals: null,
          player2Goals: null,
          isCompleted: false,
          isEditing: false,
          round: "Semifinal",
        },
        {
          id: `playoff-semi2`,
          player1: "Ganador Cuarto 3",
          player2: "Ganador Cuarto 4",
          player1Goals: null,
          player2Goals: null,
          isCompleted: false,
          isEditing: false,
          round: "Semifinal",
        },
        {
          id: `playoff-final`,
          player1: "Ganador Semi 1",
          player2: "Ganador Semi 2",
          player1Goals: null,
          player2Goals: null,
          isCompleted: false,
          isEditing: false,
          round: "Final",
        },
      )
    }

    return playoffMatches
  }

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

  const proceedToTeamAssignment = () => {
    if (selectedPlayers.length !== playerCount) {
      alert(`Por favor selecciona exactamente ${playerCount} jugadores`)
      return
    }

    // Initialize default team assignments
    const defaultTeams: { [key: string]: string } = {}
    selectedPlayers.forEach((player, index) => {
      const playerIndex = PREDEFINED_PLAYERS.indexOf(player)
      if (playerIndex !== -1) {
        defaultTeams[player] = FOOTBALL_TEAMS[playerIndex]
      } else {
        const customIndex = PREDEFINED_PLAYERS.length + selectedPlayers.indexOf(player)
        defaultTeams[player] = FOOTBALL_TEAMS[customIndex % FOOTBALL_TEAMS.length]
      }
    })
    setPlayerTeams(defaultTeams)
    setStep("teams")
  }

  const createLeague = () => {
    if (selectedPlayers.length < 2) {
      alert("Selecciona al menos 2 jugadores")
      return
    }

    const newPlayers = selectedPlayers.map((playerName, index) => ({
      id: `player-${index}`,
      name: playerName,
      team: playerTeams[playerName] || `Equipo ${index + 1}`,
      points: 0,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
    }))

    const newMatches = generateRoundRobinSchedule(selectedPlayers, isRoundTrip)

    // Generate playoffs if enabled
    const playoffMatches = hasPlayoffs ? generatePlayoffBracket(newPlayers, playoffTeams) : []

    const newLeague: SavedLeague = {
      id: Date.now().toString(),
      name: `Liga ${savedLeagues.length + 1}`,
      players: selectedPlayers,
      playerTeams: { ...playerTeams }, // Save team assignments
      createdAt: new Date(),
      isCompleted: false,
      isRoundTrip, // Save round trip setting
      matches: newMatches.matches,
      playersData: newPlayers,
      playoffs: playoffMatches,
    }
    setSavedLeagues([...savedLeagues, newLeague])

    setPlayers(newPlayers)
    setMatches(newMatches.matches)
    setTotalRounds(newMatches.totalRounds) // Set total rounds
    setStep("league")
    setCurrentView("league") // Navigate to league view
  }

  const createNewLeague = () => {
    setCurrentView("home")
    setStep("setup")
    setSelectedPlayers([])
    setPlayerTeams({}) // Reset team assignments
    setPlayers([])
    setMatches([])
    setTempResults({})
    setCurrentRound(1)
    setHasPlayoffs(false) // Reset playoffs setting
    setPlayoffTeams(4) // Reset playoff teams setting
  }

  const handleTeamChange = (playerName: string, teamName: string) => {
    setPlayerTeams((prev) => ({
      ...prev,
      [playerName]: teamName,
    }))
  }

  const shuffleTeams = () => {
    const unlockedPlayers = selectedPlayers.filter((player) => !lockedPlayers.includes(player))
    const availableTeams = FOOTBALL_TEAMS.slice()

    // Remove teams already assigned to locked players
    lockedPlayers.forEach((player) => {
      const teamIndex = availableTeams.indexOf(playerTeams[player])
      if (teamIndex > -1) {
        availableTeams.splice(teamIndex, 1)
      }
    })

    // Shuffle available teams
    for (let i = availableTeams.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[availableTeams[i], availableTeams[j]] = [availableTeams[j], availableTeams[i]]
    }

    // Assign shuffled teams to unlocked players
    const newTeamAssignments = { ...playerTeams }
    unlockedPlayers.forEach((player, index) => {
      if (index < availableTeams.length) {
        newTeamAssignments[player] = availableTeams[index]
      }
    })

    setPlayerTeams(newTeamAssignments)
  }

  const togglePlayerLock = (playerName: string) => {
    if (lockedPlayers.includes(playerName)) {
      setLockedPlayers(lockedPlayers.filter((p) => p !== playerName))
    } else {
      setLockedPlayers([...lockedPlayers, playerName])
    }
  }

  const getCurrentRoundMatches = () => {
    return matches.filter((match) => match.round === `Round ${currentRound}`)
  }

  const handlePlayerNameChange = (index: number, name: string) => {
    const newNames = [...playerNames]
    newNames[index] = name
    setPlayerNames(newNames)
  }

  const handleTempResultChange = (matchId: string, player: "player1" | "player2", goals: string) => {
    setTempResults((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [`${player}Goals`]: goals,
      },
    }))
  }

  const saveResults = () => {
    const updatedMatches = matches.map((match) => {
      const tempResult = tempResults[match.id]
      if (tempResult) {
        const player1Goals = tempResult.player1Goals === "" ? 0 : Number.parseInt(tempResult.player1Goals) || 0
        const player2Goals = tempResult.player2Goals === "" ? 0 : Number.parseInt(tempResult.player2Goals) || 0

        if (player1Goals >= 0 && player2Goals >= 0) {
          return {
            ...match,
            player1Goals,
            player2Goals,
            isCompleted: true,
            isEditing: false,
          }
        }
      }
      return match
    })

    setMatches(updatedMatches)
    updatePlayerStats(updatedMatches)
    setTempResults({})
  }

  const editMatch = (matchId: string) => {
    const updatedMatches = matches.map((match) => (match.id === matchId ? { ...match, isEditing: true } : match))
    setMatches(updatedMatches)

    const match = matches.find((m) => m.id === matchId)
    if (match && match.isCompleted) {
      setTempResults((prev) => ({
        ...prev,
        [matchId]: {
          player1Goals: match.player1Goals?.toString() || "",
          player2Goals: match.player2Goals?.toString() || "",
        },
      }))
    }
  }

  const updatePlayerStats = (matchList: Match[]) => {
    const updatedPlayers = players.map((player) => ({
      ...player,
      points: 0,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
    }))

    matchList.forEach((match) => {
      if (match.isCompleted && match.player1Goals !== null && match.player2Goals !== null && match.player2) {
        const player1 = updatedPlayers.find((p) => p.name === match.player1)
        const player2 = updatedPlayers.find((p) => p.name === match.player2)

        if (player1 && player2) {
          player1.played++
          player2.played++
          player1.goalsFor += match.player1Goals
          player1.goalsAgainst += match.player2Goals
          player2.goalsFor += match.player2Goals
          player2.goalsAgainst += match.player1Goals

          if (match.player1Goals > match.player2Goals) {
            player1.won++
            player1.points += 3
            player2.lost++
          } else if (match.player1Goals < match.player2Goals) {
            player2.won++
            player2.points += 3
            player1.lost++
          } else {
            player1.drawn++
            player2.drawn++
            player1.points += 1
            player2.points += 1
          }

          player1.goalDifference = player1.goalsFor - player1.goalsAgainst
          player2.goalDifference = player2.goalsFor - player2.goalsAgainst
        }
      }
    })

    updatedPlayers.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference
      return b.goalsFor - a.goalsFor
    })

    setPlayers(updatedPlayers)
  }

  const calculateStats = () => {
    const completedMatches = matches.filter((m) => m.isCompleted && m.player2)
    const totalMatches = matches.filter((m) => m.player2).length

    const totalVictories = players.reduce((sum, p) => sum + p.won, 0)
    const totalDraws = players.reduce((sum, p) => sum + p.drawn, 0)
    const totalDefeats = players.reduce((sum, p) => sum + p.lost, 0)

    const mostWinner = players.reduce((prev, current) => (prev.won > current.won ? prev : current), players[0])
    const mostLoser = players.reduce((prev, current) => (prev.lost > current.lost ? prev : current), players[0])
    const topScorer = players.reduce((prev, current) => (prev.goalsFor > current.goalsFor ? prev : current), players[0])
    const mostConceded = players.reduce(
      (prev, current) => (prev.goalsAgainst > current.goalsAgainst ? prev : current),
      players[0],
    )

    // Calculate streaks
    const calculateStreak = (playerName: string, type: "positive" | "negative") => {
      const playerMatches = matches
        .filter((m) => m.isCompleted && (m.player1 === playerName || m.player2 === playerName))
        .sort((a, b) => a.id - b.id)

      let maxStreak = 0
      let currentStreak = 0

      playerMatches.forEach((match) => {
        const isPlayer1 = match.player1 === playerName
        const playerGoals = isPlayer1 ? match.player1Goals! : match.player2Goals!
        const opponentGoals = isPlayer1 ? match.player2Goals! : match.player1Goals!

        const isWinOrDraw = playerGoals >= opponentGoals
        const isLossOrDraw = playerGoals <= opponentGoals

        if ((type === "positive" && isWinOrDraw) || (type === "negative" && isLossOrDraw)) {
          currentStreak++
          maxStreak = Math.max(maxStreak, currentStreak)
        } else {
          currentStreak = 0
        }
      })

      return maxStreak
    }

    const bestPositiveStreak = players.reduce(
      (best, player) => {
        const streak = calculateStreak(player.name, "positive")
        return streak > best.streak ? { player: player.name, streak } : best
      },
      { player: "", streak: 0 },
    )

    const worstNegativeStreak = players.reduce(
      (worst, player) => {
        const streak = calculateStreak(player.name, "negative")
        return streak > worst.streak ? { player: player.name, streak } : worst
      },
      { player: "", streak: 0 },
    )

    return {
      matchesPlayed: completedMatches.length,
      matchesToPlay: totalMatches - completedMatches.length,
      mostWinner,
      mostLoser,
      topScorer,
      mostConceded,
      bestPositiveStreak,
      worstNegativeStreak,
    }
  }

  useEffect(() => {
    const initialSelected = availablePlayers.slice(0, Math.min(playerCount, availablePlayers.length))
    setSelectedPlayers(initialSelected)
  }, [playerCount])

  const renderNavbar = () => (
    <header className="bg-card border-b border-border p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary flex items-center gap-2">Liga Personalizada</h2>
        <div className="flex gap-2">
          <Button variant={currentView === "home" ? "default" : "outline"} onClick={createNewLeague}>
            <Home className="h-4 w-4 mr-2" />
            Inicio
          </Button>
          <Button variant={currentView === "leagues" ? "default" : "outline"} onClick={() => setCurrentView("leagues")}>
            <Trophy className="h-4 w-4 mr-2" />
            Ligas
          </Button>
        </div>
      </div>
    </header>
  )

  const viewLeague = (league: SavedLeague) => {
    setSelectedPlayers(league.players)
    setPlayerTeams(league.playerTeams)
    setIsRoundTrip(league.isRoundTrip)
    setMatches(league.matches)
    setPlayers(league.playersData)
    setCurrentView("league")
  }

  const deleteLeague = (leagueId: string) => {
    const updatedLeagues = savedLeagues.filter((league) => league.id !== leagueId)
    setSavedLeagues(updatedLeagues)
    localStorage.setItem("fifaLeagues", JSON.stringify(updatedLeagues))
  }

  if (currentView === "leagues") {
    return (
      <div className="min-h-screen bg-background">
        {renderNavbar()}
        <div className="max-w-4xl mx-auto p-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Mis Ligas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {savedLeagues.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No hay ligas creadas aún</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedLeagues.map((league) => (
                    <Card key={league.id} className="border-2">
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">{league.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {league.players.length} jugadores • {league.isRoundTrip ? "Ida y Vuelta" : "Una Vuelta"}
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
                          <Button size="sm" className="flex-1" onClick={() => viewLeague(league)}>
                            Ver Liga
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => deleteLeague(league.id)} className="px-3">
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
      </div>
    )
  }

  if (currentView === "home" && step === "teams") {
    return (
      <div className="min-h-screen bg-background">
        {renderNavbar()}
        <div className="max-w-4xl mx-auto p-4 space-y-6">
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
                    onChange={(e) => handleTeamChange(player, e.target.value)}
                    className="flex-1"
                  />
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`lock-${player}`}
                      checked={lockedPlayers.includes(player)}
                      onCheckedChange={() => togglePlayerLock(player)}
                      className="border-2 border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                    />
                    <label htmlFor={`lock-${player}`} className="text-xs text-muted-foreground">
                      Bloquear
                    </label>
                  </div>
                </div>
              ))}

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setStep("setup")} className="flex-1">
                  Volver
                </Button>
                <Button variant="outline" onClick={shuffleTeams} className="flex-1 bg-transparent">
                  <Shuffle className="h-4 w-4 mr-2" />
                  Sortear equipos seleccionados
                </Button>
                <Button onClick={createLeague} className="flex-1" size="lg">
                  Crear Liga
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (currentView === "home" && step === "setup") {
    return (
      <div className="min-h-screen bg-background">
        {renderNavbar()}
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
                  onCheckedChange={(checked) => setIsRoundTrip(checked as boolean)}
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
                    onCheckedChange={(checked) => setHasPlayoffs(checked as boolean)}
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
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
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

              <Button onClick={proceedToTeamAssignment} className="w-full" size="lg">
                Continuar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {renderNavbar()}

      <div className="max-w-7xl mx-auto p-4">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Fixture Section - Left side on desktop, first on mobile */}
          <div className="flex-1 lg:max-w-3xl space-y-6 order-1 lg:order-1">
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
                      onClick={() => setCurrentRound(Math.max(1, currentRound - 1))}
                      disabled={currentRound === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentRound(Math.min(totalRounds, currentRound + 1))}
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
                          {match.isCompleted && !match.isEditing && match.player2 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => editMatch(match.id)}
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
                              value={tempResults[match.id]?.player1Goals || "0"}
                              onChange={(e) => handleTempResultChange(match.id, "player1", e.target.value)}
                              className="w-10 h-6 text-center text-xs border-2 border-primary/20 focus:border-primary px-1"
                              disabled={match.isCompleted && !match.isEditing}
                            />
                            <span className="text-muted-foreground text-xs">-</span>
                            <Input
                              type="number"
                              min="0"
                              placeholder="0"
                              value={tempResults[match.id]?.player2Goals || "0"}
                              onChange={(e) => handleTempResultChange(match.id, "player2", e.target.value)}
                              className="w-10 h-6 text-center text-xs border-2 border-primary/20 focus:border-primary px-1"
                              disabled={match.isCompleted && !match.isEditing}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button onClick={saveResults} className="flex-1">
                    Guardar Resultados
                  </Button>
                </div>
              </CardContent>
            </Card>

            {players.length > 0 && (
              <Card className="hidden lg:block">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">📊 Estadísticas de la Liga</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const stats = calculateStats()
                    return (
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
                            {Math.round((stats.matchesPlayed / (stats.matchesPlayed + stats.matchesToPlay)) * 100) || 0}
                            %
                          </div>
                          <div className="text-xs text-muted-foreground">Liga Completada</div>
                        </div>
                      </div>
                    )
                  })()}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex-1 order-2 lg:order-2">
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
          </div>
        </div>

        {players.length > 0 && (
          <Card className="lg:hidden mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">📊 Estadísticas de la Liga</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const stats = calculateStats()
                return (
                  <div className="grid grid-cols-2 gap-4">
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
                      <div className="text-sm font-bold text-primary truncate">{stats.mostConceded?.name || "-"}</div>
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
                        {Math.round((stats.matchesPlayed / (stats.matchesPlayed + stats.matchesToPlay)) * 100) || 0}%
                      </div>
                      <div className="text-xs text-muted-foreground">Liga Completada</div>
                    </div>
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
