import { LeagueStats, Match, Player } from './types'

export const calculateLeagueStats = (players: Player[], matches: Match[]): LeagueStats => {
  const completedMatches = matches.filter((m) => m.isCompleted && m.player2)
  const totalMatches = matches.filter((m) => m.player2).length

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
      .sort((a, b) => parseInt(a.id) - parseInt(b.id))

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

export const isLeagueComplete = (matches: Match[]): boolean => {
  const regularMatches = matches.filter(m => !m.id.startsWith('playoff-') && m.player2)
  return regularMatches.every(match => match.isCompleted)
}
