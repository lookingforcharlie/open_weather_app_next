// src/app/api/weather/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { ratelimit } from '../../../lib/rateLimiter'
import { WeatherData } from '../../../lib/types'

// API key for OpenWeatherMap
const API_KEY = process.env.OPENWEATHER_API_KEY

export async function GET(request: NextRequest) {
  // Handle rate limiting
  // Without split, you will get multiple ips, and only the first one the real ip, the rest are proxies
  // If do not use split, user can abuse the rate limiter by sending requests behind different proxies
  const ip = (request.headers.get('x-forwarded-for') ?? '127.0.0.1')
    .split(',')[0]
    .trim()
  const { success } = await ratelimit.limit(ip)

  // when use remaining === 0, but feel like exceeded limit more quickly
  if (!success) {
    return NextResponse.json(
      { error: 'You are sending too many requests. Please try again later.' },
      { status: 429 }
    )
  }

  const { searchParams } = new URL(request.url)
  const city = searchParams.get('city')

  if (!API_KEY) {
    return NextResponse.json(
      { error: 'API key not configured' },
      { status: 500 }
    )
  }

  if (!city) {
    return NextResponse.json(
      { error: 'City parameter is required' },
      { status: 400 }
    )
  }

  try {
    // units=metric makes the temperature in Celsius
    const res = await fetch(
      `http://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`
    )

    if (!res.ok) {
      // Handle 404 from OpenWeather API (city not found)
      if (res.status === 404) {
        return NextResponse.json(
          {
            error: `City "${city}" not found. Please check the spelling and try again.`,
          },
          { status: 404 }
        )
      }
      throw new Error(`OpenWeather API error: ${res.status}`)
    }

    const fullData = await res.json()

    // Handle empty array - city not found
    if (Array.isArray(fullData) && fullData.length === 0) {
      return NextResponse.json(
        {
          error: `City "${city}" not found. Please check the spelling and try again.`,
        },
        { status: 404 }
      )
    }

    // Filter the data according to your WeatherData interface
    const filteredData: WeatherData = {
      name: fullData.name,
      main: {
        temp: fullData.main.temp,
        humidity: fullData.main.humidity,
        feels_like: fullData.main.feels_like,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      weather: fullData.weather.map((item: any) => ({
        main: item.main,
        description: item.description,
        icon: item.icon,
      })),
      wind: {
        speed: fullData.wind.speed,
      },
      localDate: new Date(
        (fullData.dt + fullData.timezone) * 1000
      ).toISOString(),
    }

    return NextResponse.json(filteredData)
  } catch (error) {
    console.error('Weather API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    )
  }
}
