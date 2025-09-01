export interface Player {
  id: string
  name: string
  team: string
  points: number
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
}

export interface Match {
  id: string
  player1: string
  player2: string | null // null when player has a bye
  player1Goals: number | null
  player2Goals: number | null
  isCompleted: boolean
  isEditing: boolean
  round: string
  // For playoff matches with penalties
  isDraw?: boolean
  penaltyWinner?: string // 'player1' or 'player2' - who won on penalties
}

export interface SavedLeague {
  id: string
  name: string
  players: string[]
  playerTeams: { [key: string]: string }
  createdAt: Date
  isCompleted: boolean
  isRoundTrip: boolean
  matches: Match[]
  playersData: Player[]
  playoffs: Match[]
  playoffStarted?: boolean // Nueva propiedad para controlar si los playoffs han comenzado
  manuallyFinished?: boolean // Nueva propiedad para indicar si la liga fue finalizada manualmente
  champion?: string // Nueva propiedad para el campeón de la liga
}

export interface LeagueStats {
  matchesPlayed: number
  matchesToPlay: number
  mostWinner: Player
  mostLoser: Player
  topScorer: Player
  mostConceded: Player
  bestPositiveStreak: { player: string; streak: number }
  worstNegativeStreak: { player: string; streak: number }
}

export const PREDEFINED_PLAYERS = [
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

export const FOOTBALL_TEAMS = [
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
