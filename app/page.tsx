"use client"

import LeagueSetup from "@/components/league/LeagueSetup"
import LeagueView from "@/components/league/LeagueView"
import Navigation from "@/components/league/Navigation"
import SavedLeagues from "@/components/league/SavedLeagues"
import TeamAssignment from "@/components/league/TeamAssignment"
import { useLeagueData } from "@/hooks/use-league-data"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { generatePlayoffBracket, generateRoundRobinSchedule, updatePlayoffsWithNextPhase } from "@/lib/league-utils"
import { FOOTBALL_TEAMS, Match, PREDEFINED_PLAYERS, SavedLeague } from "@/lib/types"
import { useEffect, useState } from "react"

export default function FifaLeague() {
  const [currentView, setCurrentView] = useState<"home" | "leagues" | "league">("home")
  const [step, setStep] = useState<"setup" | "teams" | "league">("setup")
  
  // League Setup State
  const [playerCount, setPlayerCount] = useState<number>(10)
  const [availablePlayers, setAvailablePlayers] = useState<string[]>(PREDEFINED_PLAYERS)
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([])
  const [playerTeams, setPlayerTeams] = useState<{ [key: string]: string }>({})
  const [lockedPlayers, setLockedPlayers] = useState<string[]>([])
  const [isRoundTrip, setIsRoundTrip] = useState(false)
  const [hasPlayoffs, setHasPlayoffs] = useState(false)
  const [playoffTeams, setPlayoffTeams] = useState(4)
  
  // League Data
  const leagueData = useLeagueData()
  const localStorage = useLocalStorage()
  
  // Playoff State
  const [playoffs, setPlayoffs] = useState<Match[]>([])
  const [playoffStarted, setPlayoffStarted] = useState(false)
  const [currentLeagueId, setCurrentLeagueId] = useState<string | null>(null)

  // Helper function to get current league
  const getCurrentLeague = () => {
    if (!currentLeagueId) return null
    return localStorage.savedLeagues.find(league => league.id === currentLeagueId) || null
  }

  // Helper function to get manuallyFinished state for current league
  const isCurrentLeagueManuallyFinished = () => {
    const currentLeague = getCurrentLeague()
    return currentLeague?.manuallyFinished || false
  }

  // Initialize selected players when playerCount changes
  useEffect(() => {
    const initialSelected = availablePlayers.slice(0, Math.min(playerCount, availablePlayers.length))
    setSelectedPlayers(initialSelected)
  }, [playerCount, availablePlayers])

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

    const { matches, totalRounds } = generateRoundRobinSchedule(selectedPlayers, isRoundTrip)
    
    // Generate initial playoff structure if enabled
    const playoffMatches = hasPlayoffs ? generatePlayoffBracket(newPlayers, playoffTeams) : []

    const newLeague: SavedLeague = {
      id: Date.now().toString(),
      name: `Liga ${localStorage.savedLeagues.length + 1}`,
      players: selectedPlayers,
      playerTeams: { ...playerTeams },
      createdAt: new Date(),
      isCompleted: false,
      isRoundTrip,
      matches,
      playersData: newPlayers,
      playoffs: playoffMatches,
      playoffStarted: false,
    }
    
    localStorage.saveLeagues([...localStorage.savedLeagues, newLeague])
    
    leagueData.setPlayers(newPlayers)
    leagueData.setMatches(matches)
    leagueData.setTotalRounds(totalRounds)
    setPlayoffs(playoffMatches)
    setPlayoffStarted(false)
    setCurrentLeagueId(newLeague.id) // Set current league ID
    
    setStep("league")
    setCurrentView("league")
  }

  const createNewLeague = () => {
    setCurrentView("home")
    setStep("setup")
    setSelectedPlayers([])
    setPlayerTeams({})
    setLockedPlayers([])
    leagueData.setPlayers([])
    leagueData.setMatches([])
    leagueData.setTempResults({})
    leagueData.setCurrentRound(1)
    setHasPlayoffs(false)
    setPlayoffTeams(4)
    setPlayoffs([])
    setPlayoffStarted(false)
    setCurrentLeagueId(null) // Reset current league ID
  }

  const viewLeague = (league: SavedLeague) => {
    setSelectedPlayers(league.players)
    setPlayerTeams(league.playerTeams)
    setIsRoundTrip(league.isRoundTrip)
    leagueData.setMatches(league.matches)
    leagueData.setPlayers(league.playersData)
    setPlayoffs(league.playoffs || [])
    setPlayoffStarted(league.playoffStarted || false)
    setCurrentLeagueId(league.id) // Set current league ID
    // Set hasPlayoffs based on whether the league has playoffs configured
    setHasPlayoffs(league.playoffs && league.playoffs.length > 0)
    setCurrentView("league")
  }

  const finishLeagueAndStartPlayoffs = () => {
    if (!currentLeagueId) return
    
    if (hasPlayoffs && playoffTeams > 0) {
      // Generate playoffs if they were enabled in setup
      const newPlayoffs = generatePlayoffBracket(leagueData.players, playoffTeams)
      setPlayoffs(newPlayoffs)
      
      // Mark league as manually finished for playoffs
      const updatedPlayers = leagueData.players.map(player => ({...player}))
      
      // Update the saved league
      const currentLeague = localStorage.savedLeagues.find(league => 
        league.id === currentLeagueId
      )
      
      if (currentLeague) {
        const updatedLeague = {
          ...currentLeague,
          playoffs: newPlayoffs,
          playoffStarted: false,
          playersData: updatedPlayers,
          matches: leagueData.matches,
          manuallyFinished: true,
        }
        
        const updatedLeagues = localStorage.savedLeagues.map(league => 
          league.id === currentLeague.id ? updatedLeague : league
        )
        localStorage.saveLeagues(updatedLeagues)
      }
    } else {
      // No playoffs enabled - just mark league as finished
      // Update the saved league without playoffs
      const currentLeague = localStorage.savedLeagues.find(league => 
        league.id === currentLeagueId
      )
      
      if (currentLeague) {
        const updatedLeague = {
          ...currentLeague,
          playersData: leagueData.players,
          matches: leagueData.matches,
          manuallyFinished: true,
          isCompleted: true,
        }
        
        const updatedLeagues = localStorage.savedLeagues.map(league => 
          league.id === currentLeague.id ? updatedLeague : league
        )
        localStorage.saveLeagues(updatedLeagues)
      }
    }
  }

  const startPlayoffs = () => {
    setPlayoffStarted(true)
    
    if (!currentLeagueId) return
    
    // Update the saved league
    const currentLeague = localStorage.savedLeagues.find(league => 
      league.id === currentLeagueId
    )
    
    if (currentLeague) {
      const updatedLeague = {
        ...currentLeague,
        playoffStarted: true,
        playersData: leagueData.players,
        matches: leagueData.matches,
      }
      
      const updatedLeagues = localStorage.savedLeagues.map(league => 
        league.id === currentLeague.id ? updatedLeague : league
      )
      localStorage.saveLeagues(updatedLeagues)
    }
  }

  const savePlayoffResults = () => {
    const updatedPlayoffs = playoffs.map((match) => {
      const tempResult = leagueData.tempResults[match.id]
      if (tempResult) {
        const player1Goals = tempResult.player1Goals === "" ? 0 : Number.parseInt(tempResult.player1Goals) || 0
        const player2Goals = tempResult.player2Goals === "" ? 0 : Number.parseInt(tempResult.player2Goals) || 0

        if (player1Goals >= 0 && player2Goals >= 0) {
          const isDraw = player1Goals === player2Goals
          return {
            ...match,
            player1Goals,
            player2Goals,
            isDraw,
            penaltyWinner: isDraw ? tempResult.penaltyWinner : undefined,
            isCompleted: isDraw ? !!tempResult.penaltyWinner : true, // Only complete if penalty winner is selected for draws
            isEditing: false,
          }
        }
      }
      return match
    })

    // Check if we need to generate the next phase
    const finalPlayoffs = updatePlayoffsWithNextPhase(updatedPlayoffs)
    setPlayoffs(finalPlayoffs)
    leagueData.setTempResults({})
    
    // Update the saved league
    if (!currentLeagueId) return
    
    const currentLeague = localStorage.savedLeagues.find(league => 
      league.id === currentLeagueId
    )
    
    if (currentLeague) {
      const updatedLeague = {
        ...currentLeague,
        playoffs: finalPlayoffs,
        playersData: leagueData.players,
        matches: leagueData.matches,
      }
      
      const updatedLeagues = localStorage.savedLeagues.map(league => 
        league.id === currentLeague.id ? updatedLeague : league
      )
      localStorage.saveLeagues(updatedLeagues)
    }
  }

  const editPlayoffMatch = (matchId: string) => {
    const updatedPlayoffs = playoffs.map((match) => 
      match.id === matchId ? { ...match, isEditing: true } : match
    )
    setPlayoffs(updatedPlayoffs)

    const match = playoffs.find((m) => m.id === matchId)
    if (match && match.isCompleted) {
      leagueData.setTempResults((prev: { [key: string]: { player1Goals: string; player2Goals: string; penaltyWinner?: string } }) => ({
        ...prev,
        [matchId]: {
          player1Goals: match.player1Goals?.toString() || "",
          player2Goals: match.player2Goals?.toString() || "",
          penaltyWinner: match.penaltyWinner || undefined,
        },
      }))
    }
  }

  const cancelEditPlayoffMatch = (matchId: string) => {
    const updatedPlayoffs = playoffs.map((match) => 
      match.id === matchId ? { ...match, isEditing: false } : match
    )
    setPlayoffs(updatedPlayoffs)

    // Clear temp results for this match
    leagueData.setTempResults((prev: { [key: string]: { player1Goals: string; player2Goals: string; penaltyWinner?: string } }) => {
      const newResults = { ...prev }
      delete newResults[matchId]
      return newResults
    })
  }

  // Render different views
  if (currentView === "leagues") {
    return (
      <div className="min-h-screen bg-background">
        <Navigation currentView={currentView} onViewChange={setCurrentView} onCreateNewLeague={createNewLeague} />
        <SavedLeagues 
          leagues={localStorage.savedLeagues}
          onViewLeague={viewLeague}
          onDeleteLeague={localStorage.deleteLeague}
        />
      </div>
    )
  }

  if (currentView === "home" && step === "teams") {
    return (
      <div className="min-h-screen bg-background">
        <Navigation currentView={currentView} onViewChange={setCurrentView} onCreateNewLeague={createNewLeague} />
        <TeamAssignment
          selectedPlayers={selectedPlayers}
          playerTeams={playerTeams}
          onTeamChange={handleTeamChange}
          lockedPlayers={lockedPlayers}
          onTogglePlayerLock={togglePlayerLock}
          onShuffleTeams={shuffleTeams}
          onBackToSetup={() => setStep("setup")}
          onCreateLeague={createLeague}
        />
      </div>
    )
  }

  if (currentView === "home" && step === "setup") {
    return (
      <div className="min-h-screen bg-background">
        <Navigation currentView={currentView} onViewChange={setCurrentView} onCreateNewLeague={createNewLeague} />
        <LeagueSetup
          playerCount={playerCount}
          setPlayerCount={setPlayerCount}
          selectedPlayers={selectedPlayers}
          setSelectedPlayers={setSelectedPlayers}
          availablePlayers={availablePlayers}
          setAvailablePlayers={setAvailablePlayers}
          isRoundTrip={isRoundTrip}
          setIsRoundTrip={setIsRoundTrip}
          hasPlayoffs={hasPlayoffs}
          setHasPlayoffs={setHasPlayoffs}
          playoffTeams={playoffTeams}
          setPlayoffTeams={setPlayoffTeams}
          onProceedToTeams={proceedToTeamAssignment}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentView={currentView} onViewChange={setCurrentView} onCreateNewLeague={createNewLeague} />
      <LeagueView
        players={leagueData.players}
        matches={leagueData.matches}
        playoffs={playoffs}
        currentRound={leagueData.currentRound}
        totalRounds={leagueData.totalRounds}
        tempResults={leagueData.tempResults}
        playoffStarted={playoffStarted}
        playoffTeams={playoffTeams}
        hasPlayoffs={hasPlayoffs}
        manuallyFinished={isCurrentLeagueManuallyFinished()}
        onRoundChange={leagueData.setCurrentRound}
        onTempResultChange={leagueData.handleTempResultChange}
        onPenaltyWinnerSelect={leagueData.handlePenaltyWinnerSelect}
        onSaveResults={leagueData.saveResults}
        onEditMatch={leagueData.editMatch}
        onStartPlayoffs={startPlayoffs}
        onSavePlayoffResults={savePlayoffResults}
        onEditPlayoffMatch={editPlayoffMatch}
        onCancelEditPlayoffMatch={cancelEditPlayoffMatch}
        onFinishLeague={finishLeagueAndStartPlayoffs}
      />
    </div>
  )
}
