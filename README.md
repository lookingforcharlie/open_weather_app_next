# Open Weather App NextJS

## Project Set up

- Add Prettier for formatting

- Add settings.json in .vscode to make workplace consistent

- Create server side api routes for call open weather api, to safeguard the api key
- Create reusable Button component
- Introduce Shadcn UI for UI library

- API return value filtered by api and fully typed

  ```
  {
    "name": "Tokoyo",
    "main": {
      "temp": 20.69,
      "humidity": 83,
      "feels_like": 20.98
    },
    "weather": [
      {
        "main": "Clouds",
        "description": "few clouds",
        "icon": "02n"
      }
    ],
    "wind": {
      "speed": 0.33
    },
    localDate: new Date((fullData.dt + fullData.timezone) * 1000).toISOString()
  }
  ```

- Get local date

## [Rate Limiting in Next.js using Upstash](https://upstash.com/blog/nextjs-ratelimiting)

- [Upstash Rate Limiter in GitHub](https://github.com/upstash/ratelimit-js)
- Implemented Rate Limiter on calling Open Weather API

## Exponential/Backoff strategy for handling potential connection issues

- [exponential-backoff npm package](https://www.npmjs.com/package/exponential-backoff)

- Implemented exponential backoff on fetch searching history function
