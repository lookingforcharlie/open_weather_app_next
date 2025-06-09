'use client'

import { City, type ICity } from 'country-state-city'
import { ChevronsUpDown, Droplet, FanIcon, PersonStanding } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import Button from '../components/Button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card'
import { WeatherData } from '../lib/types'

// Express Backend base url
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4750'

export default function Home() {
  const [city, setCity] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<WeatherData | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)

  const allCities: ICity[] = City.getAllCities()

  // Filter cities based on input and limit to 20 items, or show first 50 when city is empty
  // Behavior can be changed to varied requirement
  const filteredCities =
    city === ''
      ? allCities.slice(0, 50)
      : allCities
          .filter((c) => c.name.toLowerCase().startsWith(city.toLowerCase()))
          .slice(0, 20)

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown)
  }

  // Save search history to backend
  const saveSearchHistory = async (cityName: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/search-history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cityName }),
      })

      if (!response.ok) {
        console.error('Failed to save search history:', response.status)
        return
      }

      const result = await response.json()
      console.log('Search history saved:', result.data)
    } catch (error) {
      console.error('Error saving search history:', error)
      // Don't show error to user - this is a background operation
    }
  }

  const handleClick = async (e: React.FormEvent) => {
    e.preventDefault()
    setCity('')
    setData(null) // Clear data for new search
    setShowDropdown(false) // Hide dropdown when search starts
    if (!city.trim()) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`)
      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || 'Failed to fetch weather data')
      }

      console.log('Received:', result)
      setData(result)

      // Save to search history after successful weather fetch
      await saveSearchHistory(city.trim())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCity(value)
    // Only show dropdown on typing if there's input
    setShowDropdown(value.length > 0)
    setError(null) // Clear error when user types
  }

  const handleCitySelect = (selectedCity: string) => {
    setCity(selectedCity)
    setShowDropdown(false) // Hide dropdown when city is selected
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.city-dropdown-container')) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Helper function to format the local date
  const formatLocalDate = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-items-center gap-12 p-8 pb-20">
      <h1 className="text-4xl font-bold text-amber-600">Open Weather App</h1>

      <div className="w-full max-w-lg space-y-4">
        <div className="mb-10 text-center text-sm text-gray-500">
          The city you searched will be saved in history automatically
        </div>
        <form onSubmit={handleClick} className="flex space-x-4">
          <div className="city-dropdown-container relative w-full">
            <div className="relative">
              <input
                type="text"
                placeholder="Enter city name"
                value={city}
                onChange={handleCityChange}
                className="w-full rounded-md border px-4 py-2 pr-10"
                disabled={loading}
              />
              <button
                type="button"
                onClick={toggleDropdown}
                className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={loading}
              >
                <ChevronsUpDown className="h-5 w-5" />
              </button>
            </div>
            {showDropdown && (
              <div className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow-lg">
                <div className="max-h-[300px] overflow-auto">
                  {filteredCities.length > 0 ? (
                    filteredCities.map((city) => (
                      <div
                        key={`${city.name}-${city.countryCode}-${city.stateCode}`}
                        className="flex cursor-pointer items-center justify-between px-4 py-2 hover:bg-gray-100"
                        onClick={() => handleCitySelect(city.name)}
                      >
                        <div className="font-medium">{city.name}</div>
                        <div className="text-sm text-gray-500">
                          {city.countryCode}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div
                      key="no-cities-found"
                      className="px-4 py-2 text-sm text-gray-500"
                    >
                      No cities found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <Button
            type="submit"
            disabled={loading || !city.trim()}
            className="w-[12rem]"
          >
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </form>
        {error && <div className="text-sm text-red-500">{error}</div>}
      </div>

      <div className="mt-8 flex min-h-[200px] w-full max-w-lg flex-col items-center justify-center">
        {data && (
          <Card className="animate-in fade-in slide-in-from-bottom-4 w-full max-w-lg bg-white/10 p-6 shadow-lg backdrop-blur-sm duration-500">
            <CardHeader>
              <div className="flex items-baseline justify-between">
                <CardTitle className="text-2xl">{data.name}</CardTitle>
                <CardDescription>
                  {formatLocalDate(data.localDate)}
                </CardDescription>
              </div>
              <CardDescription>{data.weather[0].description}</CardDescription>
              <div className="mt-2 flex items-center justify-center gap-2">
                <Image
                  src={`https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`}
                  alt={data.weather[0].description}
                  width={64}
                  height={64}
                  unoptimized
                />
                <div className="text-4xl font-bold">
                  {Math.round(data.main.temp)}°C
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-center">
                  <Droplet className="mb-2 h-6 w-6 text-blue-600" />
                  <div className="text-sm text-gray-500">Humidity</div>
                  <div className="text-lg font-bold">{data.main.humidity}%</div>
                </div>
                <div className="flex flex-col items-center">
                  <FanIcon className="mb-2 h-6 w-6 text-orange-600" />
                  <div className="text-sm text-gray-500">Wind</div>
                  <div className="text-lg font-bold">
                    {data.wind.speed} km/h
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <PersonStanding className="mb-2 h-6 w-6 text-teal-600" />
                  <div className="text-sm text-gray-500">Feels like</div>
                  <div className="text-lg font-bold">
                    {Math.round(data.main.feels_like)}°C
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
