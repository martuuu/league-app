"use client"

import { Button } from "@/components/ui/button"
import { Home, Trophy } from "lucide-react"

interface NavigationProps {
  currentView: "home" | "leagues" | "league"
  onViewChange: (view: "home" | "leagues" | "league") => void
  onCreateNewLeague: () => void
}

export default function Navigation({ currentView, onViewChange, onCreateNewLeague }: NavigationProps) {
  return (
    <header className="bg-card border-b border-border p-4">
      <div className="max-w-7xl mx-auto flex justify-end items-center">
  
        <div className="flex gap-2">
          <Button variant={currentView === "home" ? "default" : "outline"} onClick={onCreateNewLeague}>
            <Home className="h-4 w-4 mr-2" />
            Inicio
          </Button>
          <Button variant={currentView === "leagues" ? "default" : "outline"} onClick={() => onViewChange("leagues")}>
            <Trophy className="h-4 w-4 mr-2" />
            Ligas
          </Button>
        </div>
      </div>
    </header>
  )
}
