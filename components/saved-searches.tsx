"use client"

import { useState, useEffect } from "react"
import { Clock, Star, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

interface SavedSearch {
  name: string
  timestamp: string
  filters: any
}

interface SavedSearchesProps {
  setActiveFilters: (filters: any) => void
  setSearchQuery: (query: string) => void
}

export default function SavedSearches({ setActiveFilters, setSearchQuery }: SavedSearchesProps) {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    // Load saved searches from localStorage
    const searches = JSON.parse(localStorage.getItem("savedSearches") || "[]")
    setSavedSearches(searches)

    // Load favorites from localStorage
    const favs = JSON.parse(localStorage.getItem("favoriteSearches") || "[]")
    setFavorites(favs)
  }, [])

  const applySearch = (search: SavedSearch) => {
    setActiveFilters(search.filters)
    setSearchQuery("")
  }

  const deleteSearch = (searchName: string) => {
    const updatedSearches = savedSearches.filter((search) => search.name !== searchName)
    setSavedSearches(updatedSearches)
    localStorage.setItem("savedSearches", JSON.stringify(updatedSearches))

    // Also remove from favorites if it's there
    if (favorites.includes(searchName)) {
      const updatedFavorites = favorites.filter((name) => name !== searchName)
      setFavorites(updatedFavorites)
      localStorage.setItem("favoriteSearches", JSON.stringify(updatedFavorites))
    }
  }

  const toggleFavorite = (searchName: string) => {
    let updatedFavorites

    if (favorites.includes(searchName)) {
      updatedFavorites = favorites.filter((name) => name !== searchName)
    } else {
      updatedFavorites = [...favorites, searchName]
    }

    setFavorites(updatedFavorites)
    localStorage.setItem("favoriteSearches", JSON.stringify(updatedFavorites))
  }

  // Helper function to count active filters
  const countActiveFilters = (filters: any) => {
    let count = 0

    if (filters.departments) count += filters.departments.length
    if (filters.departmentCategories) count += filters.departmentCategories.length
    if (filters.experienceLevels) count += filters.experienceLevels.length
    if (filters.skills) count += filters.skills.length
    if (filters.skillCategories) count += filters.skillCategories.length
    if (filters.languages) count += filters.languages.length
    if (filters.certifications) count += filters.certifications.length
    if (filters.minScore > 0) count += 1
    if (filters.scoreComponents) count += Object.keys(filters.scoreComponents).length

    return count
  }

  // Sort searches: favorites first, then by timestamp
  const sortedSearches = [...savedSearches].sort((a, b) => {
    const aIsFavorite = favorites.includes(a.name)
    const bIsFavorite = favorites.includes(b.name)

    if (aIsFavorite && !bIsFavorite) return -1
    if (!aIsFavorite && bIsFavorite) return 1

    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  })

  if (savedSearches.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">No Saved Searches</h3>
        <p className="text-gray-500 mb-4">Save your search filters for quick access in the future.</p>
        <p className="text-sm text-gray-400">
          Use the "Save Search" button in the Advanced Search panel to save your current filters.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedSearches.map((search, index) => (
        <Card key={index}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{search.name}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => toggleFavorite(search.name)}>
                <Star
                  className={`h-5 w-5 ${
                    favorites.includes(search.name) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                  }`}
                />
              </Button>
            </div>
            <CardDescription className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {formatDistanceToNow(new Date(search.timestamp), { addSuffix: true })}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-sm mb-2">{countActiveFilters(search.filters)} active filters</div>
            <div className="flex flex-wrap gap-1">
              {search.filters.departments.slice(0, 3).map((dept: string) => (
                <Badge key={dept} variant="outline" className="text-xs">
                  {dept}
                </Badge>
              ))}
              {search.filters.skills.slice(0, 3).map((skill: string) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {search.filters.minScore > 0 && (
                <Badge variant="default" className="text-xs">
                  {search.filters.minScore}%+
                </Badge>
              )}
              {countActiveFilters(search.filters) > 6 && (
                <Badge variant="outline" className="text-xs">
                  +{countActiveFilters(search.filters) - 6} more
                </Badge>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-2">
            <Button variant="default" size="sm" onClick={() => applySearch(search)}>
              Apply
            </Button>
            <Button variant="ghost" size="sm" onClick={() => deleteSearch(search.name)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

