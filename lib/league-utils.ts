import { Match, Player } from './types'

export const getTeamForPlayer = (playerName: string, playerTeams: { [key: string]: string }) => {
  return playerTeams[playerName] || "Sin Equipo"
}

export const generateRoundRobinSchedule = (playerList: string[], roundTrip = false) => {
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

export const generatePlayoffBracket = (teams: Player[], numTeams: number) => {
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
        player2: "Ganador Cuarto 2", // 1° vs ganador de (4° vs 5°)
        player1Goals: null,
        player2Goals: null,
        isCompleted: false,
        isEditing: false,
        round: "Semifinal",
      },
      {
        id: `playoff-semi2`,
        player1: qualifiedTeams[1].name,
        player2: "Ganador Cuarto 1", // 2° vs ganador de (3° vs 6°)
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

export const updatePlayerStats = (players: Player[], matchList: Match[]) => {
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

  return updatedPlayers
}

export const generateNextPlayoffPhase = (currentPlayoffs: Match[]): Match[] => {
  const updatedMatches: Match[] = []
  
  // Get winners from current completed matches
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

  // Create a map of winners by match ID for easy lookup
  const winners: { [key: string]: string } = {}
  currentPlayoffs.forEach(match => {
    if (match.isCompleted) {
      winners[match.id] = getMatchWinner(match)
    }
  })

  // Update matches that have placeholder opponents
  currentPlayoffs.forEach(match => {
    let updatedMatch = { ...match }
    let needsUpdate = false

    // Replace placeholders with actual winners
    if (match.player1.includes("Ganador")) {
      if (match.player1 === "Ganador Cuarto 1" && winners["playoff-quarter1"]) {
        updatedMatch.player1 = winners["playoff-quarter1"]
        needsUpdate = true
      } else if (match.player1 === "Ganador Cuarto 2" && winners["playoff-quarter2"]) {
        updatedMatch.player1 = winners["playoff-quarter2"]
        needsUpdate = true
      } else if (match.player1 === "Ganador Semi 1" && winners["playoff-semi1"]) {
        updatedMatch.player1 = winners["playoff-semi1"]
        needsUpdate = true
      } else if (match.player1 === "Ganador Semi 2" && winners["playoff-semi2"]) {
        updatedMatch.player1 = winners["playoff-semi2"]
        needsUpdate = true
      }
    }

    if (match.player2 && match.player2.includes("Ganador")) {
      if (match.player2 === "Ganador Cuarto 1" && winners["playoff-quarter1"]) {
        updatedMatch.player2 = winners["playoff-quarter1"]
        needsUpdate = true
      } else if (match.player2 === "Ganador Cuarto 2" && winners["playoff-quarter2"]) {
        updatedMatch.player2 = winners["playoff-quarter2"]
        needsUpdate = true
      } else if (match.player2 === "Ganador Semi 1" && winners["playoff-semi1"]) {
        updatedMatch.player2 = winners["playoff-semi1"]
        needsUpdate = true
      } else if (match.player2 === "Ganador Semi 2" && winners["playoff-semi2"]) {
        updatedMatch.player2 = winners["playoff-semi2"]
        needsUpdate = true
      }
    }

    updatedMatches.push(updatedMatch)
  })

  return updatedMatches
}

export const updatePlayoffsWithNextPhase = (currentPlayoffs: Match[]): Match[] => {
  return generateNextPlayoffPhase(currentPlayoffs)
}
