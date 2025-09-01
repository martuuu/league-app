"use client"

import { SavedLeague } from '@/lib/types'
import { useEffect, useState } from 'react'

interface UseLocalStorageReturn {
  savedLeagues: SavedLeague[]
  setSavedLeagues: (leagues: SavedLeague[]) => void
  loadLeagues: () => void
  saveLeagues: (leagues: SavedLeague[]) => void
  deleteLeague: (leagueId: string) => void
}

export function useLocalStorage(): UseLocalStorageReturn {
  const [savedLeagues, setSavedLeagues] = useState<SavedLeague[]>([])

  const loadLeagues = () => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem("fifaLeagues")
        if (stored) {
          const parsed = JSON.parse(stored)
          // Convert createdAt string back to Date
          const leagues = parsed.map((league: any) => ({
            ...league,
            createdAt: new Date(league.createdAt),
          }))
          setSavedLeagues(leagues)
        }
      } catch (error) {
        console.error("Error loading leagues from localStorage:", error)
      }
    }
  }

  const saveLeagues = (leagues: SavedLeague[]) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem("fifaLeagues", JSON.stringify(leagues))
        setSavedLeagues(leagues)
      } catch (error) {
        console.error("Error saving leagues to localStorage:", error)
      }
    }
  }

  const deleteLeague = (leagueId: string) => {
    const updatedLeagues = savedLeagues.filter((league) => league.id !== leagueId)
    saveLeagues(updatedLeagues)
  }

  useEffect(() => {
    loadLeagues()
  }, [])

  return {
    savedLeagues,
    setSavedLeagues,
    loadLeagues,
    saveLeagues,
    deleteLeague,
  }
}
