'use client'

import Image from 'next/image'
import { useState } from 'react'
import Button from '../components/Button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card'
import { WeatherData } from '../lib/types'

export default function Home() {
  const [city, setCity] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<WeatherData | null>(null)

  const handleClick = async (e: React.FormEvent) => {
    e.preventDefault()
    setData(null) // Clear data for new search
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCity(e.target.value)
    setError(null) // Clear error when user types
  }

  // 🎯 Helper function to format the local date
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
      <h1 className="text-4xl font-bold text-amber-500">Open Weather App</h1>

      <div className="w-full max-w-lg space-y-4">
        <form onSubmit={handleClick} className="flex space-x-4">
          <input
            type="text"
            placeholder="Enter city name"
            value={city}
            onChange={handleCityChange}
            className="w-2xl rounded-md border px-4 py-2"
            disabled={loading}
          />
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
          <Card className="w-full max-w-lg bg-white/10 p-6 shadow-lg backdrop-blur-sm">
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
                  <div className="text-sm text-gray-500">Humidity</div>
                  <div className="text-lg font-bold">{data.main.humidity}%</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-sm text-gray-500">Wind</div>
                  <div className="text-lg font-bold">
                    {data.wind.speed} km/h
                  </div>
                </div>
                <div className="flex flex-col items-center">
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
