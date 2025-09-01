"use client"

import { updatePlayerStats } from '@/lib/league-utils'
import { Match, Player } from '@/lib/types'
import { useState } from 'react'

interface UseLeagueDataReturn {
  players: Player[]
  matches: Match[]
  currentRound: number
  totalRounds: number
  tempResults: { [key: string]: { player1Goals: string; player2Goals: string; penaltyWinner?: string } }
  setPlayers: (players: Player[]) => void
  setMatches: (matches: Match[]) => void
  setCurrentRound: (round: number) => void
  setTotalRounds: (rounds: number) => void
  setTempResults: (results: { [key: string]: { player1Goals: string; player2Goals: string; penaltyWinner?: string } } | ((prev: { [key: string]: { player1Goals: string; player2Goals: string; penaltyWinner?: string } }) => { [key: string]: { player1Goals: string; player2Goals: string; penaltyWinner?: string } })) => void
  getCurrentRoundMatches: () => Match[]
  handleTempResultChange: (matchId: string, player: "player1" | "player2", goals: string) => void
  handlePenaltyWinnerSelect: (matchId: string, winner: "player1" | "player2") => void
  saveResults: () => void
  editMatch: (matchId: string) => void
  updateStats: () => void
}

export function useLeagueData(): UseLeagueDataReturn {
  const [players, setPlayers] = useState<Player[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [currentRound, setCurrentRound] = useState(1)
  const [totalRounds, setTotalRounds] = useState(1)
  const [tempResults, setTempResults] = useState<{ [key: string]: { player1Goals: string; player2Goals: string; penaltyWinner?: string } }>({})

  const getCurrentRoundMatches = () => {
    return matches.filter((match) => match.round === `Round ${currentRound}`)
  }

  const handleTempResultChange = (matchId: string, player: "player1" | "player2", goals: string) => {
    setTempResults((prev) => ({
      ...prev,
      [matchId]: {
        player1Goals: prev[matchId]?.player1Goals || "",
        player2Goals: prev[matchId]?.player2Goals || "",
        penaltyWinner: prev[matchId]?.penaltyWinner || undefined,
        [`${player}Goals`]: goals,
      },
    }))
  }

  const handlePenaltyWinnerSelect = (matchId: string, winner: "player1" | "player2") => {
    setTempResults((prev) => ({
      ...prev,
      [matchId]: {
        player1Goals: prev[matchId]?.player1Goals || "",
        player2Goals: prev[matchId]?.player2Goals || "",
        penaltyWinner: winner,
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
    updateStats(updatedMatches)
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
          penaltyWinner: match.penaltyWinner || undefined,
        },
      }))
    }
  }

  const updateStats = (matchList?: Match[]) => {
    const matchesToUse = matchList || matches
    const updatedPlayers = updatePlayerStats(players, matchesToUse)
    setPlayers(updatedPlayers)
  }

  return {
    players,
    matches,
    currentRound,
    totalRounds,
    tempResults,
    setPlayers,
    setMatches,
    setCurrentRound,
    setTotalRounds,
    setTempResults,
    getCurrentRoundMatches,
    handleTempResultChange,
    handlePenaltyWinnerSelect,
    saveResults,
    editMatch,
    updateStats,
  }
}
